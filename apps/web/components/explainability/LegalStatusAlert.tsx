"use client";

import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const CITATION = "Podstawa prawna: Art. 9 ust. 1 Dyrektywy UE 2023/970";

export interface LegalStatusAlertProps {
  /** Luka płacowa w procentach */
  gapPercent: number;
  /** Próg poniżej którego brak obowiązku działania (domyślnie 5) */
  threshold?: number;
  className?: string;
}

/**
 * Alert statusu prawnego: zielony / żółty / czerwony w zależności od luki płacowej.
 * Dla Grażyny (HR): jasna informacja, czy wymagane jest działanie.
 */
export function LegalStatusAlert({
  gapPercent,
  threshold = 5,
  className,
}: LegalStatusAlertProps) {
  const rounded = Math.round(gapPercent * 10) / 10;

  if (rounded < threshold) {
    return (
      <Alert
        className={cn(
          "border-[#5BAD7F]/40 bg-[#5BAD7F]/10 text-foreground",
          className
        )}
      >
        <AlertDescription>
          <span className="font-medium">🟢 Luka poniżej progu {threshold}% — brak obowiązku działania.</span>
          <p className="mt-1 text-sm text-muted-foreground">{CITATION}</p>
        </AlertDescription>
      </Alert>
    );
  }

  if (rounded < 15) {
    return (
      <Alert
        className={cn(
          "border-[#C4934A]/50 bg-[#C4934A]/10 text-foreground",
          className
        )}
      >
        <AlertDescription>
          <span className="font-medium">🟡 Luka {rounded}% — Art. 9 wymaga wyjaśnienia przyczyn zarządowi.</span>
          <p className="mt-1 text-sm text-muted-foreground">{CITATION}</p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert
      className={cn(
        "border-[#C45A5A]/50 bg-[#C45A5A]/10 text-foreground",
        className
      )}
    >
      <AlertDescription>
        <span className="font-medium">🔴 Luka {rounded}% — wysokie ryzyko naruszenia. Zalecamy audyt wynagrodzeń.</span>
        <p className="mt-1 text-sm text-muted-foreground">{CITATION}</p>
      </AlertDescription>
    </Alert>
  );
}
