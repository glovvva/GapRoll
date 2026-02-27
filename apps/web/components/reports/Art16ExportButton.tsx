"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileDown, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api-client";

const EXPORT_TIMEOUT_MS = 30_000;

export interface Art16ExportButtonProps {
  /** Pre-filled employee count from Art. 16 data */
  employeeCount?: number;
  /** Optional default company name */
  defaultCompanyName?: string;
  /** Optional default KRS */
  defaultKrsNumber?: string;
}

export function Art16ExportButton({
  employeeCount,
  defaultCompanyName = "",
  defaultKrsNumber = "",
}: Art16ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [krsNumber, setKrsNumber] = useState(defaultKrsNumber);
  const [periodStart, setPeriodStart] = useState("2024-01-01");
  const [periodEnd, setPeriodEnd] = useState("2024-12-31");
  const [empCount, setEmpCount] = useState(
    employeeCount != null ? String(employeeCount) : ""
  );

  async function handleExport() {
    setError(null);
    setSuccess(false);
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EXPORT_TIMEOUT_MS);

    try {
      const body = {
        company_name: companyName || "—",
        krs_number: krsNumber || "—",
        reporting_period_start: periodStart,
        reporting_period_end: periodEnd,
        employee_count:
          empCount !== "" ? parseInt(empCount, 10) : undefined,
      };

      const res = await fetchWithAuth("/reports/art16/export", {
        method: "POST",
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const detail = errJson?.detail;
        const msg =
          res.status === 404 && detail
            ? "Brak danych do wygenerowania raportu. Wgraj plik CSV najpierw."
            : typeof detail === "string"
              ? detail
              : res.statusText || "Błąd generowania raportu.";
        setError(msg);
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      let filename = `GapRoll_Art16_${new Date().toISOString().slice(0, 10)}.pdf`;
      if (disposition) {
        const match = /filename="?([^";]+)"?/.exec(disposition);
        if (match) filename = match[1].trim();
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1500);
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error) {
        if (e.name === "AbortError") {
          setError(
            "Generowanie trwa dłużej niż zwykle. Spróbuj ponownie."
          );
        } else {
          setError(e.message || "Wystąpił błąd podczas eksportu.");
        }
      } else {
        setError("Wystąpił błąd podczas eksportu.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="default"
        onClick={() => {
          setError(null);
          setSuccess(false);
          setOpen(true);
        }}
        className="gap-2"
      >
        <FileDown className="h-4 w-4" />
        Pobierz Raport Art. 16 (PDF)
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eksport raportu Art. 16 (PDF)</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company_name">Nazwa firmy</Label>
              <Input
                id="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="np. Firma Test Sp. z o.o."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="krs">Numer KRS</Label>
              <Input
                id="krs"
                value={krsNumber}
                onChange={(e) => setKrsNumber(e.target.value)}
                placeholder="np. 0000123456"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="period_start">Okres od</Label>
                <Input
                  id="period_start"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="period_end">Okres do</Label>
                <Input
                  id="period_end"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employee_count">Liczba pracowników (opcjonalnie)</Label>
              <Input
                id="employee_count"
                type="number"
                min={1}
                value={empCount}
                onChange={(e) => setEmpCount(e.target.value)}
                placeholder={employeeCount != null ? String(employeeCount) : "—"}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>
                  Raport Art. 16 pobrany pomyślnie.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              onClick={handleExport}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generuję raport...
                </>
              ) : (
                "Generuj PDF"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
