"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "@/components/explainability/InfoTooltip";

export interface ColumnMapping {
  first_name: string | null;
  last_name: string | null;
  position: string | null;
  gender: string | null;
  salary: string | null;
  department?: string | null;
  hire_date?: string | null;
  employment_type?: string | null;
}

export interface ColumnMapperProps {
  csvColumns: string[];
  onMappingComplete: (mapping: ColumnMapping) => void;
  onCancel: () => void;
}

const SYSTEM_FIELDS = [
  { key: "first_name", label: "Imię", required: false },
  { key: "last_name", label: "Nazwisko", required: false },
  { key: "position", label: "Stanowisko", required: true },
  { key: "gender", label: "Płeć", required: true },
  { key: "salary", label: "Wynagrodzenie", required: true },
  { key: "department", label: "Dział", required: false },
  { key: "hire_date", label: "Data zatrudnienia", required: false },
  { key: "employment_type", label: "Typ umowy", required: false },
] as const;

const AUTO_DETECT_KEYWORDS: Record<string, string[]> = {
  first_name: ["imię", "imie", "first_name", "firstname", "name"],
  last_name: ["nazwisko", "last_name", "lastname", "surname"],
  position: ["stanowisko", "position", "title", "job"],
  gender: ["płeć", "plec", "gender", "sex"],
  salary: ["wynagrodzenie", "salary", "wage", "pensja", "pay"],
  department: ["dział", "department", "departament", "oddział"],
  hire_date: [
    "hire_year",
    "hire year",
    "hire_date",
    "hire date",
    "data_zatrudnienia",
    "data zatrudnienia",
    "rok_zatrudnienia",
    "year_hired",
    "start_year",
    "start_date",
  ],
  employment_type: [
    "contract_type",
    "contract type",
    "typ_umowy",
    "typ umowy",
    "rodzaj_umowy",
    "contract",
    "umowa",
    "employment_type",
    "employment type",
  ],
};

function findSuggestedColumn(
  csvColumns: string[],
  keywords: string[]
): string | null {
  const lower = csvColumns.map((c) => c.toLowerCase());
  for (const col of lower) {
    if (keywords.some((kw) => col.includes(kw))) {
      const idx = lower.indexOf(col);
      return csvColumns[idx] ?? null;
    }
  }
  return null;
}

const EMPTY_VALUE = "__none__";

export function ColumnMapper({
  csvColumns,
  onMappingComplete,
  onCancel,
}: ColumnMapperProps) {
  const initialMapping = useMemo(() => {
    const map: Record<string, string> = {};
    for (const { key } of SYSTEM_FIELDS) {
      const suggested = findSuggestedColumn(
        csvColumns,
        AUTO_DETECT_KEYWORDS[key] ?? []
      );
      map[key] = suggested ?? EMPTY_VALUE;
    }
    return map;
  }, [csvColumns]);

  const [mapping, setMapping] = useState<Record<string, string>>(initialMapping);
  const [errors, setErrors] = useState<string[]>([]);

  const requiredKeys = SYSTEM_FIELDS.filter((f) => f.required).map((f) => f.key);
  const isComplete = requiredKeys.every(
    (key) => mapping[key] && mapping[key] !== EMPTY_VALUE
  );

  function validate(): boolean {
    const newErrors: string[] = [];
    for (const { key, label, required } of SYSTEM_FIELDS) {
      if (required && (!mapping[key] || mapping[key] === EMPTY_VALUE)) {
        newErrors.push(`Pole "${label}" jest wymagane.`);
      }
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  }

  function handleConfirm() {
    if (!validate()) return;
    const result: ColumnMapping = {
      first_name: mapping.first_name === EMPTY_VALUE ? null : mapping.first_name,
      last_name: mapping.last_name === EMPTY_VALUE ? null : mapping.last_name,
      position: mapping.position === EMPTY_VALUE ? null : mapping.position,
      gender: mapping.gender === EMPTY_VALUE ? null : mapping.gender,
      salary: mapping.salary === EMPTY_VALUE ? null : mapping.salary,
      department:
        mapping.department === EMPTY_VALUE ? null : mapping.department,
      hire_date:
        mapping.hire_date === EMPTY_VALUE ? null : mapping.hire_date,
      employment_type:
        mapping.employment_type === EMPTY_VALUE
          ? null
          : mapping.employment_type,
    };
    onMappingComplete(result);
  }

  const selectOptions = [EMPTY_VALUE, ...csvColumns];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-text-primary">Mapowanie Kolumn</CardTitle>
        <CardDescription>
          Dopasuj kolumny z CSV do pól systemu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SYSTEM_FIELDS.map(({ key, label, required }) => {
            const isOptionalRodo = key === "first_name" || key === "last_name";
            const emptyLabel = isOptionalRodo ? "-- Opcjonalne (RODO) --" : "-- Wybierz --";
            return (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                {label}
                {required && <span className="text-destructive"> *</span>}
                {isOptionalRodo && (
                  <InfoTooltip content="Pole opcjonalne. GapRoll nie wymaga danych osobowych — wystarczy employee_id." />
                )}
              </label>
              <Select
                value={mapping[key] ?? EMPTY_VALUE}
                onValueChange={(value) =>
                  setMapping((prev) => ({ ...prev, [key]: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={emptyLabel} />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border border-slate-600 text-slate-100 z-50">
                  <SelectItem value={EMPTY_VALUE}>{emptyLabel}</SelectItem>
                  {csvColumns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-[1.5rem]">
          {errors.length > 0 && (
            <div
              className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              <ul className="list-inside list-disc space-y-0.5">
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Anuluj
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!isComplete}
          >
            Zatwierdź mapowanie
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
