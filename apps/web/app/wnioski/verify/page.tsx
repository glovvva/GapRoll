"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const verify = useCallback(async () => {
    if (!token?.trim()) {
      setStatus("error");
      setMessage("Brak tokenu weryfikacyjnego w adresie.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/employee-requests/verify-by-token", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(data.detail || "Nieprawidłowy lub już wykorzystany link weryfikacyjny.");
        return;
      }

      setStatus("success");
      setMessage(
        data.message ||
          "Twój wniosek został złożony. Pracodawca ma 60 dni na odpowiedź zgodnie z Art. 7 Dyrektywy 2023/970."
      );
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Wystąpił błąd weryfikacji.");
    }
  }, [token]);

  useEffect(() => {
    if (status === "idle" && token !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      verify();
    }
  }, [status, token, verify]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Weryfikacja wniosku</CardTitle>
          <CardDescription>
            Art. 7 Dyrektywy UE 2023/970 — informacja na wniosek pracownika
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Weryfikowanie...</span>
            </div>
          )}

          {status === "success" && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "idle" && !token && (
            <Alert variant="destructive">
              <AlertDescription>Brak tokenu weryfikacyjnego w adresie.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function WniosekVerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
