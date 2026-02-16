"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { CitationBadge } from "@/components/explainability/CitationBadge";
import { cn } from "@/lib/utils";

/**
 * Metryka z objaśnieniem, cytatem i opcjonalną akcją.
 * Layout: wartość na górze; pod spodem etykieta w pełnej szerokości, potem CitationBadge w osobnej linii.
 * Przy confidence < 0.7 pokazuje badge "Wymaga weryfikacji".
 *
 * @example
 * <ExplainableMetric
 *   value={12.5}
 *   unit="%"
 *   label="Średnia luka płacowa"
 *   explanation="..."
 *   citation="Art. 16 ust. 2"
 *   status="warning"
 *   confidence={0.65}
 * />
 */
export interface ExplainableMetricProps {
  value: number;
  unit: string;
  label: string;
  explanation: string;
  citation: string;
  status?: "good" | "warning" | "critical";
  /** Opcjonalna pewność 0–1; przy < 0.7 wyświetlany jest badge "Wymaga weryfikacji" */
  confidence?: number;
  actionLabel?: string;
  onAction?: () => void;
}

const citationVariantMap = {
  good: "info" as const,
  warning: "warning" as const,
  critical: "critical" as const,
};

export function ExplainableMetric({
  value,
  unit,
  label,
  explanation,
  citation,
  status = "good",
  confidence,
  actionLabel,
  onAction,
}: ExplainableMetricProps) {
  const citationVariant = citationVariantMap[status];
  const showVerificationBadge = confidence !== undefined && confidence < 0.7;

  return (
    <Collapsible className="group">
      <div className="rounded-lg border border-teal-primary/15 bg-forest-card p-4">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-start justify-between text-left hover:opacity-90 transition-opacity"
          >
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              {/* Wartość na górze: JetBrains Mono 1.5rem (24px), font-weight 700 */}
              <span className="font-mono text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                {value}
                {unit}
              </span>
              {/* Label w pełnej szerokości, badge w osobnej linii pod spodem */}
              <span className="text-sm font-medium text-text-primary mt-2 block">
                {label}
              </span>
              <CitationBadge
                citation={citation}
                variant={citationVariant}
                className="mt-1"
              />
              {showVerificationBadge && (
                <span
                  className="inline-flex w-fit mt-1 items-center rounded-md border border-[var(--accent-amber)] bg-[var(--accent-amber)]/10 px-2 py-0.5 text-xs font-medium text-[var(--accent-amber)]"
                  role="status"
                >
                  Wymaga weryfikacji
                </span>
              )}
            </div>
            <ChevronDown className="h-5 w-5 shrink-0 text-text-secondary transition-transform group-data-[state=open]:rotate-180 mt-0.5 ml-2" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 space-y-3 border-t border-teal-primary/15 pt-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              {explanation}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {actionLabel && onAction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onAction();
                  }}
                >
                  {actionLabel}
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
