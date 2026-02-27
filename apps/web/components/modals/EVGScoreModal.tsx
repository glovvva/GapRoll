"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EVGScoreCard } from "@/components/explainability/EVGScoreCard";
import { cn } from "@/lib/utils";

interface AxesData {
  skills: number;
  effort: number;
  responsibility: number;
  conditions: number;
}

interface EVGScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  currentScore: number;
  axesData: AxesData;
  jobDescription: string;
  onOverride?: (newScore: number, reason: string) => void;
  /** AI confidence 0–1, default 0.85 */
  confidence?: number;
  /** Legal citation, default EU directive */
  citation?: string;
  /** Optional job/analysis ID for API */
  jobId?: string;
}

export function EVGScoreModal({
  isOpen,
  onClose,
  jobTitle,
  currentScore,
  axesData,
  jobDescription,
  onOverride,
  confidence = 0.85,
  citation = "Art. 4 ust. 1 lit. a) Dyrektywy 2023/970",
  jobId,
}: EVGScoreModalProps) {
  const [step, setStep] = useState<"view" | "override">("view");
  const [overrideScore, setOverrideScore] = useState(currentScore);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function resetOverrideForm() {
    setOverrideScore(currentScore);
    setReason("");
    setReasonError(null);
    setSubmitError(null);
    setStep("view");
  }

  function handleClose() {
    resetOverrideForm();
    onClose();
  }

  function handleStartOverride() {
    setStep("override");
    setOverrideScore(currentScore);
    setReason("");
    setReasonError(null);
    setSubmitError(null);
  }

  function validateReason(): boolean {
    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError("Uzasadnienie jest wymagane.");
      return false;
    }
    setReasonError(null);
    return true;
  }

  async function handleConfirmOverride() {
    if (!validateReason()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/evg/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          jobTitle,
          newScore: overrideScore,
          reason: reason.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `Błąd: ${res.status}`);
      }

      onOverride?.(overrideScore, reason.trim());
      handleClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{jobTitle}</DialogTitle>
          <DialogDescription>{jobDescription}</DialogDescription>
        </DialogHeader>

        {step === "view" ? (
          <>
            <EVGScoreCard
              score={currentScore}
              confidence={confidence}
              axes={axesData}
              citation={citation}
            />
            {onOverride && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartOverride}
                className="w-full"
              >
                Nie zgadzam się. Zmieniam ocenę
              </Button>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="evg-override-score">
                Nowa ocena EVG: <span className="font-mono">{overrideScore}</span>/100
              </Label>
              <Slider
                id="evg-override-score"
                min={0}
                max={100}
                step={1}
                value={[overrideScore]}
                onValueChange={([v]) => setOverrideScore(v)}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evg-override-reason">
                Uzasadnienie <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="evg-override-reason"
                placeholder="np. Stanowisko nie wymaga certyfikacji AWS ani 3 lat doświadczenia."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (reasonError) setReasonError(null);
                }}
                onBlur={() => reason.trim() === "" && setReasonError(null)}
                className={cn(reasonError && "border-destructive")}
                rows={4}
              />
              {reasonError && (
                <p className="text-sm text-destructive">{reasonError}</p>
              )}
            </div>

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={resetOverrideForm} disabled={isSubmitting}>
                Anuluj
              </Button>
              <Button
                onClick={handleConfirmOverride}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Zapisywanie…" : "Zatwierdź"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
