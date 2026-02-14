"use client";

import * as React from "react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CitationBadge } from "@/components/explainability/CitationBadge";
import { cn } from "@/lib/utils";

const AXIS_LABELS: Record<string, string> = {
  skills: "Umiejętności",
  effort: "Wysiłek",
  responsibility: "Odpowiedzialność",
  conditions: "Warunki",
};

interface Axes {
  skills: number;
  effort: number;
  responsibility: number;
  conditions: number;
}

interface EVGScoreCardProps {
  score: number;
  confidence: number;
  axes: Axes;
  onOverride?: (newScore: number, reason: string) => void;
  citation: string;
  evidence?: Partial<Record<keyof Axes, string>>;
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const variant =
    confidence > 0.8 ? "good" : confidence >= 0.7 ? "warning" : "critical";
  const styles = {
    good: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    critical: "bg-red-500/20 text-red-400 border-red-500/40",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[variant]
      )}
    >
      AI pewność: {pct}%
    </span>
  );
}

function AxisBar({
  label,
  value,
  max = 25,
  evidence,
}: {
  label: string;
  value: number;
  max?: number;
  evidence?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const bar = (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{value}/{max}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: "#3b82f6" }}
        />
      </div>
    </div>
  );

  if (evidence) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{bar}</div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs rounded-md border-none p-3 text-xs shadow-lg"
          style={{
            backgroundColor: "#0f172a",
            color: "#f1f5f9",
          }}
        >
          {evidence}
        </TooltipContent>
      </Tooltip>
    );
  }

  return bar;
}

export function EVGScoreCard({
  score,
  confidence,
  axes,
  onOverride,
  citation,
  evidence,
}: EVGScoreCardProps) {
  const [showOverride, setShowOverride] = useState(false);
  const [newScore, setNewScore] = useState(score.toString());
  const [reason, setReason] = useState("");

  function handleConfirmOverride() {
    const n = parseInt(newScore, 10);
    if (!isNaN(n) && n >= 0 && n <= 100 && reason.trim()) {
      onOverride?.(n, reason.trim());
      setShowOverride(false);
      setReason("");
    }
  }

  return (
    <TooltipProvider>
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        {/* Score + Confidence */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-2xl font-bold font-mono text-foreground">
            {score}/100
          </span>
          <ConfidenceBadge confidence={confidence} />
        </div>

        {/* 4 Progress bars */}
        <div className="space-y-3">
          {(Object.keys(axes) as (keyof Axes)[]).map((key) => (
            <AxisBar
              key={key}
              label={AXIS_LABELS[key] ?? key}
              value={axes[key]}
              max={25}
              evidence={evidence?.[key]}
            />
          ))}
        </div>

        {/* Citation */}
        <CitationBadge citation={citation} variant="info" />

        {/* Override */}
        {onOverride && (
          <div className="space-y-3 pt-2 border-t border-border">
            {!showOverride ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOverride(true)}
              >
                Nie zgadzam się. Zmieniam ocenę
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <label className="text-xs text-muted-foreground w-20">
                    Nowa ocena:
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    className="w-20 h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Uzasadnienie:
                  </label>
                  <Input
                    placeholder="np. Stanowisko nie wymaga AWS"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleConfirmOverride}>
                    Zatwierdź
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowOverride(false);
                      setNewScore(score.toString());
                      setReason("");
                    }}
                  >
                    Anuluj
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
