"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PeriodSelectorProps {
  periods: string[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  compareWithPrevious: boolean;
  onCompareToggle: (value: boolean) => void;
  className?: string;
}

export function PeriodSelector({
  periods,
  selectedPeriod,
  onPeriodChange,
  compareWithPrevious,
  onCompareToggle,
  className,
}: PeriodSelectorProps) {
  const canCompare = periods.length >= 2;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Label className="text-slate-300 text-sm whitespace-nowrap">
          Okres raportowania:
        </Label>
        <Select
          value={selectedPeriod || periods[0]}
          onValueChange={onPeriodChange}
        >
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-600 text-slate-100">
            <SelectValue placeholder="Wybierz okres" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {periods.map((p) => (
              <SelectItem key={p} value={p} className="text-slate-100">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label
        className={cn(
          "flex items-center gap-2 cursor-pointer text-sm",
          canCompare ? "text-slate-300" : "text-slate-500 cursor-not-allowed"
        )}
      >
        <input
          type="checkbox"
          checked={compareWithPrevious}
          onChange={(e) => canCompare && onCompareToggle(e.target.checked)}
          disabled={!canCompare}
          className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-teal-500"
        />
        <span>Porównaj z poprzednim okresem</span>
      </label>
    </div>
  );
}
