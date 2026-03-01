"use client";

import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Upload } from "lucide-react";
import { fetchWithAuth } from "@/lib/api-client";

const BANNED_COLUMNS = [
  "imię",
  "nazwisko",
  "name",
  "surname",
  "pesel",
  "nip pracownika",
  "email",
  "adres",
  "telefon",
  "id_pracownika",
  "employee_id",
];

const ALLOWED_COLUMN_PATTERNS = [
  "płeć",
  "gender",
  "wynagrodzenie",
  "salary",
  "pensja",
  "stanowisko",
  "position",
  "job_title",
  "premia",
  "bonus",
  "składniki_zmienne",
];

function isBannedColumn(header: string): boolean {
  const h = header.toLowerCase().trim();
  return BANNED_COLUMNS.some((b) => h.includes(b.toLowerCase()));
}

function isAllowedColumn(header: string): boolean {
  const h = header.toLowerCase().trim();
  return ALLOWED_COLUMN_PATTERNS.some((p) => h.includes(p.toLowerCase()));
}

function nipChecksumValid(nip: string): boolean {
  const digits = nip.replace(/\D/g, "");
  if (digits.length !== 10) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * weights[i];
  const remainder = sum % 11;
  const check = remainder === 10 ? 0 : remainder;
  return parseInt(digits[9], 10) === check;
}

export function NewAuditModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [clientName, setClientName] = useState("");
  const [clientNip, setClientNip] = useState("");
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [useTokenLoading, setUseTokenLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditSessionId, setAuditSessionId] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [removedColumns, setRemovedColumns] = useState<string[]>([]);
  const [anonymizedRows, setAnonymizedRows] = useState<Record<string, unknown>[] | null>(null);
  const [generateLoading, setGenerateLoading] = useState(false);

  const nipDigits = clientNip.replace(/\D/g, "");
  const nipValid = nipDigits.length === 10 && nipChecksumValid(nipDigits);

  const loadBalance = useCallback(() => {
    setLoadingBalance(true);
    fetchWithAuth("/api/legal-partner/token-balance")
      .then((res) => res.json())
      .then((data) => setTokenBalance(data.tokens_available ?? 0))
      .catch(() => setTokenBalance(null))
      .finally(() => setLoadingBalance(false));
  }, []);

  useEffect(() => {
    if (open) {
      loadBalance();
      setStep(1);
      setClientName("");
      setClientNip("");
      setError(null);
      setAuditSessionId(null);
      setCsvFile(null);
      setRemovedColumns([]);
      setAnonymizedRows(null);
    }
  }, [open, loadBalance]);

  function handleUseToken() {
    setError(null);
    if (!clientName.trim()) {
      setError("Podaj nazwę firmy klienta.");
      return;
    }
    if (!nipValid) {
      setError("Podaj prawidłowy NIP (10 cyfr, poprawna suma kontrolna).");
      return;
    }
    setUseTokenLoading(true);
    fetchWithAuth("/api/legal-partner/use-token", {
      method: "POST",
      body: JSON.stringify({
        client_company_name: clientName.trim(),
        client_nip: nipDigits,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.status === 402) {
          setError("Brak dostępnych tokenów. Doładuj pakiet.");
          return;
        }
        if (!res.ok) {
          setError(data.detail || data.message || "Błąd zużycia tokenu.");
          return;
        }
        setAuditSessionId(data.audit_session_id ?? null);
        setTokenBalance(data.tokens_remaining ?? 0);
        setStep(2);
      })
      .catch(() => setError("Błąd połączenia. Spróbuj ponownie."))
      .finally(() => setUseTokenLoading(false));
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith(".csv")) processFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function processFile(file: File) {
    setCsvFile(file);
    setError(null);
    setRemovedColumns([]);
    setAnonymizedRows(null);

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as Record<string, string>[];
          if (!rows.length || !results.meta.fields?.length) {
            setError("Plik CSV jest pusty lub nie zawiera nagłówków.");
            return;
          }
          const headers = results.meta.fields;
          const toRemove = headers.filter((h) => isBannedColumn(h));
          const toKeep = headers.filter((h) => !isBannedColumn(h) && isAllowedColumn(h));
          if (toRemove.length) setRemovedColumns(toRemove);

          const allowedSet = new Set(toKeep.length ? toKeep : headers.filter((h) => !isBannedColumn(h)));
          const out: Record<string, unknown>[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row: Record<string, unknown> = {};
            for (const key of allowedSet) {
              const val = rows[i][key];
              if (val === undefined || val === null) {
                row[key] = null;
                continue;
              }
              const s = String(val).trim();
              const num = parseFloat(s.replace(",", "."));
              if (!Number.isNaN(num) && s !== "") {
                row[key] = num;
              } else if (s === "") {
                row[key] = null;
              } else {
                row[key] = i + 1;
              }
            }
            out.push(row);
          }
          setAnonymizedRows(out);
        },
      });
    };
    reader.readAsText(file, "UTF-8");
  }

  function handleGenerateReport() {
    if (!auditSessionId || !anonymizedRows?.length) return;
    setGenerateLoading(true);
    setError(null);
    fetchWithAuth("/api/legal-partner/submit-audit-data", {
      method: "POST",
      body: JSON.stringify({ audit_session_id: auditSessionId, rows: anonymizedRows }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.detail || "Nie udało się wysłać danych. Skontaktuj się z GapRoll: bartek@gaproll.eu");
          return;
        }
        onSuccess?.();
        onOpenChange(false);
      })
      .catch(() =>
        setError("Błąd połączenia. Skontaktuj się z GapRoll: bartek@gaproll.eu")
      )
      .finally(() => setGenerateLoading(false));
  }

  const tokensAvailable = tokenBalance ?? 0;
  const noTokens = !loadingBalance && tokensAvailable <= 0 && step === 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Identyfikacja klienta" : "Wgraj dane płacowe klienta"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client_name">Nazwa firmy klienta</Label>
              <Input
                id="client_name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="np. Firma Sp. z o.o."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client_nip">NIP klienta</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="client_nip"
                  value={clientNip}
                  onChange={(e) => setClientNip(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10 cyfr"
                  maxLength={10}
                  className="font-mono"
                />
                {nipDigits.length === 10 && (
                  nipValid ? (
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-hidden />
                  ) : (
                    <span className="text-destructive text-sm">Nieprawidłowa suma kontrolna</span>
                  )
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Jeden token audytowy zostanie wykorzystany po zatwierdzeniu.
            </p>
            <p className="text-sm font-medium">
              Pozostało tokenów: {loadingBalance ? "—" : tokensAvailable}
            </p>
            {noTokens && (
              <Alert variant="destructive">
                <AlertDescription>
                  Brak tokenów. Skontaktuj się z GapRoll: bartek@gaproll.eu
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={useTokenLoading}>
                Anuluj
              </Button>
              <Button
                onClick={handleUseToken}
                disabled={useTokenLoading || noTokens || !clientName.trim() || !nipValid}
                className="gap-2"
              >
                {useTokenLoading && <Loader2 className="size-4 animate-spin" />}
                Zatwierdź i zużyj token
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Przeciągnij plik CSV lub wybierz z dysku. Dane zostaną zanonimizowane w przeglądarce.
            </p>
            <div
              className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-6 transition-colors hover:border-muted-foreground/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById("legal-audit-csv")?.click()}
            >
              <input
                id="legal-audit-csv"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Upload className="size-8 text-muted-foreground" />
              <span className="mt-2 text-sm text-muted-foreground">
                {csvFile ? csvFile.name : "Wybierz plik CSV"}
              </span>
            </div>
            {removedColumns.length > 0 && (
              <Alert className="border-amber-700 bg-amber-950/30">
                <AlertDescription>
                  Wykryto i usunięto kolumny z danymi osobowymi: {removedColumns.join(", ")}
                </AlertDescription>
              </Alert>
            )}
            {anonymizedRows !== null && anonymizedRows.length > 0 && (
              <>
                <Badge className="bg-emerald-600 text-white border-0">
                  Dane zanonimizowane — gotowe do analizy
                </Badge>
                <DialogFooter>
                  {error && (
                    <Alert variant="destructive" className="col-span-2">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep(1);
                      setCsvFile(null);
                      setAnonymizedRows(null);
                      setRemovedColumns([]);
                    }}
                    disabled={generateLoading}
                  >
                    Wstecz
                  </Button>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={generateLoading}
                    className="gap-2"
                  >
                    {generateLoading && <Loader2 className="size-4 animate-spin" />}
                    Generuj raport audytowy
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
