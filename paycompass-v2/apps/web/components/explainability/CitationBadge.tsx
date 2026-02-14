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
 * Badge wyświetlający odniesienie do artykułu (np. Dyrektywa UE 2023/970).
 * Kolory wariantów zgodne z 05_FRONTEND_STANDARDS (--accent-blue/amber/red).
 *
 * @example
 * <CitationBadge citation="Art. 9 Dyrektywy UE 2023/970" variant="warning" articleText="Pełny tekst Art. 9..." />
 * <CitationBadge citation="Art. 16 ust. 2" variant="info" href="/docs/art16" />
 */
export interface CitationBadgeProps {
  /** Krótki tekst cytatu (np. "Art. 9 Dyrektywy UE 2023/970") */
  citation: string;
  /** Wariant wizualny: info (niebieski), warning (bursztyn), critical (czerwony) */
  variant?: "info" | "warning" | "critical";
  /** Opcjonalny link */
  href?: string;
  /** Pełny tekst artykułu wyświetlany w tooltipie */
  articleText?: string;
  className?: string;
}

/* Warianty z kontrastem WCAG ≥4.5:1: ciemny tekst na pełnym tle akcentu */
const variantBorderBgClasses = {
  info:
    "border-[var(--accent-blue)] bg-[var(--accent-blue)] text-[var(--accent-blue-fg)] hover:opacity-90",
  warning:
    "border-[var(--accent-amber)] bg-[var(--accent-amber)] text-[var(--accent-amber-fg)] hover:opacity-90",
  critical:
    "border-[var(--accent-red)] bg-[var(--accent-red)] text-[var(--accent-red-fg)] hover:opacity-90",
};

function CitationBadgeInner({
  citation,
  variant = "info",
  href,
  articleText,
  className,
}: CitationBadgeProps) {
  const baseClasses = cn(
    "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 transition-transform duration-200 hover:scale-105 hover:shadow-md font-medium text-xs",
    variantBorderBgClasses[variant],
    className
  );

  const content = (
    <>
      <Scale className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
      <span>{citation}</span>
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

  if (articleText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{wrapped}</TooltipTrigger>
          <TooltipContent
            className="max-w-sm border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm p-3"
            side="top"
          >
            {articleText}
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
