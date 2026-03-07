"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function getApiBase() {
  if (typeof window === "undefined") return "";
  return "";
}

export default function WniosekFormPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [loadingLink, setLoadingLink] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);

  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeePosition, setEmployeePosition] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    params.then((p) => {
      const t = p.token;
      if (cancelled) return;
      setToken(t);
      if (!t) {
        setLoadingLink(false);
        setLinkError("Brak tokenu w linku.");
        return;
      }
      fetch(`${getApiBase()}/api/employee-requests/public-link?token=${encodeURIComponent(t)}`)
        .then((res) => {
          if (cancelled) return;
          if (!res.ok) {
            if (res.status === 404) setLinkError("Nieprawidłowy lub wygasły link do formularza.");
            else setLinkError("Nie udało się załadować formularza.");
            return;
          }
          return res.json();
        })
        .then((data) => {
          if (cancelled || !data) return;
          setCompanyName(data.company_name || "Pracodawca");
        })
        .catch(() => {
          if (!cancelled) setLinkError("Błąd połączenia.");
        })
        .finally(() => {
          if (!cancelled) setLoadingLink(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token || !employeeName.trim() || !employeeEmail.trim() || !employeePosition.trim()) {
        setSubmitError("Wypełnij wszystkie pola oznaczone gwiazdką.");
        return;
      }

      setSubmitLoading(true);
      setSubmitError(null);

      try {
        const res = await fetch(`${getApiBase()}/api/employee-requests/public`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            employee_name: employeeName.trim(),
            employee_email: employeeEmail.trim().toLowerCase(),
            employee_position: employeePosition.trim(),
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setSubmitError(data.detail || "Nie udało się wysłać formularza.");
          return;
        }

        const verificationToken = data.verification_token;
        const origin = typeof window !== "undefined" ? window.location.origin : "";

        const supabase = createClient();
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: employeeEmail.trim().toLowerCase(),
          options: {
            emailRedirectTo: `${origin}/wnioski/verify?token=${encodeURIComponent(verificationToken)}`,
          },
        });

        if (otpError) {
          setSubmitError(otpError.message || "Nie udało się wysłać linku weryfikacyjnego.");
          return;
        }

        setSuccessMessage(
          "Wysłaliśmy link weryfikacyjny na Twój adres email. Kliknij go, aby złożyć wniosek."
        );
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Wystąpił błąd.");
      } finally {
        setSubmitLoading(false);
      }
    },
    [token, employeeName, employeeEmail, employeePosition]
  );

  if (loadingLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Ładowanie formularza...</span>
        </div>
      </div>
    );
  }

  if (linkError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Błąd linku</CardTitle>
            <CardDescription>{linkError}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sprawdź swoją skrzynkę</CardTitle>
            <CardDescription>{successMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Zgodnie z Art. 7 Dyrektywy UE 2023/970 — po kliknięciu linku wniosek zostanie
              zarejestrowany, a pracodawca ma 60 dni na odpowiedź.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Wniosek o informację (Art. 7)</CardTitle>
          <CardDescription>
            Formularz wniosku pracownika — {companyName}. Zgodnie z Dyrektywą UE 2023/970.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="employee_name">Imię i nazwisko *</Label>
              <Input
                id="employee_name"
                type="text"
                placeholder="Jan Kowalski"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                required
                disabled={submitLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_email">Email służbowy *</Label>
              <Input
                id="employee_email"
                type="email"
                placeholder="jan.kowalski@firma.pl"
                value={employeeEmail}
                onChange={(e) => setEmployeeEmail(e.target.value)}
                required
                disabled={submitLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_position">Stanowisko *</Label>
              <Input
                id="employee_position"
                type="text"
                placeholder="np. Specjalista ds. HR"
                value={employeePosition}
                onChange={(e) => setEmployeePosition(e.target.value)}
                required
                disabled={submitLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitLoading}>
              {submitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                "Wyślij i wyślij link weryfikacyjny na email"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
