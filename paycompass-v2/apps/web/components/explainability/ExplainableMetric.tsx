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
  value: number | string;
  unit?: string;
  label: string;
  /** Wyjaśnienie metryki (formalna polszczyzna) */
  explanation?: string;
  /** Alias dla explanation — treść tooltipa */
  tooltip?: string;
  citation?: string;
  status?: "good" | "warning" | "critical" | "ok" | "danger";
  /** Opcjonalna pewność 0–1; przy < 0.7 wyświetlany jest badge "Wymaga weryfikacji" */
  confidence?: number;
  actionLabel?: string;
  onAction?: () => void;
}

const citationVariantMap: Record<string, "info" | "warning" | "critical"> = {
  good: "info",
  ok: "info",
  warning: "warning",
  critical: "critical",
  danger: "critical",
};

const statusDotClasses: Record<string, string> = {
  good: "bg-[#5BAD7F]",
  ok: "bg-[#5BAD7F]",
  warning: "bg-[#C4934A]",
  critical: "bg-[#C45A5A]",
  danger: "bg-[#C45A5A]",
};

export function ExplainableMetric({
  value,
  unit = "",
  label,
  explanation,
  tooltip,
  citation,
  status = "good",
  confidence,
  actionLabel,
  onAction,
}: ExplainableMetricProps) {
  const effectiveStatus = status === "ok" ? "good" : status === "danger" ? "critical" : status;
  const citationVariant = citationVariantMap[effectiveStatus] ?? "info";
  const showVerificationBadge = confidence !== undefined && confidence < 0.7;
  const explanationText = tooltip ?? explanation;

  return (
    <Collapsible className="group">
      <div className="rounded-lg border border-border bg-card p-4">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-start justify-between text-left hover:opacity-90 transition-opacity"
          >
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                  {value}
                  {unit}
                </span>
                {status && (
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      statusDotClasses[effectiveStatus] ?? statusDotClasses.good
                    )}
                    aria-hidden
                  />
                )}
              </div>
              <span className="text-sm font-medium text-foreground mt-2 block">
                {label}
              </span>
              {citation && (
                <CitationBadge
                  citation={citation}
                  variant={citationVariant}
                  className="mt-1"
                />
              )}
              {showVerificationBadge && (
                <span
                  className="inline-flex w-fit mt-1 items-center rounded-md border px-2 py-0.5 text-xs font-medium badge-review"
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
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            {explanationText && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {explanationText}
              </p>
            )}
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
