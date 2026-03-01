"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload } from "lucide-react";
import { fetchWithAuth } from "@/lib/api-client";

const MAX_DISCLAIMER = 500;
const DEFAULT_COLOR = "#003366";
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];

type WhiteLabelConfig = {
  id: string;
  partner_id: string;
  firm_name: string;
  logo_url: string | null;
  primary_color_hex: string;
  legal_disclaimer: string | null;
  created_at: string;
  updated_at: string;
};

export default function LegalPartnerSettingsPage() {
  const [config, setConfig] = useState<WhiteLabelConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [firmName, setFirmName] = useState("");
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR);
  const [legalDisclaimer, setLegalDisclaimer] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchWithAuth("/api/legal-partner/white-label-config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: WhiteLabelConfig | null) => {
        if (data) {
          setConfig(data);
          setFirmName(data.firm_name ?? "");
          setPrimaryColor(data.primary_color_hex ?? DEFAULT_COLOR);
          setLegalDisclaimer(data.legal_disclaimer ?? "");
          if (data.logo_url) setLogoPreview(data.logo_url);
        } else {
          setFirmName("");
          setPrimaryColor(DEFAULT_COLOR);
          setLegalDisclaimer("");
        }
      })
      .catch(() => setConfig(null))
      .finally(() => setLoading(false));
  }, []);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Dozwolone formaty: PNG, JPEG, SVG.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError("Plik zbyt duży. Maksymalny rozmiar: 2 MB.");
      return;
    }
    setError(null);
    setLogoUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    fetchWithAuth("/api/legal-partner/upload-logo", {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.detail || "Błąd przesyłania logo.");
          return;
        }
        if (data.logo_url) setLogoPreview(data.logo_url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      })
      .catch(() => setError("Błąd połączenia."))
      .finally(() => setLogoUploading(false));
  }

  function handleSave() {
    setError(null);
    if (!firmName.trim()) {
      setError("Podaj nazwę firmy.");
      return;
    }
    setSaving(true);
    fetchWithAuth("/api/legal-partner/white-label-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firm_name: firmName.trim(),
        primary_color_hex: primaryColor,
        legal_disclaimer: legalDisclaimer.slice(0, MAX_DISCLAIMER) || null,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.detail || "Błąd zapisu.");
          return;
        }
        setConfig(data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      })
      .catch(() => setError("Błąd połączenia."))
      .finally(() => setSaving(false));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-semibold text-primary">Ustawienia brandingu</h1>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Ustawienia brandingu</h1>
        <p className="mt-2 text-muted-foreground">
          Identyfikacja kancelarii i kolorystyka raportów PDF
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-emerald-700 bg-emerald-950/30 text-emerald-100">
          <AlertDescription>Zapisano ustawienia.</AlertDescription>
        </Alert>
      )}

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Identyfikacja kancelarii</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="firm_name">Firma</Label>
            <Input
              id="firm_name"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              placeholder="np. Kancelaria Prawna XYZ"
            />
          </div>
          <div className="grid gap-2">
            <Label>Logo</Label>
            <div className="flex flex-wrap items-center gap-4">
              {logoPreview && (
                <div className="h-20 w-40 overflow-hidden rounded border border-border bg-muted">
                  <img
                    src={logoPreview}
                    alt="Logo kancelarii"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-muted/50">
                <Upload className="size-4" />
                {logoUploading ? "Przesyłanie..." : "Wybierz plik (PNG, SVG, JPEG, max 2 MB)"}
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  disabled={logoUploading}
                  onChange={handleLogoChange}
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Kolorystyka raportu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid gap-2">
              <Label htmlFor="primary_color">Kolor główny nagłówka</Label>
              <div className="flex items-center gap-2">
                <input
                  id="primary_color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-border bg-transparent"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-28 font-mono text-sm"
                  maxLength={7}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Przykładowy kolor nagłówka raportu
            </p>
          </div>
          <div
            className="rounded-md border border-border p-3 text-sm font-medium text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Przykładowy kolor nagłówka raportu
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Klauzula prawna w raporcie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={legalDisclaimer}
            onChange={(e) => setLegalDisclaimer(e.target.value.slice(0, MAX_DISCLAIMER))}
            placeholder="Niniejszy raport ma charakter poglądowy i został przygotowany przez Kancelarię [Nazwa] na podstawie danych dostarczonych przez Klienta..."
            rows={5}
            className="resize-none"
          />
          <p className="text-right text-xs text-muted-foreground">
            {legalDisclaimer.length} / {MAX_DISCLAIMER} znaków
          </p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Podgląd raportu (przykład)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div
              className="mb-3 flex items-center justify-between rounded-t px-3 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="" className="h-8 object-contain" />
              ) : (
                <span className="text-white/90">{firmName || "Nazwa kancelarii"}</span>
              )}
            </div>
            <div className="rounded-b border border-t-0 border-border bg-background p-3 text-xs text-muted-foreground">
              Treść raportu (przykład)…
            </div>
            {legalDisclaimer && (
              <p className="mt-2 border-t border-border pt-2 text-[10px] text-muted-foreground">
                {legalDisclaimer.slice(0, 120)}
                {legalDisclaimer.length > 120 ? "…" : ""}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving && <Loader2 className="size-4 animate-spin" />}
        Zapisz ustawienia brandingu
      </Button>
    </div>
  );
}
