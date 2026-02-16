"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";
import { fetchWithAuth } from "@/lib/api-client";
import { ExplainerCard } from "@/components/ui/explainer-card";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface EVGScore {
  position: string;
  user_id: string;
  evg_score: number;
  skills: number;
  effort: number;
  responsibility: number;
  conditions: number;
  reasoning: string;
}

type ToastMessage = { type: "success"; text: string } | { type: "error"; text: string } | null;

export default function EVGPage() {
  const [scores, setScores] = useState<EVGScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmRefreshOpen, setConfirmRefreshOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastMessage>(null);

  async function handleRunScoring() {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const positionsResponse = await fetchWithAuth("/api/analysis/paygap");

      if (!positionsResponse.ok) {
        throw new Error("Nie udało się pobrać danych stanowisk");
      }

      const paygapData = await positionsResponse.json();
      const uniquePositions = Array.from(
        new Set(
          (paygapData.data_points as { position: string }[]).map(
            (d) => d.position
          )
        )
      );

      const scoringResponse = await fetchWithAuth("/api/analysis/evg-score", {
        method: "POST",
        body: JSON.stringify({ positions: uniquePositions }),
      });

      if (!scoringResponse.ok) {
        const errorData = await scoringResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || "Błąd AI scoringu");
      }

      const result = await scoringResponse.json();
      setScores(result.scores ?? []);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się uruchomić scoringu"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleClearCache() {
    setRefreshing(true);
    setToast(null);
    try {
      const res = await fetchWithAuth("/api/analysis/evg-cache", {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Nie udało się wyczyścić cache");
      }
      setScores([]);
      setSuccess(false);
      setConfirmRefreshOpen(false);
      setToast({
        type: "success",
        text: "✅ Cache wyczyszczony. Scoring zostanie przeliczony przy następnym użyciu.",
      });
    } catch (err) {
      setToast({
        type: "error",
        text: "❌ Nie udało się wyczyścić cache. Spróbuj ponownie.",
      });
    } finally {
      setRefreshing(false);
    }
  }

  const sortedScores = [...scores].sort((a, b) => b.evg_score - a.evg_score);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-primary">EVG Scoring</h1>
        <p className="mt-2 text-text-secondary">
          Wartościowanie stanowisk pracy zgodnie z Art. 4 Dyrektywy UE 2023/970
        </p>
      </div>

      {/* Run Scoring Card */}
      {scores.length === 0 && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Uruchom Scoring AI
            </CardTitle>
            <CardDescription>
              System automatycznie oceni wszystkie stanowiska w bazie danych
              używając GPT-4o
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-text-secondary">
                <p className="mb-2">
                  Scoring bazuje na 4 kryteriach (po 25 punktów każde):
                </p>
                <ul className="ml-2 list-inside list-disc space-y-1">
                  <li>
                    <strong>Umiejętności</strong> – wykształcenie, ekspertyza techniczna
                  </li>
                  <li>
                    <strong>Wysiłek</strong> – wysiłek fizyczny i umysłowy, stres
                  </li>
                  <li>
                    <strong>Odpowiedzialność</strong> – decyzje, zarządzanie, budżet
                  </li>
                  <li>
                    <strong>Warunki</strong> – warunki pracy, bezpieczeństwo
                  </li>
                </ul>
              </div>
              <Button
                onClick={handleRunScoring}
                className="w-full md:w-auto"
                size="lg"
              >
                <Sparkles className="mr-2 size-4" />
                Uruchom Scoring
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 size-12 animate-spin text-primary" />
            <p className="text-lg font-semibold">Analizuję stanowiska...</p>
            <p className="mt-2 text-sm text-text-secondary">
              To może potrwać 10-30 sekund
            </p>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {success && scores.length > 0 && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="size-4 text-green-500" />
          <AlertDescription className="text-green-500">
            Scoring zakończony! Przeanalizowano {scores.length} stanowisk.
          </AlertDescription>
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Toast (cache clear success/error) */}
      {toast && (
        <Alert
          variant={toast.type === "error" ? "destructive" : "default"}
          className={
            toast.type === "success"
              ? "border-green-500/50 bg-green-500/10"
              : undefined
          }
        >
          <AlertDescription
            className={toast.type === "success" ? "text-green-600 dark:text-green-400" : undefined}
          >
            {toast.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Scores Table */}
      {scores.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
            <div>
              <CardTitle>Wyniki Scoringu</CardTitle>
              <CardDescription>
                Automatyczna ocena stanowisk (skala 1-100)
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={refreshing}
                    onClick={() => setConfirmRefreshOpen(true)}
                    className="shrink-0"
                  >
                    {refreshing ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Odświeżanie...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 size-4" />
                        🔄 Odśwież Scoring
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  Wyczyść cache i przelicz scoring od nowa z najnowszą metodologią AI
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>

          {/* Confirmation dialog */}
          <Dialog open={confirmRefreshOpen} onOpenChange={setConfirmRefreshOpen}>
            <DialogContent showCloseButton={true}>
              <DialogHeader>
                <DialogTitle>Odświeżyć scoring?</DialogTitle>
                <DialogDescription>
                  Czy na pewno chcesz odświeżyć scoring? Obecne wyniki zostaną
                  usunięte i przeliczone od nowa.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setConfirmRefreshOpen(false)}
                >
                  Anuluj
                </Button>
                <Button
                  variant="destructive"
                  disabled={refreshing}
                  onClick={handleClearCache}
                >
                  {refreshing ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Odświeżanie...
                    </>
                  ) : (
                    "Tak, odśwież"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-teal-primary/15">
                    <th className="px-4 py-3 text-left font-semibold">
                      Stanowisko
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Wynik Całkowity
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Umiejętności
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Wysiłek
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Odpowiedzialność
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Warunki
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedScores.map((score, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-teal-primary/15/50 hover:bg-secondary/50"
                    >
                      <td className="px-4 py-3 font-medium">{score.position}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-lg font-bold text-primary">
                          {score.evg_score}
                        </span>
                        <span className="ml-1 text-xs text-text-secondary">
                          /100
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {score.skills}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {score.effort}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {score.responsibility}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {score.conditions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reasoning Section */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-text-secondary">
                Uzasadnienia AI:
              </h3>
              {sortedScores.map((score, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-semibold">{score.position}:</span>{" "}
                  <span className="text-text-secondary">
                    {score.reasoning}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {scores.length > 0 && (
        <ExplainerCard title="Jak działa AI Scoring?" variant="info">
          <div>
            <h4 className="font-semibold mb-1">
              METODOLOGIA (Art. 4 Dyrektywy UE 2023/970):
            </h4>
            <p className="text-text-secondary mb-2">
              System ocenia każde stanowisko według 4 obiektywnych kryteriów:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-mono font-bold text-primary">
                  Umiejętności (0-25):
                </span>
                <span className="text-text-secondary">
                  Wykształcenie, certyfikaty, doświadczenie, ekspertyza techniczna
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono font-bold text-primary">
                  Wysiłek (0-25):
                </span>
                <span className="text-text-secondary">
                  Wysiłek fizyczny i umysłowy, stres, intensywność pracy
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono font-bold text-primary">
                  Odpowiedzialność (0-25):
                </span>
                <span className="text-text-secondary">
                  Odpowiedzialność za decyzje, budżet, zarządzanie, wpływ na firmę
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono font-bold text-primary">
                  Warunki (0-25):
                </span>
                <span className="text-text-secondary">
                  Bezpieczeństwo, środowisko pracy, podróże, równowaga praca–życie
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-1">CZY MOGĘ UFAĆ AI?</h4>
            <p className="text-text-secondary">
              ✅ System używa GPT-4o (najnowszy model OpenAI) wytrenowany na
              międzynarodowych standardach wyceny pracy.
              <br />
              ✅ Scoring bazuje na Europejskim Kodeksie Wyceny Stanowisk (Job
              Evaluation Guide).
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">
              CZY INSPEKTOR PIP TO ZAAKCEPTUJE?
            </h4>
            <p className="text-text-secondary">
              ✅ Tak - o ile zachowasz dokumentację:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-1 ml-2">
              <li>
                Wydruk scoringu z uzasadnieniem AI (dostępny w PDF)
              </li>
              <li>Protokół z ręcznych korekt (jeśli były)</li>
              <li>
                Konsultacje z przedstawicielami pracowników (Art. 4 ust. 4)
              </li>
            </ul>
            <p className="mt-2 text-xs">
              📋 <strong>Podstawa prawna:</strong> Art. 4 ust. 4 Dyrektywy UE
              2023/970
            </p>
          </div>
        </ExplainerCard>
      )}
    </div>
  );
}
