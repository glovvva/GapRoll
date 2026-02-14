"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CitationBadge } from "@/components/explainability/CitationBadge";
import { cn } from "@/lib/utils";

/** Domyślna ścieżka do Planu Działania (Solio Solver). */
export const COMPLIANCE_ACTION_HREF = "/dashboard/solio";

/**
 * Alert zgodności z Dyrektywą UE 2023/970 (Art. 9).
 * Wyświetlany gdy luka płacowa > 5%: 5–10% → warning (amber), >10% → critical (red).
 * Kolory wyłącznie przez zmienne CSS (--accent-blue/amber/red). Formalna polszczyzna.
 *
 * @example
 * // Ręczne ustawienie
 * <ComplianceAlert
 *   type="warning"
 *   title="Wymagane działanie"
 *   description="Luka płacowa przekracza 5%. Zgodnie z Art. 9..."
 *   citation="Art. 9 Dyrektywy UE 2023/970"
 *   action={{ label: "Zobacz Plan Działania", href: "/dashboard/solio" }}
 * />
 *
 * @example
 * // Automatyczny wariant na podstawie pay gap
 * <ComplianceAlert payGapPercent={12} />
 */
export interface ComplianceAlertProps {
  /** Typ alertu (info / warning / critical) */
  type?: "info" | "warning" | "critical";
  /** Tytuł (np. "Wymagane działanie") */
  title?: string;
  /** Opis – formalna polszczyzna, cytowanie Art. 9 */
  description?: string;
  /** Akcja CTA – domyślnie "Zobacz Plan Działania" → Solio Solver */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Cytat (np. Art. 9 Dyrektywy UE 2023/970) */
  citation?: string;
  /**
   * Opcjonalna luka płacowa w %.
   * Gdy podana: wyświetl tylko jeśli > 5%; 5–10% → warning, >10% → critical.
   * Nadpisuje type/title/description domyślnymi treściami.
   */
  payGapPercent?: number;
}

const typeStyles = {
  info:
    "border-[var(--accent-blue)] bg-[var(--accent-blue)]/10 [&_svg]:text-[var(--accent-blue)]",
  warning:
    "border-[var(--accent-amber)] bg-[var(--accent-amber)]/10 [&_svg]:text-[var(--accent-amber)]",
  critical:
    "border-[var(--accent-red)] bg-[var(--accent-red)]/10 [&_svg]:text-[var(--accent-red)]",
};

const citationVariantMap = {
  info: "info" as const,
  warning: "warning" as const,
  critical: "critical" as const,
};

const DEFAULT_TITLES = {
  warning:
    "Wymagane działanie: przygotowanie uzasadnienia i planu naprawczego",
  critical:
    "Konieczna akcja: uzasadnienie przyczyn i plan działań zgodnie z Dyrektywą",
} as const;

const DEFAULT_DESCRIPTIONS = {
  warning:
    "Luka płacowa w przedziale 5–10% wymaga wyjaśnienia przyczyn oraz planu działań naprawczych zgodnie z Art. 9 Dyrektywy UE 2023/970.",
  critical:
    "Luka płacowa przekraczająca 10% wymaga niezwłocznego przygotowania uzasadnienia przyczyn różnic wynagrodzeń oraz planu działań naprawczych (Art. 9 Dyrektywy UE 2023/970).",
} as const;

const ART9_CITATION = "Art. 9 Dyrektywy UE 2023/970";

export function ComplianceAlert({
  type = "info",
  title,
  description,
  action,
  citation = ART9_CITATION,
  payGapPercent,
}: ComplianceAlertProps) {
  const resolved =
    payGapPercent !== undefined && payGapPercent > 5
      ? ((): {
          type: "warning" | "critical";
          title: string;
          description: string;
        } => {
          const variant: "warning" | "critical" =
            payGapPercent > 10 ? "critical" : "warning";
          return {
            type: variant,
            title: DEFAULT_TITLES[variant],
            description: DEFAULT_DESCRIPTIONS[variant],
          };
        })()
      : null;

  if (resolved === null && payGapPercent !== undefined) {
    return null;
  }

  const effectiveType = resolved?.type ?? type;
  const effectiveTitle = resolved?.title ?? title ?? "";
  const effectiveDescription = resolved?.description ?? description ?? "";
  const citationVariant = citationVariantMap[effectiveType];

  const defaultAction =
    (effectiveType === "warning" || effectiveType === "critical")
      ? {
          label: "Zobacz Plan Działania",
          href: COMPLIANCE_ACTION_HREF,
        }
      : undefined;

  const effectiveAction = action ?? defaultAction;
  const actionWithHref =
    effectiveAction && "href" in effectiveAction && effectiveAction.href;
  const actionWithOnClick =
    effectiveAction &&
    "onClick" in effectiveAction &&
    effectiveAction.onClick &&
    !effectiveAction.href;

  return (
    <Alert className={cn(typeStyles[effectiveType])}>
      <AlertCircle className="h-4 w-4" aria-hidden />
      <AlertDescription>
        <div className="space-y-2">
          {effectiveTitle && (
            <p className="font-semibold text-foreground">{effectiveTitle}</p>
          )}
          {effectiveDescription && (
            <p className="text-muted-foreground leading-relaxed">
              {effectiveDescription}
            </p>
          )}
          {(effectiveAction || citation) && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {citation && (
                <CitationBadge
                  citation={citation}
                  variant={citationVariant}
                />
              )}
              {actionWithHref && (
                <Button variant="link" size="sm" asChild>
                  <a href={actionWithHref}>{effectiveAction!.label}</a>
                </Button>
              )}
              {actionWithOnClick && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={effectiveAction.onClick}
                  type="button"
                >
                  {effectiveAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
