"use client";

import * as React from "react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Ikona pomocy z tooltipem. Zgodne z 05_FRONTEND_STANDARDS: tło var(--bg-secondary),
 * tekst var(--text-secondary) 14px, max-width 300px. Z aria-label dla dostępności.
 *
 * @example
 * <InfoTooltip>
 *   <p>Wyjaśnienie wskaźnika zgodnie z Art. 16.</p>
 * </InfoTooltip>
 */
export interface InfoTooltipProps {
  children: React.ReactNode;
  className?: string;
  /** Etykieta dla screen readerów (domyślnie: "Pomoc") */
  ariaLabel?: string;
}

export function InfoTooltip({
  children,
  className,
  ariaLabel = "Pomoc",
}: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex cursor-help"
            role="button"
            tabIndex={0}
            aria-label={ariaLabel}
          >
            <HelpCircle
              className={cn(
                "h-4 w-4 text-muted-foreground inline-block",
                className
              )}
              aria-hidden
            />
          </span>
        </TooltipTrigger>
        <TooltipContent
          className="max-w-[300px] border border-border bg-[var(--bg-secondary)] p-3 text-sm text-[var(--text-secondary)]"
          side="top"
        >
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
