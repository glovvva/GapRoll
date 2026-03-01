"use client";

import * as React from "react";
import { Scale } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Badge wyświetlający odniesienie do artykułu (Dyrektywa UE 2023/970).
 * Nowe API: article + description (neutral). Istniejące: citation + variant + articleText.
 */
export interface CitationBadgeProps {
  /** Krótki tekst cytatu (np. "Art. 9 Dyrektywy UE 2023/970") — backward compat */
  citation?: string;
  /** Tekst artykułu wyświetlany w badge (z prefiksem ⚖️). Używany z article/description API. */
  article?: string;
  /** Krótki fragment artykułu (2–3 zdania) w tooltipie */
  description?: string;
  /** Wariant wizualny: info | warning | critical. Dla article bez variantu używany neutral. */
  variant?: "info" | "warning" | "critical" | "neutral";
  href?: string;
  /** Pełny tekst / excerpt w tooltipie — backward compat */
  articleText?: string;
  className?: string;
}

const variantBorderBgClasses: Record<string, string> = {
  info:
    "border-[var(--accent-blue)] bg-[var(--accent-blue)] text-[var(--accent-blue-fg)] hover:opacity-90",
  warning:
    "border-[var(--accent-amber)] bg-[var(--accent-amber)] text-[var(--accent-amber-fg)] hover:opacity-90",
  critical:
    "border-[var(--accent-red)] bg-[var(--accent-red)] text-[var(--accent-red-fg)] hover:opacity-90",
  neutral:
    "border-border bg-muted/60 text-muted-foreground hover:bg-muted",
};

function CitationBadgeInner({
  citation,
  article,
  description,
  variant = "info",
  href,
  articleText,
  className,
}: CitationBadgeProps) {
  const displayText = article ?? citation ?? "";
  const tooltipBody = description ?? articleText;
  const effectiveVariant = article != null && variant === "info" ? "neutral" : variant;

  const baseClasses = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-90",
    variantBorderBgClasses[effectiveVariant] ?? variantBorderBgClasses.neutral,
    className
  );

  const content = (
    <>
      <span className="opacity-80" aria-hidden>⚖️</span>
      <span>{displayText}</span>
    </>
  );

  const wrapped = href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={baseClasses}
    >
      {content}
    </a>
  ) : (
    <span className={baseClasses}>{content}</span>
  );

  if (tooltipBody) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{wrapped}</TooltipTrigger>
          <TooltipContent
            className="max-w-sm border-slate-600 bg-slate-800 text-slate-100 text-sm p-3"
            side="top"
          >
            {tooltipBody}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return wrapped;
}

export function CitationBadge(props: CitationBadgeProps) {
  return <CitationBadgeInner {...props} />;
}
