"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle } from "lucide-react";

const ART7_TOOLTIP =
  "Termin zgodnie z Art. 7 ust. 4 Dyrektywy 2023/970 (60 dni na odpowiedź).";

export interface DeadlineCountdownProps {
  deadline_at: string | null;
  status: string;
}

function formatDays(days: number): string {
  if (days === 0) return "Dziś";
  if (days === 1) return "1 dzień";
  if (days < 5) return `${days} dni`;
  return `${days} dni`;
}

export function DeadlineCountdown({ deadline_at, status }: DeadlineCountdownProps) {
  if (status === "sent") {
    return (
      <span className="text-muted-foreground text-sm">Wysłano</span>
    );
  }
  if (!deadline_at) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-muted-foreground text-sm">—</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{ART7_TOOLTIP}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const deadline = new Date(deadline_at);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const diffMs = deadline.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isOverdue = days < 0;
  const text = isOverdue
    ? `Po terminie (${Math.abs(days)} ${Math.abs(days) === 1 ? "dzień" : "dni"})`
    : formatDays(days);

  let colorClass = "text-green-600 dark:text-green-400";
  if (isOverdue) {
    colorClass = "text-red-600 dark:text-red-400 font-medium";
  } else if (days <= 7) {
    colorClass = "text-red-600 dark:text-red-400";
  } else if (days <= 14) {
    colorClass = "text-amber-600 dark:text-amber-400";
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`text-sm ${colorClass} cursor-default inline-flex items-center gap-1`}>
            {isOverdue && <AlertTriangle className="h-4 w-4 shrink-0" />}
            {text}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{ART7_TOOLTIP}</p>
          <p className="mt-1 text-muted-foreground">
            Termin: {new Date(deadline_at).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
