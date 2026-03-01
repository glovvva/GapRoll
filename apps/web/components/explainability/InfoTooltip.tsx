"use client";

import * as React from "react";
import { HelpCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Ikona informacji z tooltipem. Dla Grażyny (HR): każde metric z wyjaśnieniem i opcjonalnym cytatem.
 * Użycie z content: <InfoTooltip content="..." citation="Art. 16 Dyrektywy UE 2023/970" />
 * Użycie z children: <InfoTooltip><p>...</p></InfoTooltip>
 */
export interface InfoTooltipProps {
  /** Główny tekst wyjaśnienia (formalna polszczyzna) */
  content?: string;
  /** Opcjonalny cytat prawny wyświetlany jako badge pod content */
  citation?: string;
  /** Zamiast content/citation: dowolna treść tooltipa */
  children?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function InfoTooltip({
  content,
  citation,
  children,
  className,
  ariaLabel = "Informacja",
}: InfoTooltipProps) {
  const body =
    content !== undefined ? (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{content}</p>
        {citation && (
          <span className="inline-flex items-center rounded border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
            ⚖️ {citation}
          </span>
        )}
      </div>
    ) : (
      children
    );

  const Icon = content !== undefined ? Info : HelpCircle;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex cursor-help align-middle"
            role="button"
            tabIndex={0}
            aria-label={ariaLabel}
          >
            <Icon
              className={cn(
                "h-4 w-4 text-muted-foreground inline-block",
                className
              )}
              aria-hidden
            />
          </span>
        </TooltipTrigger>
        <TooltipContent
          className="max-w-[300px] border border-slate-600 bg-slate-800 text-slate-100 p-3 text-sm"
          side="top"
        >
          {body}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
