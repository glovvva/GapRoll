"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, FileText, Send, CheckCircle, ExternalLink } from "lucide-react";
import { fetchWithAuthCached } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";

interface EvgGroup {
  id: string;
  name: string;
}

interface Calculation {
  id: string;
  employee_salary: number | null;
  median_female: number | null;
  median_male: number | null;
  gap_percent: number | null;
  n_female: number;
  n_male: number;
  rodo_masked: boolean;
  evg_group_id: string | null;
}

interface RequestDetail {
  id: string;
  organization_id: string;
  employee_name: string;
  employee_email: string | null;
  employee_position: string | null;
  evg_group_id: string | null;
  source: string;
  submitted_channel: string;
  status: string;
  deadline_at: string | null;
  created_at: string;
  updated_at?: string;
  pdf_url: string | null;
  sent_at?: string | null;
  latest_calculation: Calculation | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Nowy",
  in_review: "W trakcie",
  approved: "Do wysłania",
  sent: "Wysłany",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatPLN(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(value);
}

export default function WniosekDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [evgGroups, setEvgGroups] = useState<EvgGroup[]>([]);
  const [selectedEvgId, setSelectedEvgId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [grazynaEmail, setGrazynaEmail] = useState<string>("");

  const fetchRequest = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchWithAuthCached(`/api/employee-requests/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Nie udało się załadować wniosku.");
        return res.json();
      })
      .then((data) => {
        setRequest(data);
        setSelectedEvgId(data.evg_group_id ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Błąd"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  useEffect(() => {
    fetchWithAuthCached("/api/employee-requests/evg-groups")
      .then((res) => res.ok ? res.json() : { evg_groups: [] })
      .then((data) => setEvgGroups(data.evg_groups || []))
      .catch(() => setEvgGroups([]));
  }, []);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setGrazynaEmail(data.user?.email ?? "");
    });
  }, []);

  async function handleAssignAndCalculate() {
    if (!id || !selectedEvgId) return;
    setCalculating(true);
    setError(null);
    try {
      const patchRes = await fetchWithAuthCached(`/api/employee-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evg_group_id: selectedEvgId }),
      });
      if (!patchRes.ok) {
        const d = await patchRes.json().catch(() => ({}));
        throw new Error(d.detail || "Błąd przypisania grupy EVG.");
      }
      const calcRes = await fetchWithAuthCached(`/api/employee-requests/${id}/calculate`, {
        method: "POST",
      });
      if (!calcRes.ok) {
        const d = await calcRes.json().catch(() => ({}));
        throw new Error(d.detail || "Błąd obliczeń.");
      }
      fetchRequest();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd");
    } finally {
      setCalculating(false);
    }
  }

  async function handleGeneratePdf() {
    if (!id) return;
    setGeneratingPdf(true);
    setError(null);
    try {
      const res = await fetchWithAuthCached(`/api/employee-requests/${id}/generate-pdf`, {
        method: "POST",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Błąd generowania PDF.");
      }
      fetchRequest();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd");
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function handleConfirmSend() {
    if (!id) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetchWithAuthCached(`/api/employee-requests/${id}/send`, {
        method: "POST",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Błąd wysyłki.");
      }
      setSendModalOpen(false);
      fetchRequest();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd");
    } finally {
      setSending(false);
    }
  }

  if (loading || !request) {
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Ładowanie wniosku...</span>
      </div>
    );
  }

  const calc = request.latest_calculation;
  const hasPdf = !!request.pdf_url;
  const isSent = request.status === "sent";
  const canSend = hasPdf && !isSent;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/wnioski" className="hover:underline">
          Skrzynka wniosków
        </Link>
        <span>/</span>
        <span>Wniosek — {request.employee_name}</span>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sekcja A — Dane wniosku */}
      <Card>
        <CardHeader>
          <CardTitle>Dane wniosku</CardTitle>
          <CardDescription>Informacje o wnioskodawcy i złożeniu (Art. 7 Dyrektywy 2023/970)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Wnioskodawca:</span>
            <span>{request.employee_name}</span>
            <span className="text-muted-foreground">Email:</span>
            <span>{request.employee_email ?? "—"}</span>
            <span className="text-muted-foreground">Stanowisko:</span>
            <span>{request.employee_position ?? "—"}</span>
            <span className="text-muted-foreground">Data złożenia:</span>
            <span>{formatDate(request.created_at)}</span>
            <span className="text-muted-foreground">Termin odpowiedzi:</span>
            <span>{formatDate(request.deadline_at)} (60 dni — Art. 7 ust. 4)</span>
            <span className="text-muted-foreground">Kanał złożenia:</span>
            <span>{request.source === "manual" ? request.submitted_channel : "online"}</span>
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="outline">{STATUS_LABELS[request.status] ?? request.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sekcja B — Przypisanie EVG */}
      {request.evg_group_id === null && (
        <Card>
          <CardHeader>
            <CardTitle>Przypisanie grupy EVG</CardTitle>
            <CardDescription>
              Wybierz kategorię wartościowania stanowiska i wykonaj obliczenia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Grupa EVG</Label>
              <Select value={selectedEvgId} onValueChange={setSelectedEvgId}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz grupę" />
                </SelectTrigger>
                <SelectContent>
                  {evgGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAssignAndCalculate}
              disabled={!selectedEvgId || calculating}
            >
              {calculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Przypisz i oblicz
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sekcja C — Wyniki obliczeń */}
      {calc && (
        <Card>
          <CardHeader>
            <CardTitle>Wyniki obliczeń</CardTitle>
            <CardDescription>Mediana wynagrodzeń i luka płacowa w kategorii EVG</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {calc.rodo_masked ? (
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertDescription>
                  Dane wygaszone — RODO (zbyt mała grupa pracowników w kategorii). Zgodnie z Art. 5 Rozporządzenia RODO 2016/679 nie ujawniamy wartości, gdy grupa jest mniejsza niż 3 osoby.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Wynagrodzenie pracownika:</span>
                <span>{formatPLN(calc.employee_salary)}</span>
                <span className="text-muted-foreground">Mediana (kobiety):</span>
                <span>{formatPLN(calc.median_female)} (N = {calc.n_female})</span>
                <span className="text-muted-foreground">Mediana (mężczyźni):</span>
                <span>{formatPLN(calc.median_male)} (N = {calc.n_male})</span>
                <span className="text-muted-foreground">Luka płacowa:</span>
                <span>{calc.gap_percent != null ? `${calc.gap_percent}%` : "—"}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sekcja D — PDF i wysyłka (HITL) */}
      <Card>
        <CardHeader>
          <CardTitle>Odpowiedź na wniosek</CardTitle>
          <CardDescription>
            Podgląd PDF, zatwierdzenie i wysyłka (wymagane potwierdzenie — HITL)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!calc && (
            <p className="text-muted-foreground text-sm">
              Wykonaj najpierw przypisanie EVG i obliczenia, następnie wygeneruj PDF.
            </p>
          )}
          {calc && !hasPdf && (
            <Button onClick={handleGeneratePdf} disabled={generatingPdf}>
              {generatingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Generuj PDF odpowiedzi
            </Button>
          )}
          {hasPdf && (
            <>
              <div>
                <Label className="text-muted-foreground">Podgląd odpowiedzi PDF</Label>
                <div className="mt-2">
                  <a
                    href={request.pdf_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Otwórz PDF w nowej karcie
                  </a>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Uwagi do odpowiedzi (opcjonalne)</Label>
                <Input
                  id="notes"
                  placeholder="Notatki wewnętrzne — nie są wysyłane do pracownika"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <a href={request.pdf_url!} target="_blank" rel="noopener noreferrer">
                    Edytuj PDF
                  </a>
                </Button>
                <Button
                  onClick={() => setSendModalOpen(true)}
                  disabled={!canSend}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Zatwierdź i wyślij odpowiedź
                </Button>
              </div>
            </>
          )}
          {isSent && request.sent_at && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <AlertDescription>
                Odpowiedź została wysłana {formatDate(request.sent_at)}. Operacja zapisana w logu audytowym.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* HITL Modal potwierdzenia wysyłki */}
      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Czy na pewno chcesz wysłać tę odpowiedź?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  Odpowiedź zostanie wysłana na:{" "}
                  <strong>{request.employee_email || "— (wniosek ręczny bez emaila)"}</strong>
                </p>
                <p>
                  Kopia zostanie wysłana na: <strong>{grazynaEmail || "Twój adres (zalogowany użytkownik)"}</strong>
                </p>
                <p className="text-amber-600 dark:text-amber-400">
                  Po wysłaniu operacja jest nieodwracalna i zostanie zapisana w logu audytowym.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendModalOpen(false)} disabled={sending}>
              Anuluj
            </Button>
            <Button onClick={handleConfirmSend} disabled={sending}>
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Wyślij odpowiedź
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
