"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EVGPosition {
  id: string;
  name: string;
  evg_score: number;
  ai_confidence: number;
  is_overridden: boolean;
  overridden_by?: string | null;
  overridden_at?: string | null;
}

export interface EVGAxes {
  skills: number;
  effort: number;
  responsibility: number;
  conditions: number;
}

interface EVGScoreCardProps {
  position: EVGPosition;
  axes: EVGAxes;
  onOverride: (positionId: string) => void;
}

const AXIS_LABELS: (keyof EVGAxes)[] = [
  "skills",
  "effort",
  "responsibility",
  "conditions",
];
const AXIS_NAMES: Record<keyof EVGAxes, string> = {
  skills: "Umiejętności",
  effort: "Wysiłek",
  responsibility: "Odpowiedzialność",
  conditions: "Warunki",
};

function confidenceVariant(aiConfidence: number): "default" | "secondary" | "destructive" {
  if (aiConfidence > 0.85) return "default";
  if (aiConfidence >= 0.7) return "secondary";
  return "destructive";
}

function formatOverriddenAt(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function EVGScoreCard({ position, axes, onOverride }: EVGScoreCardProps) {
  const confidencePct = Math.round(position.ai_confidence * 100);
  const variant = confidenceVariant(position.ai_confidence);
  const badgeClass =
    variant === "default"
      ? "badge-correct"
      : variant === "secondary"
        ? "badge-review"
        : "badge-alert";

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-primary">
          Wartościowanie Stanowisk
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-mono text-xl font-bold text-text-primary">
            {position.name}
          </span>
          <Badge
            variant="outline"
            className={cn("border px-2 py-0.5 text-xs font-medium rounded-full", badgeClass)}
          >
            {position.evg_score}/100
          </Badge>
          <span className="text-xs text-text-secondary">
            (pewność: {confidencePct}%)
          </span>
          {position.is_overridden && (
            <Badge variant="secondary" className="text-xs">
              Zmodyfikowano ręcznie
            </Badge>
          )}
        </div>
        {position.is_overridden && (position.overridden_by || position.overridden_at) && (
          <p className="text-xs text-text-muted">
            {position.overridden_by && `Przez: ${position.overridden_by}`}
            {position.overridden_at &&
              ` · ${formatOverriddenAt(position.overridden_at)}`}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {AXIS_LABELS.map((key) => (
            <div key={key} className="flex justify-between">
              <span className="text-text-secondary">{AXIS_NAMES[key]}</span>
              <span className="font-mono text-text-primary">{axes[key]}/25</span>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onOverride(position.id)}
        >
          ✏️ Zmień ocenę EVG
        </Button>
      </CardContent>
      <CardFooter className="border-t border-border pt-3 text-xs text-text-muted">
        ⚖️ Art. 4 Dyrektywy UE 2023/970 | EU AI Act Art. 14 (HITL)
      </CardFooter>
    </Card>
  );
}
