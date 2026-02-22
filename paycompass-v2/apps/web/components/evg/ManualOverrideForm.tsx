"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fetchWithAuth } from "@/lib/api-client";

export interface EVGAxes {
  skills: number;
  effort: number;
  responsibility: number;
  conditions: number;
}

export interface OverrideSuccessData {
  new_score: number;
  new_axes: EVGAxes;
}

interface ManualOverrideFormProps {
  positionId: string;
  currentAxes: EVGAxes;
  onSuccess: (data: OverrideSuccessData) => void;
  onToast?: (message: string) => void;
}

const AXIS_KEYS: (keyof EVGAxes)[] = [
  "skills",
  "effort",
  "responsibility",
  "conditions",
];
const AXIS_LABELS: Record<keyof EVGAxes, string> = {
  skills: "Umiejętności",
  effort: "Wysiłek",
  responsibility: "Odpowiedzialność",
  conditions: "Warunki",
};

const MIN_JUSTIFICATION_LENGTH = 20;
const MAX_AXIS = 25;

export function ManualOverrideForm({
  positionId,
  currentAxes,
  onSuccess,
  onToast,
}: ManualOverrideFormProps) {
  const [axes, setAxes] = useState<EVGAxes>({ ...currentAxes });
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = axes.skills + axes.effort + axes.responsibility + axes.conditions;
  const isValidTotal = total <= 100;
  const justificationValid =
    justification.trim().length >= MIN_JUSTIFICATION_LENGTH;
  const canSubmit =
    isValidTotal &&
    justificationValid &&
    axes.skills >= 0 &&
    axes.skills <= MAX_AXIS &&
    axes.effort >= 0 &&
    axes.effort <= MAX_AXIS &&
    axes.responsibility >= 0 &&
    axes.responsibility <= MAX_AXIS &&
    axes.conditions >= 0 &&
    axes.conditions <= MAX_AXIS;

  function setAxis(key: keyof EVGAxes, value: number) {
    const v = Math.max(0, Math.min(MAX_AXIS, Math.round(value)));
    setAxes((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // Backend expects snake_case: position_id, new_axes, justification (Pydantic OverrideRequest)
      const body = {
        position_id: positionId,
        new_axes: {
          skills: Number(axes.skills) || 0,
          effort: Number(axes.effort) || 0,
          responsibility: Number(axes.responsibility) || 0,
          conditions: Number(axes.conditions) || 0,
        },
        justification: (justification || "").trim(),
      };
      const res = await fetchWithAuth("/api/evg/override", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail ?? "Błąd zapisu");
      }
      onToast?.("Zmiana zapisana. Audit trail zaktualizowany.");
      onSuccess({
        new_score: data.new_score ?? total,
        new_axes: data.new_axes ?? axes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3">
        {AXIS_KEYS.map((key) => (
          <div key={key} className="space-y-1">
            <Label htmlFor={`evg-override-${key}`}>{AXIS_LABELS[key]} (0–25)</Label>
            <Input
              id={`evg-override-${key}`}
              type="number"
              min={0}
              max={MAX_AXIS}
              value={axes[key]}
              onChange={(e) => setAxis(key, Number(e.target.value) || 0)}
              className="w-20 font-mono"
            />
          </div>
        ))}
      </div>
      <p className="text-sm text-text-secondary">
        Suma: <span className="font-mono font-semibold">{total}/100</span>
        {!isValidTotal && (
          <span className="ml-2 text-destructive"> (maks. 100)</span>
        )}
      </p>
      <div className="space-y-2">
        <Label htmlFor="evg-justification">
          Uzasadnienie zmiany (wymagane)
        </Label>
        <Textarea
          id="evg-justification"
          placeholder="Min. 20 znaków — uzasadnij ręczną korektę oceny."
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          rows={4}
          className="resize-none"
          minLength={MIN_JUSTIFICATION_LENGTH}
        />
        <p className="text-xs text-text-muted">
          {justification.trim().length} znaków
          {!justificationValid && justification.trim().length > 0 && (
            <span className="text-destructive">
              {" "}
              (wymagane min. {MIN_JUSTIFICATION_LENGTH})
            </span>
          )}
        </p>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button type="submit" disabled={!canSubmit || isSubmitting}>
        {isSubmitting ? "Zapisywanie…" : "Zapisz zmianę"}
      </Button>
    </form>
  );
}
