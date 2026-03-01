"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchWithAuth } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";

// Partner role is validated only by the backend (POST /api/partner/onboard-client).
// No frontend pre-check — form always allows submit; API returns 403 if not partner.

const NIP_LENGTH = 10;
const MIN_EMPLOYEES = 50;

/** NIP checksum (Poland): https://pl.wikipedia.org/wiki/NIP */
function validateNIP(nip: string): boolean {
  const digits = nip.replace(/\D/g, "");
  if (digits.length !== NIP_LENGTH) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * weights[i];
  }
  const remainder = sum % 11;
  const expected = remainder === 10 ? 0 : remainder;
  return parseInt(digits[9], 10) === expected;
}

type Tier = "compliance" | "strategia";

interface OnboardClientFormProps {
  onSuccess?: () => void;
}

export function OnboardClientForm({ onSuccess }: OnboardClientFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [nip, setNip] = useState("");
  const [email, setEmail] = useState("");
  const [employeeCount, setEmployeeCount] = useState<string>(String(MIN_EMPLOYEES));
  const [tier, setTier] = useState<Tier>("compliance");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Never run a partner check on mount — only the backend validates role on submit.
  // Clear any stale error when form mounts so we don't show a previous API error.
  React.useEffect(() => {
    setError(null);
  }, []);

  const nipValid = nip.replace(/\D/g, "").length === NIP_LENGTH && validateNIP(nip);
  const employees = parseInt(employeeCount, 10);
  const employeeValid = !isNaN(employees) && employees >= MIN_EMPLOYEES;
  const canSubmit =
    companyName.trim().length > 0 &&
    nipValid &&
    email.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    employeeValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      console.log("SESSION DEBUG:", session?.access_token ? "TOKEN OK" : "NO TOKEN", session?.user?.id);
      const res = await fetchWithAuth("/api/partner/onboard-client", {
        method: "POST",
        body: JSON.stringify({
          company_name: companyName.trim(),
          nip: nip.replace(/\D/g, ""),
          email: email.trim(),
          employee_count: employees,
          tier,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail ?? data.message ?? "Błąd zapisu");
      }
      setSuccessMessage(
        `Klient dodany. Email z zaproszeniem wysłany na ${email.trim()}.`
      );
      setCompanyName("");
      setNip("");
      setEmail("");
      setEmployeeCount(String(MIN_EMPLOYEES));
      setTier("compliance");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Dodaj klienta</CardTitle>
        <CardDescription>
          Wypełnij dane firmy i wyślij zaproszenie e-mail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Nazwa firmy</Label>
            <Input
              id="company_name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="np. Biuro Rachunkowe ABC Sp. z o.o."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nip">NIP (10 cyfr)</Label>
            <Input
              id="nip"
              value={nip}
              onChange={(e) => setNip(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="0000000000"
              maxLength={10}
              className="font-mono"
            />
            {nip.length > 0 && !nipValid && (
              <p className="text-xs text-destructive">Nieprawidłowy NIP</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Adres e-mail (zaproszenie)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="klient@firma.pl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee_count">Liczba pracowników (min. {MIN_EMPLOYEES})</Label>
            <Input
              id="employee_count"
              type="number"
              min={MIN_EMPLOYEES}
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
            />
            {!employeeValid && employeeCount.length > 0 && (
              <p className="text-xs text-destructive">Min. {MIN_EMPLOYEES} pracowników</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Tier</Label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tier"
                  value="compliance"
                  checked={tier === "compliance"}
                  onChange={() => setTier("compliance")}
                  className="rounded-full border-input"
                />
                <span className="text-sm">Compliance (99 PLN)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tier"
                  value="strategia"
                  checked={tier === "strategia"}
                  onChange={() => setTier("strategia")}
                  className="rounded-full border-input"
                />
                <span className="text-sm">Strategia (199 PLN)</span>
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {successMessage && (
            <p className="text-sm badge-correct">{successMessage}</p>
          )}
          <Button type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "Wysyłanie…" : "Dodaj klienta i wyślij zaproszenie"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
