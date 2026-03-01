"use client";

import React, { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  Minus,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchWithAuth } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMPTY_TOOLTIPS: Record<string, string> = {
  salary_monthly_gross: "Uzupełnij aby odblokować: obliczenie luki płacowej",
  gender: "Uzupełnij aby odblokować: raport Art. 16",
  evg_group: "Uzupełnij aby odblokować: wartościowanie stanowisk",
  department: "Uzupełnij aby odblokować: analizę działów",
};

const COLUMN_LABELS: Record<string, string> = {
  employee_id: "ID pracownika (employee_id)",
  full_name: "Imię i nazwisko (full_name)",
  department: "Dział (department)",
  position_title: "Stanowisko (position_title)",
  evg_group: "Grupa EVG (evg_group)",
  gender: "Płeć (gender)",
  salary_monthly_gross: "Wynagrodzenie (salary_monthly_gross)",
  contract_type: "Typ umowy (contract_type)",
  reporting_period: "Okres (reporting_period)",
  performance_rating: "Ocena pracownika (performance_rating)",
  job_level: "Poziom stanowiska (job_level)",
  hire_date: "Data zatrudnienia (hire_date)",
  manager_id: "ID przełożonego (manager_id)",
  employment_type: "Typ zatrudnienia (employment_type)",
};

const COMPLIANCE_COLUMNS = [
  "employee_id",
  "full_name",
  "department",
  "position_title",
  "evg_group",
  "gender",
  "salary_monthly_gross",
  "contract_type",
  "reporting_period",
];

const STRATEGIA_COLUMNS = [
  "performance_rating",
  "job_level",
  "hire_date",
  "manager_id",
  "employment_type",
];

const EDITABLE_COLUMNS = new Set([
  "full_name",
  "first_name",
  "last_name",
  "department",
  "position_title",
  "gender",
  "salary_monthly_gross",
  "contract_type",
  "reporting_period",
]);

function isValEmpty(val: unknown): boolean {
  return val === null || val === undefined || val === "";
}

// --- Field validation ---
type ValidationResult = { valid: true } | { valid: false; message: string };

const FIELD_VALIDATORS: Record<string, (value: string) => ValidationResult> = {
  salary_monthly_gross: (v) => {
    const n = Number(v.replace(/[,\s]/g, "."));
    if (isNaN(n) || v.trim() === "")
      return { valid: false, message: "Podaj kwotę w PLN (np. 8000)" };
    if (n <= 0)
      return { valid: false, message: "Wynagrodzenie musi być większe od 0" };
    if (n > 500000)
      return {
        valid: false,
        message: "Wartość przekracza limit (500 000 PLN)",
      };
    if (!Number.isInteger(n * 100))
      return {
        valid: false,
        message: "Maksymalnie 2 miejsca po przecinku",
      };
    return { valid: true };
  },
  salary_bonus: (v) => {
    if (v.trim() === "") return { valid: true };
    const n = Number(v.replace(/[,\s]/g, "."));
    if (isNaN(n))
      return { valid: false, message: "Podaj kwotę w PLN (np. 1500)" };
    if (n < 0)
      return { valid: false, message: "Premia nie może być ujemna" };
    if (n > 500000)
      return {
        valid: false,
        message: "Wartość przekracza limit (500 000 PLN)",
      };
    return { valid: true };
  },
  contract_type: (v) => {
    const allowed = ["UoP", "B2B", "UZ", "UoD", "Mianowanie"];
    if (!allowed.includes(v))
      return {
        valid: false,
        message: `Dozwolone wartości: ${allowed.join(", ")}`,
      };
    return { valid: true };
  },
  gender: (v) => {
    const allowed = ["K", "M"];
    if (!allowed.includes(v))
      return {
        valid: false,
        message: "Dozwolone wartości: K (kobieta), M (mężczyzna)",
      };
    return { valid: true };
  },
  employment_type: (v) => {
    const allowed = ["full-time", "part-time"];
    if (!allowed.includes(v))
      return {
        valid: false,
        message: "Dozwolone wartości: full-time, part-time",
      };
    return { valid: true };
  },
  full_name: (v) => {
    if (v.trim().length < 2)
      return {
        valid: false,
        message: "Imię i nazwisko musi mieć min. 2 znaki",
      };
    if (v.trim().length > 100)
      return { valid: false, message: "Maksymalnie 100 znaków" };
    if (!/^[\p{L}\s\-'.]+$/u.test(v.trim()))
      return {
        valid: false,
        message: "Tylko litery, spacje i znaki - ' .",
      };
    return { valid: true };
  },
  department: (v) => {
    if (v.trim().length < 1)
      return { valid: false, message: "Dział nie może być pusty" };
    if (v.trim().length > 100)
      return { valid: false, message: "Maksymalnie 100 znaków" };
    return { valid: true };
  },
  position_title: (v) => {
    if (v.trim().length < 2)
      return { valid: false, message: "Stanowisko musi mieć min. 2 znaki" };
    if (v.trim().length > 150)
      return { valid: false, message: "Maksymalnie 150 znaków" };
    return { valid: true };
  },
};

const DEFAULT_VALIDATOR = (v: string): ValidationResult => {
  if (v.trim() === "")
    return { valid: false, message: "Pole nie może być puste" };
  if (v.length > 255)
    return { valid: false, message: "Maksymalnie 255 znaków" };
  return { valid: true };
};

function validateField(
  fieldName: string,
  value: string
): ValidationResult {
  const validator = FIELD_VALIDATORS[fieldName] ?? DEFAULT_VALIDATOR;
  return validator(value);
}

const ENUM_OPTIONS: Record<string, string[]> = {
  contract_type: ["UoP", "B2B", "UZ", "UoD", "Mianowanie"],
  gender: ["K", "M"],
  employment_type: ["full-time", "part-time"],
};

interface DataTableViewProps {
  records: Record<string, unknown>[];
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  compareWithPrevious: boolean;
  currentPeriod: string;
  previousPeriod?: string;
  previousRecords: Record<string, unknown>[];
  periods: string[];
}

export function DataTableView({
  records,
  total,
  page,
  perPage,
  onPageChange,
  onRefresh,
  compareWithPrevious,
  currentPeriod,
  previousPeriod,
  previousRecords,
}: DataTableViewProps) {
  const [editingCell, setEditingCell] = useState<{
    recordId: string;
    field: string;
    value: unknown;
  } | null>(null);
  const [editInput, setEditInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [justifyDialogOpen, setJustifyDialogOpen] = useState(false);
  const [justification, setJustification] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const formatPln = (val: unknown) =>
    val != null && !Number.isNaN(Number(val))
      ? new Intl.NumberFormat("pl-PL", {
          style: "currency",
          currency: "PLN",
          minimumFractionDigits: 0,
        }).format(Number(val))
      : "—";

  function getPrevSalary(rec: Record<string, unknown>): number | null {
    const fn = rec.full_name;
    const pos = rec.position_title ?? rec.position;
    for (const p of previousRecords) {
      if (
        String(p.full_name ?? "") === String(fn ?? "") &&
        String(p.position_title ?? p.position ?? "") === String(pos ?? "")
      ) {
        const s = p.salary_monthly_gross;
        if (typeof s === "number" && !p.rodo_masked) return s;
        return null;
      }
    }
    return null;
  }

  function getTrend(rec: Record<string, unknown>): "up" | "down" | "neutral" | null {
    if (!compareWithPrevious || rec.rodo_masked) return null;
    const curr = rec.salary_monthly_gross;
    const prev = getPrevSalary(rec);
    if (curr == null || prev == null) return null;
    const c = Number(curr);
    const p = Number(prev);
    if (c > p) return "up";
    if (c < p) return "down";
    return "neutral";
  }

  function getTrendDiff(rec: Record<string, unknown>): number | null {
    const curr = rec.salary_monthly_gross;
    const prev = getPrevSalary(rec);
    if (curr == null || prev == null) return null;
    return Number(curr) - Number(prev);
  }

  function handleCellClick(recordId: string, field: string, value: unknown) {
    if (!EDITABLE_COLUMNS.has(field)) return;
    if (STRATEGIA_COLUMNS.includes(field)) return;
    const rec = records.find((r) => String(r.id) === recordId);
    if (!rec || rec.rodo_masked) return;
    if (field === "salary_monthly_gross" && rec.rodo_masked) return;
    setEditingCell({ recordId, field, value });
    const rawVal = String(value ?? "").trim().toLowerCase();
    const initialVal =
      field === "gender"
        ? ["k", "female", "f", "kobieta"].includes(rawVal)
          ? "K"
          : ["m", "male", "mężczyzna"].includes(rawVal)
            ? "M"
            : rawVal ? String(value).trim().toUpperCase().slice(0, 1) : ""
        : String(value ?? "");
    setEditInput(initialVal);
    setValidationError(null);
    setJustification("");
  }

  function handleInlineSaveClick() {
    if (!editingCell) return;
    const result = validateField(editingCell.field, editInput);
    if (!result.valid) {
      setValidationError(result.message);
      return;
    }
    setValidationError(null);
    setJustifyDialogOpen(true);
  }

  function handleSaveClick() {
    if (!editingCell || justification.trim().length < 20) return;
    setJustifyDialogOpen(false);
    const { recordId, field } = editingCell;
    fetchWithAuth(`/api/data/records/${recordId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field,
        new_value: editInput,
        justification: justification.trim(),
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Błąd zapisu");
        }
        const data = (await res.json()) as { audit_entry_id?: string };
        toast.success(
          `Zmiana zapisana. Wpis audytu: #${data.audit_entry_id ?? "—"}`
        );
        onRefresh();
        setEditingCell(null);
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Błąd zapisu. Spróbuj ponownie.");
      });
  }

  function renderCell(
    rec: Record<string, unknown>,
    field: string,
    value: unknown
  ) {
    const recordId = String(rec.id ?? "");
    const isLocked = STRATEGIA_COLUMNS.includes(field);
    const isEditing =
      editingCell?.recordId === recordId && editingCell?.field === field;
    const editable = EDITABLE_COLUMNS.has(field) && !isLocked && !rec.rodo_masked;
    const forbiddenEdit =
      field === "employee_id" || field === "evg_group" || field === "evg_score";
    const canEdit = editable && !forbiddenEdit;

    if (isLocked) {
      return (
        <div className="relative flex items-center justify-center bg-slate-700/50 opacity-60 cursor-not-allowed min-h-[40px]">
          <Lock className="h-3 w-3 text-slate-500 mr-1" />
          <span className="text-slate-500 text-xs">Strategia</span>
        </div>
      );
    }

    if (rec.rodo_masked && (field === "salary_monthly_gross" || field === "salary_bonus")) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-slate-500 italic">— (RODO)</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              Dane zanonimizowane — zbyt mała liczba osób w grupie (Art. 5 RODO)
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    const isEmpty = isValEmpty(value);
    const tooltipMsg =
      EMPTY_TOOLTIPS[field] ?? "Uzupełnij dane pracownika";
    const cellClass = isEmpty
      ? "bg-amber-500/20 border border-amber-500/40"
      : "";

    if (isEditing) {
      const isEnumField = Object.keys(ENUM_OPTIONS).includes(field);
      const isNumericField = [
        "salary_monthly_gross",
        "salary_bonus",
      ].includes(field);

      const enumValue = isEnumField && ENUM_OPTIONS[field].includes(editInput)
        ? editInput
        : "";

      const editControl = isEnumField ? (
        <Select
          value={enumValue}
          onValueChange={(val) => {
            setEditInput(val);
            setValidationError(null);
          }}
        >
          <SelectTrigger
            className={cn(
              "h-8 w-full min-w-[120px] border-teal-500 bg-slate-800 text-slate-100",
              validationError && "border-red-500"
            )}
          >
            <SelectValue placeholder="Wybierz..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {ENUM_OPTIONS[field].map((opt) => (
              <SelectItem
                key={opt}
                value={opt}
                className="text-slate-100 hover:bg-slate-700"
              >
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type="text"
          inputMode={isNumericField ? "decimal" : "text"}
          value={editInput}
          onChange={(e) => {
            setEditInput(e.target.value);
            setValidationError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleInlineSaveClick();
              return;
            }
            if (e.key === "Escape") {
              setEditingCell(null);
              return;
            }
            if (
              isNumericField &&
              !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(
                e.key
              ) &&
              !/^[0-9,.]$/.test(e.key)
            ) {
              e.preventDefault();
            }
          }}
          className={cn(
            "h-8 text-sm w-32 bg-slate-800 border-slate-600",
            validationError && "border-red-500"
          )}
          autoFocus
        />
      );

      return (
        <div className="flex flex-col gap-1 py-2">
          <div className="flex items-center gap-1 flex-wrap">
            {editControl}
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-teal-500 hover:bg-teal-500/20"
              onClick={handleInlineSaveClick}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-400 hover:bg-slate-600"
              onClick={() => setEditingCell(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          {validationError && (
            <p className="text-xs text-red-400 leading-tight">
              {validationError}
            </p>
          )}
        </div>
      );
    }

    const displayVal =
      field === "salary_monthly_gross"
        ? formatPln(value)
        : value !== null && value !== undefined && value !== ""
          ? String(value)
          : "—";
    const trend = field === "salary_monthly_gross" ? getTrend(rec) : null;
    const trendDiff = field === "salary_monthly_gross" ? getTrendDiff(rec) : null;

    const content = (
      <div className="flex items-center gap-1">
        <span>{displayVal}</span>
        {trend === "up" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <TrendingUp className="h-3 w-3 text-green-500 inline ml-1" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                vs. {previousPeriod}: +{formatPln(trendDiff)} PLN
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {trend === "down" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <TrendingDown className="h-3 w-3 text-red-500 inline ml-1" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                vs. {previousPeriod}: {formatPln(trendDiff)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {trend === "neutral" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Minus className="h-3 w-3 text-slate-400 inline ml-1" />
                </span>
              </TooltipTrigger>
              <TooltipContent>vs. {previousPeriod}: bez zmiany</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );

    const cell = (
      <div
        className={cn(
          "py-3 px-4 text-sm text-slate-100 min-h-[40px] flex items-center",
          cellClass,
          canEdit && "cursor-pointer hover:bg-slate-700/50"
        )}
        onClick={() => canEdit && handleCellClick(recordId, field, value)}
      >
        {content}
      </div>
    );

    if (isEmpty || canEdit) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{cell}</TooltipTrigger>
            <TooltipContent className="max-w-xs">{tooltipMsg}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return cell;
  }

  const showStrategiaUpsell = STRATEGIA_COLUMNS.length > 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {COMPLIANCE_COLUMNS.map((col) => (
                <th
                  key={col}
                  className="text-slate-300 text-xs font-semibold uppercase tracking-wider py-3 px-4 text-left"
                >
                  {COLUMN_LABELS[col] ?? col}
                </th>
              ))}
              {STRATEGIA_COLUMNS.map((col, idx) => (
                <th
                  key={col}
                  className="text-slate-300 text-xs font-semibold uppercase tracking-wider py-3 px-4 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-slate-500" />
                    {COLUMN_LABELS[col] ?? col}
                    {idx === 0 && showStrategiaUpsell && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-teal-500 hover:bg-teal-600 text-white text-xs ml-2"
                              onClick={() =>
                                window.open("/dashboard?upgrade=strategia", "_self")
                              }
                            >
                              Odblokuj Strategię →
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            Dostępne w planie Strategia (od 199 PLN/mies.) —
                            odblokuj Root Cause Analysis i więcej
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={String(rec.id)} className="border-b border-slate-700/50">
                {COMPLIANCE_COLUMNS.map((col) => (
                  <td key={col} className="p-0">
                    {renderCell(rec, col, rec[col])}
                  </td>
                ))}
                {STRATEGIA_COLUMNS.map((col) => (
                  <td key={col} className="p-0">
                    {renderCell(rec, col, rec[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-slate-700 text-slate-400 text-sm">
        <span>
          Strona {page} z {totalPages} | Łącznie: {total} pracowników
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={justifyDialogOpen} onOpenChange={setJustifyDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              Potwierdź zmianę danych
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Każda zmiana jest rejestrowana w dzienniku audytu zgodnie z
              wymogami Art. 7 Dyrektywy UE 2023/970.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              Uzasadnienie zmiany (wymagane, min. 20 znaków)
            </label>
            <Input
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="np. Korekta po weryfikacji z kadrami"
              className="bg-slate-900 border-slate-600 text-slate-100"
              minLength={20}
            />
            {justification.length > 0 && justification.length < 20 && (
              <p className="text-amber-400 text-xs">
                Wpisz minimum 20 znaków ({justification.length}/20)
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setJustifyDialogOpen(false)}
              className="border-slate-600 text-slate-300"
            >
              Anuluj
            </Button>
            <Button
              className="bg-teal-500 hover:bg-teal-600"
              onClick={handleSaveClick}
              disabled={justification.trim().length < 20}
            >
              Zapisz zmianę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
