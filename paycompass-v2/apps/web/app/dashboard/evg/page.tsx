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
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

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

export default function EVGPage() {
  const [scores, setScores] = useState<EVGScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRunScoring() {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const positionsResponse = await fetch("/api/analysis/paygap");

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

      const scoringResponse = await fetch("/api/analysis/evg-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "00000000-0000-0000-0000-000000000000",
          positions: uniquePositions,
        }),
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

  const sortedScores = [...scores].sort((a, b) => b.evg_score - a.evg_score);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-primary">EVG Scoring</h1>
        <p className="mt-2 text-muted-foreground">
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
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  Scoring bazuje na 4 kryteriach (po 25 punktów każde):
                </p>
                <ul className="ml-2 list-inside list-disc space-y-1">
                  <li>
                    <strong>Skills</strong> - wykształcenie, ekspertyza techniczna
                  </li>
                  <li>
                    <strong>Effort</strong> - wysiłek fizyczny i umysłowy, stres
                  </li>
                  <li>
                    <strong>Responsibility</strong> - odpowiedzialność, zarządzanie
                  </li>
                  <li>
                    <strong>Conditions</strong> - warunki pracy, bezpieczeństwo
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
            <p className="mt-2 text-sm text-muted-foreground">
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

      {/* Scores Table */}
      {scores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Wyniki Scoringu</CardTitle>
            <CardDescription>
              Automatyczna ocena stanowisk (skala 1-100)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-semibold">
                      Stanowisko
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Total Score
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Skills
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Effort
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Responsibility
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Conditions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedScores.map((score, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border/50 hover:bg-secondary/50"
                    >
                      <td className="px-4 py-3 font-medium">{score.position}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono text-lg font-bold text-primary">
                          {score.evg_score}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">
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
              <h3 className="text-sm font-semibold text-muted-foreground">
                Uzasadnienia AI:
              </h3>
              {sortedScores.map((score, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-semibold">{score.position}:</span>{" "}
                  <span className="text-muted-foreground">
                    {score.reasoning}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
