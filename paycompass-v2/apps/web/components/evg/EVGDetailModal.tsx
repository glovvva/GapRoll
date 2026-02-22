"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  ManualOverrideForm,
  type EVGAxes,
  type OverrideSuccessData,
} from "./ManualOverrideForm";

interface EVGDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positionName: string;
  positionId: string;
  axes: EVGAxes;
  onSuccess: (data: OverrideSuccessData) => void;
  onToast?: (message: string) => void;
}

const AXIS_LABELS: Record<keyof EVGAxes, string> = {
  skills: "Umiejętności",
  effort: "Wysiłek",
  responsibility: "Odpowiedzialność",
  conditions: "Warunki",
};

const AXIS_DESCRIPTIONS: Record<keyof EVGAxes, string> = {
  skills: "Wykształcenie, certyfikaty, doświadczenie, ekspertyza techniczna",
  effort: "Wysiłek fizyczny i umysłowy, stres, intensywność pracy",
  responsibility:
    "Odpowiedzialność za decyzje, budżet, zarządzanie, wpływ na firmę",
  conditions: "Bezpieczeństwo, środowisko pracy, podróże, równowaga praca–życie",
};

const AXIS_KEYS: (keyof EVGAxes)[] = [
  "skills",
  "effort",
  "responsibility",
  "conditions",
];

export function EVGDetailModal({
  open,
  onOpenChange,
  positionName,
  positionId,
  axes,
  onSuccess,
  onToast,
}: EVGDetailModalProps) {
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  function handleSuccess(data: OverrideSuccessData) {
    setShowOverrideForm(false);
    onSuccess(data);
    onOpenChange(false);
  }

  function handleClose(open: boolean) {
    if (!open) {
      setShowOverrideForm(false);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Szczegóły EVG — {positionName}
          </DialogTitle>
        </DialogHeader>

        {!showOverrideForm ? (
          <>
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                Obecna ocena według 4 kryteriów (tylko do wglądu):
              </p>
              {AXIS_KEYS.map((key) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-foreground inline-flex items-center gap-1">
                      {AXIS_LABELS[key]}
                      <InfoTooltip
                        content={
                          key === "skills"
                            ? "Wymagane kwalifikacje, wykształcenie i doświadczenie do wykonywania pracy"
                            : key === "effort"
                              ? "Fizyczny i umysłowy wysiłek wymagany na stanowisku"
                              : key === "responsibility"
                                ? "Zakres odpowiedzialności za zasoby, ludzi i decyzje"
                                : "Warunki środowiskowe i ryzyko zawodowe na stanowisku"
                        }
                        citation="Art. 4 Dyrektywy UE 2023/970"
                      />
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {axes[key]}/25
                    </span>
                  </div>
                  <Slider
                    value={[axes[key]]}
                    min={0}
                    max={25}
                    step={1}
                    disabled
                    className="py-2 opacity-80"
                  />
                  <p className="text-xs text-muted-foreground">
                    {AXIS_DESCRIPTIONS[key]}
                  </p>
                </div>
              ))}
              <div className="rounded-md border border-[#6B9FD4]/20 bg-[#6B9FD4]/5 p-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  Tolerancja ±5 pkt. Przedziały: 73–83 = równa wartość pracy
                  <InfoTooltip
                    content="Stanowiska z wynikiem EVG w tym samym przedziale ±5 pkt uznawane są za pracę o równej wartości (Art. 4 ust. 3)."
                    citation="Art. 4 ust. 3 Dyrektywy UE 2023/970"
                  />
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOverrideForm(true)}
                className="w-full sm:w-auto"
              >
                ❌ Nie zgadzam się. Zmień
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Wprowadź nowe wartości (0–25 dla każdego kryterium) oraz uzasadnienie.
            </p>
            <ManualOverrideForm
              positionId={positionId}
              currentAxes={axes}
              onSuccess={handleSuccess}
              onToast={onToast}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOverrideForm(false)}
            >
              Anuluj
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
