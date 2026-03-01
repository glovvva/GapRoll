"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  generateScenarios,
  getMinimumBudgetForTarget,
  computeAchievableGap,
  computeGap,
  type Employee,
  type SolioConstraints,
  type SolioScenario,
  type SolioRaise,
} from "@/lib/solio-algorithm";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip as ChartTooltip, Legend } from "recharts";
import { ChevronDown, ChevronRight, FileDown } from "lucide-react";
import { CHART_COLORS } from "@/lib/chart-colors";

const PRESETS = {
  Ostrożny: { targetGap: 8, budgetLimit: 100000, minRaise: 500, lockSenior: true },
  Zbalansowany: { targetGap: 5, budgetLimit: 200000, minRaise: 500, lockSenior: false },
  Agresywny: { targetGap: 2, budgetLimit: 500000, minRaise: 300, lockSenior: false },
} as const;

type PresetKey = keyof typeof PRESETS;

// TODO: Replace with Supabase fetch when backend API ready
const MOCK_EMPLOYEES: Employee[] = [
  { id: "EMP0001", gender: "M", salary: 13150, department: "IT", position: "Programista Senior", evg_group: "EVG-3" },
  { id: "EMP0002", gender: "M", salary: 9500, department: "IT", position: "Programista Junior", evg_group: "EVG-3" },
  { id: "EMP0003", gender: "M", salary: 11400, department: "IT", position: "DevOps Engineer", evg_group: "EVG-3" },
  { id: "EMP0004", gender: "M", salary: 15150, department: "IT", position: "Architekt IT", evg_group: "EVG-3" },
  { id: "EMP0005", gender: "M", salary: 10050, department: "IT", position: "Programista Senior", evg_group: "EVG-3" },
  { id: "EMP0006", gender: "M", salary: 9600, department: "IT", position: "Tester QA", evg_group: "EVG-3" },
  { id: "EMP0007", gender: "M", salary: 9050, department: "IT", position: "Programista Junior", evg_group: "EVG-3" },
  { id: "EMP0008", gender: "M", salary: 11800, department: "IT", position: "DevOps Engineer", evg_group: "EVG-3" },
  { id: "EMP0009", gender: "M", salary: 8600, department: "IT", position: "Tester QA", evg_group: "EVG-3" },
  { id: "EMP0010", gender: "M", salary: 12350, department: "IT", position: "Programista Senior", evg_group: "EVG-3" },
  { id: "EMP0011", gender: "M", salary: 9100, department: "IT", position: "Tester QA", evg_group: "EVG-3" },
  { id: "EMP0012", gender: "K", salary: 7700, department: "IT", position: "Tester QA", evg_group: "EVG-3" },
  { id: "EMP0013", gender: "K", salary: 9950, department: "IT", position: "Programista Senior", evg_group: "EVG-3" },
  { id: "EMP0014", gender: "K", salary: 7200, department: "Finanse", position: "Kontroler", evg_group: "EVG-2" },
  { id: "EMP0015", gender: "K", salary: 6100, department: "Finanse", position: "Księgowy", evg_group: "EVG-2" },
  { id: "EMP0016", gender: "K", salary: 8800, department: "Finanse", position: "Analityk Finansowy", evg_group: "EVG-2" },
  { id: "EMP0017", gender: "K", salary: 6550, department: "Finanse", position: "Księgowy", evg_group: "EVG-2" },
  { id: "EMP0018", gender: "K", salary: 7650, department: "Finanse", position: "Analityk Finansowy", evg_group: "EVG-2" },
  { id: "EMP0019", gender: "M", salary: 13800, department: "Finanse", position: "Dyrektor Finansowy", evg_group: "EVG-2" },
  { id: "EMP0020", gender: "K", salary: 6250, department: "Finanse", position: "Księgowy", evg_group: "EVG-2" },
  { id: "EMP0021", gender: "K", salary: 9900, department: "Finanse", position: "Główny Księgowy", evg_group: "EVG-2" },
  { id: "EMP0022", gender: "K", salary: 7400, department: "Finanse", position: "Kontroler", evg_group: "EVG-2" },
  { id: "EMP0023", gender: "K", salary: 6900, department: "Finanse", position: "Analityk Finansowy", evg_group: "EVG-2" },
  { id: "EMP0024", gender: "K", salary: 6450, department: "Finanse", position: "Księgowy", evg_group: "EVG-2" },
  { id: "EMP0025", gender: "M", salary: 10700, department: "Finanse", position: "Główny Księgowy", evg_group: "EVG-2" },
  { id: "EMP0026", gender: "K", salary: 7100, department: "Finanse", position: "Kontroler", evg_group: "EVG-2" },
  { id: "EMP0027", gender: "K", salary: 8400, department: "Finanse", position: "Analityk Finansowy", evg_group: "EVG-2" },
  { id: "EMP0028", gender: "K", salary: 6700, department: "Finanse", position: "Księgowy", evg_group: "EVG-2" },
  { id: "EMP0029", gender: "M", salary: 11500, department: "Finanse", position: "Dyrektor Finansowy", evg_group: "EVG-2" },
  { id: "EMP0030", gender: "K", salary: 6050, department: "Finanse", position: "Księgowy", evg_group: "EVG-2" },
  { id: "EMP0031", gender: "K", salary: 7950, department: "Finanse", position: "Analityk Finansowy", evg_group: "EVG-2" },
  { id: "EMP0032", gender: "K", salary: 6300, department: "Finanse", position: "Księgowy", evg_group: "EVG-2" },
  { id: "EMP0033", gender: "K", salary: 5700, department: "HR", position: "Specjalista HR", evg_group: "EVG-1" },
  { id: "EMP0034", gender: "K", salary: 6650, department: "HR", position: "HR Business Partner", evg_group: "EVG-1" },
  { id: "EMP0035", gender: "K", salary: 5550, department: "HR", position: "Rekruter", evg_group: "EVG-1" },
  { id: "EMP0036", gender: "K", salary: 8350, department: "HR", position: "Kierownik HR", evg_group: "EVG-1" },
  { id: "EMP0037", gender: "M", salary: 9450, department: "HR", position: "Dyrektor HR", evg_group: "EVG-1" },
  { id: "EMP0038", gender: "K", salary: 5900, department: "HR", position: "Rekruter", evg_group: "EVG-1" },
  { id: "EMP0039", gender: "K", salary: 6200, department: "HR", position: "Specjalista HR", evg_group: "EVG-1" },
  { id: "EMP0040", gender: "M", salary: 7700, department: "HR", position: "Kierownik HR", evg_group: "EVG-1" },
  { id: "EMP0041", gender: "K", salary: 5750, department: "HR", position: "Rekruter", evg_group: "EVG-1" },
  { id: "EMP0042", gender: "K", salary: 6450, department: "HR", position: "HR Business Partner", evg_group: "EVG-1" },
  { id: "EMP0043", gender: "K", salary: 5600, department: "HR", position: "Specjalista HR", evg_group: "EVG-1" },
  { id: "EMP0044", gender: "K", salary: 7200, department: "HR", position: "Kierownik HR", evg_group: "EVG-1" },
  { id: "EMP0045", gender: "K", salary: 5850, department: "HR", position: "Rekruter", evg_group: "EVG-1" },
  { id: "EMP0046", gender: "K", salary: 6100, department: "HR", position: "Specjalista HR", evg_group: "EVG-1" },
  { id: "EMP0047", gender: "M", salary: 8100, department: "HR", position: "Dyrektor HR", evg_group: "EVG-1" },
  { id: "EMP0048", gender: "K", salary: 5650, department: "HR", position: "Rekruter", evg_group: "EVG-1" },
  { id: "EMP0049", gender: "K", salary: 6350, department: "HR", position: "HR Business Partner", evg_group: "EVG-1" },
  { id: "EMP0050", gender: "K", salary: 5800, department: "HR", position: "Specjalista HR", evg_group: "EVG-1" },
  { id: "EMP0051", gender: "K", salary: 6900, department: "HR", position: "Kierownik HR", evg_group: "EVG-1" },
  { id: "EMP0052", gender: "K", salary: 5950, department: "HR", position: "Rekruter", evg_group: "EVG-1" },
  { id: "EMP0053", gender: "M", salary: 8950, department: "Sprzedaż", position: "Dyrektor Sprzedaży", evg_group: "EVG-2" },
  { id: "EMP0054", gender: "K", salary: 7350, department: "Sprzedaż", position: "Key Account Manager", evg_group: "EVG-2" },
  { id: "EMP0055", gender: "K", salary: 6150, department: "Sprzedaż", position: "Specjalista ds. Sprzedaży", evg_group: "EVG-2" },
  { id: "EMP0056", gender: "M", salary: 11200, department: "Sprzedaż", position: "Dyrektor Sprzedaży", evg_group: "EVG-2" },
  { id: "EMP0057", gender: "K", salary: 5800, department: "Sprzedaż", position: "Specjalista ds. Sprzedaży", evg_group: "EVG-2" },
  { id: "EMP0058", gender: "K", salary: 8100, department: "Sprzedaż", position: "Key Account Manager", evg_group: "EVG-2" },
  { id: "EMP0059", gender: "M", salary: 9700, department: "Sprzedaż", position: "Dyrektor Sprzedaży", evg_group: "EVG-2" },
  { id: "EMP0060", gender: "K", salary: 6600, department: "Sprzedaż", position: "Specjalista ds. Sprzedaży", evg_group: "EVG-2" },
  { id: "EMP0061", gender: "K", salary: 7800, department: "Sprzedaż", position: "Key Account Manager", evg_group: "EVG-2" },
  { id: "EMP0062", gender: "M", salary: 8400, department: "Sprzedaż", position: "Key Account Manager", evg_group: "EVG-2" },
  { id: "EMP0063", gender: "M", salary: 6850, department: "Sprzedaż", position: "Przedstawiciel Handlowy", evg_group: "EVG-2" },
  { id: "EMP0064", gender: "K", salary: 6000, department: "Sprzedaż", position: "Przedstawiciel Handlowy", evg_group: "EVG-2" },
  { id: "EMP0065", gender: "K", salary: 7050, department: "Sprzedaż", position: "Key Account Manager", evg_group: "EVG-2" },
  { id: "EMP0066", gender: "M", salary: 10150, department: "Marketing", position: "Dyrektor Marketingu", evg_group: "EVG-2" },
  { id: "EMP0067", gender: "M", salary: 8200, department: "Marketing", position: "Manager Marketingu", evg_group: "EVG-2" },
  { id: "EMP0068", gender: "M", salary: 7100, department: "Marketing", position: "SEO Specialist", evg_group: "EVG-2" },
  { id: "EMP0069", gender: "M", salary: 6600, department: "Marketing", position: "Copywriter", evg_group: "EVG-2" },
  { id: "EMP0070", gender: "M", salary: 9050, department: "Marketing", position: "Manager Marketingu", evg_group: "EVG-2" },
  { id: "EMP0071", gender: "K", salary: 6150, department: "Marketing", position: "Specjalista Marketing", evg_group: "EVG-2" },
  { id: "EMP0072", gender: "M", salary: 7750, department: "Marketing", position: "SEO Specialist", evg_group: "EVG-2" },
  { id: "EMP0073", gender: "K", salary: 5450, department: "Marketing", position: "Copywriter", evg_group: "EVG-2" },
  { id: "EMP0074", gender: "M", salary: 11300, department: "Marketing", position: "Dyrektor Marketingu", evg_group: "EVG-2" },
  { id: "EMP0075", gender: "M", salary: 6900, department: "Marketing", position: "SEO Specialist", evg_group: "EVG-2" },
  { id: "EMP0076", gender: "K", salary: 7400, department: "Marketing", position: "Manager Marketingu", evg_group: "EVG-2" },
  { id: "EMP0077", gender: "M", salary: 7400, department: "Marketing", position: "Copywriter", evg_group: "EVG-2" },
  { id: "EMP0078", gender: "K", salary: 5900, department: "Marketing", position: "Specjalista Marketing", evg_group: "EVG-2" },
  { id: "EMP0079", gender: "M", salary: 8550, department: "Marketing", position: "Manager Marketingu", evg_group: "EVG-2" },
  { id: "EMP0080", gender: "M", salary: 7200, department: "Marketing", position: "SEO Specialist", evg_group: "EVG-2" },
  { id: "EMP0081", gender: "M", salary: 8600, department: "Marketing", position: "Manager Marketingu", evg_group: "EVG-2" },
  { id: "EMP0082", gender: "K", salary: 5000, department: "Operacje", position: "Koordynator", evg_group: "EVG-1" },
  { id: "EMP0083", gender: "M", salary: 6450, department: "Operacje", position: "Kierownik Operacyjny", evg_group: "EVG-1" },
  { id: "EMP0084", gender: "K", salary: 5350, department: "Operacje", position: "Specjalista Operacyjny", evg_group: "EVG-1" },
  { id: "EMP0085", gender: "M", salary: 5650, department: "Operacje", position: "Analityk Procesów", evg_group: "EVG-1" },
  { id: "EMP0086", gender: "K", salary: 6100, department: "Operacje", position: "Kierownik Operacyjny", evg_group: "EVG-1" },
  { id: "EMP0087", gender: "M", salary: 7200, department: "Operacje", position: "Kierownik Operacyjny", evg_group: "EVG-1" },
  { id: "EMP0088", gender: "K", salary: 5150, department: "Operacje", position: "Koordynator", evg_group: "EVG-1" },
  { id: "EMP0089", gender: "K", salary: 5700, department: "Operacje", position: "Analityk Procesów", evg_group: "EVG-1" },
  { id: "EMP0090", gender: "M", salary: 6100, department: "Operacje", position: "Analityk Procesów", evg_group: "EVG-1" },
  { id: "EMP0091", gender: "K", salary: 4950, department: "Operacje", position: "Koordynator", evg_group: "EVG-1" },
  { id: "EMP0092", gender: "M", salary: 5900, department: "Operacje", position: "Specjalista Operacyjny", evg_group: "EVG-1" },
  { id: "EMP0093", gender: "K", salary: 5500, department: "Operacje", position: "Specjalista Operacyjny", evg_group: "EVG-1" },
  { id: "EMP0094", gender: "M", salary: 6750, department: "Operacje", position: "Kierownik Operacyjny", evg_group: "EVG-1" },
];

const SCENARIO_LETTER: Record<string, string> = {
  "Minimalne koszty": "A",
  "Zbalansowany": "B",
  "Ekspresowy": "C",
};

const hasPerformanceData = MOCK_EMPLOYEES.some((e) => (e as { performance_rating?: number }).performance_rating != null);

/** Polish number format as integer: 180 000 PLN (no decimals) */
function formatPLN(value: number): string {
  return Math.round(value).toLocaleString("pl-PL", { useGrouping: true }).replace(/\s/g, "\u00A0") + "\u00A0PLN";
}

const BUCKET_SIZE = 1000;
/** Build histogram data: buckets 0–1000, 1000–2000, … with counts. */
function buildRaiseHistogram(raises: { raise: number }[]): { range: string; count: number }[] {
  const maxRaise = raises.length > 0 ? Math.max(...raises.map((r) => r.raise)) : 0;
  const numBuckets = Math.max(1, Math.min(15, Math.ceil(maxRaise / BUCKET_SIZE) + 1));
  const buckets: { range: string; count: number }[] = [];
  for (let i = 0; i < numBuckets; i++) {
    const low = i * BUCKET_SIZE;
    const high = (i + 1) * BUCKET_SIZE;
    const count = raises.filter((r) => r.raise >= low && r.raise < high).length;
    buckets.push({ range: `${low}–${high}`, count });
  }
  return buckets;
}

function buildDeptComparisonData(employees: Employee[], raises: SolioRaise[]) {
  const depts = [...new Set(employees.map((e) => e.department))];
  const medianSalary = (arr: number[]) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };
  const raiseMap = Object.fromEntries(raises.map((r) => [r.id, r.raise]));
  return depts
    .map((dept) => {
      const deptEmp = employees.filter((e) => e.department === dept);
      const women = deptEmp.filter((e) => e.gender === "K");
      const men = deptEmp.filter((e) => e.gender === "M");
      const womenBefore = medianSalary(women.map((e) => e.salary));
      const womenAfter = medianSalary(women.map((e) => e.salary + (raiseMap[e.id] ?? 0)));
      const menMedian = medianSalary(men.map((e) => e.salary));
      return {
        dept: dept.substring(0, 6),
        "Kobiety (przed)": womenBefore,
        "Kobiety (po)": womenAfter,
        Mężczyźni: menMedian,
      };
    })
    .filter((d) => d.Mężczyźni > 0);
}

function buildTimelineData(scenario: SolioScenario, scenarioIndex: number) {
  const total = scenario.totalCost;
  const distributions = [
    [0.25, 0.25, 0.25, 0.25],
    [0.6, 0.4, 0, 0],
    [1.0, 0, 0, 0],
  ];
  const dist = distributions[scenarioIndex] ?? distributions[1];
  const year = 2026;
  return ["Q1", "Q2", "Q3", "Q4"]
    .map((q, i) => ({
      quarter: `${q} ${year}`,
      budget: Math.round(total * dist[i]),
      cumulative: Math.round(total * dist.slice(0, i + 1).reduce((a, b) => a + b, 0)),
    }))
    .filter((d) => d.budget > 0);
}

/** CSV: Polish decimal separator (comma); filename optymalizator-scenariusz-{a|b|c}-{date}.csv */
function exportToCSV(scenario: SolioScenario): void {
  const letter = SCENARIO_LETTER[scenario.name] ?? "x";
  const date = new Date().toISOString().slice(0, 10);
  const header = "employee_id;department;position;current_salary;raise_amount;new_salary";
  const rows = scenario.raises.map(
    (r) =>
      `${r.id};${r.department};${r.position};${Math.round(r.oldSalary)};${Math.round(r.raise)};${Math.round(r.newSalary)}`
  );
  const csv = [header, ...rows].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `optymalizator-scenariusz-${letter.toLowerCase()}-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function filterEmployeesForConstraints(
  employees: Employee[],
  constraints: SolioConstraints
): Employee[] {
  let list = employees;
  if (constraints.departmentFilter !== "ALL" && constraints.departmentFilter.length > 0) {
    const depts = new Set(constraints.departmentFilter);
    list = list.filter((e) => depts.has(e.department));
  }
  if (constraints.lockSenior) {
    list = list.filter((e) => !/Dyrektor|Manager|Kierownik/i.test(e.position));
  }
  if (constraints.bannedIds && constraints.bannedIds.length > 0) {
    const banned = new Set(constraints.bannedIds);
    list = list.filter((e) => !banned.has(e.id));
  }
  return list;
}

export default function SolioSolverPage() {
  const [targetGapPercent, setTargetGapPercent] = useState(5);
  const [budgetLimit, setBudgetLimit] = useState("");
  const [minRaise, setMinRaise] = useState(500);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [lockSenior, setLockSenior] = useState(false);
  const [performanceEnabled, setPerformanceEnabled] = useState(false);
  const [performanceWeight, setPerformanceWeight] = useState(0.3);
  const [lockedIds, setLockedIds] = useState<string[]>([]);
  const [bannedIds, setBannedIds] = useState<string[]>([]);
  const [scenarios, setScenarios] = useState<SolioScenario[] | null>(null);
  const [lastConstraints, setLastConstraints] = useState<SolioConstraints | null>(null);
  const [altScenarios, setAltScenarios] = useState<SolioScenario[] | null>(null);
  const [altBudget, setAltBudget] = useState<number | null>(null);

  const departments = ["IT", "Finanse", "HR", "Sprzedaż", "Marketing", "Operacje"];

  const applyPreset = (key: PresetKey) => {
    const p = PRESETS[key];
    setTargetGapPercent(p.targetGap);
    setBudgetLimit(String(p.budgetLimit));
    setMinRaise(p.minRaise);
    setLockSenior(p.lockSenior);
  };

  const activePreset: PresetKey | null =
    (Object.keys(PRESETS) as PresetKey[]).find(
      (key) =>
        PRESETS[key].targetGap === targetGapPercent &&
        String(PRESETS[key].budgetLimit) === budgetLimit &&
        PRESETS[key].minRaise === minRaise &&
        PRESETS[key].lockSenior === lockSenior
    ) ?? null;

  const addLocked = (id: string) => {
    if (bannedIds.includes(id)) return;
    setLockedIds((prev) => [...prev, id]);
  };
  const addBanned = (id: string) => {
    if (lockedIds.includes(id)) return;
    setBannedIds((prev) => [...prev, id]);
  };
  const removeLocked = (id: string) => setLockedIds((prev) => prev.filter((x) => x !== id));
  const removeBanned = (id: string) => setBannedIds((prev) => prev.filter((x) => x !== id));

  const runSimulation = () => {
    const budget = Number(budgetLimit) || 0;
    if (budget <= 0) {
      setScenarios([]);
      setLastConstraints(null);
      setAltScenarios(null);
      setAltBudget(null);
      return;
    }
    const departmentFilter: SolioConstraints["departmentFilter"] =
      selectedDepts.length === 0 || selectedDepts.length === departments.length
        ? "ALL"
        : selectedDepts;
    const constraints: SolioConstraints = {
      targetGap: targetGapPercent / 100,
      budgetLimit: budget,
      minRaise,
      departmentFilter,
      lockSenior,
      performanceWeight: performanceEnabled && hasPerformanceData ? performanceWeight : undefined,
      lockedIds: lockedIds.length > 0 ? lockedIds : undefined,
      bannedIds: bannedIds.length > 0 ? bannedIds : undefined,
    };
    setLastConstraints(constraints);
    const result = generateScenarios(MOCK_EMPLOYEES, constraints);
    setScenarios(result);
    setAltScenarios(null);
    setAltBudget(null);
  };

  const runAlternative = () => {
    if (!lastConstraints) return;
    const budget = Math.round(lastConstraints.budgetLimit * 1.2);
    const constraints: SolioConstraints = {
      ...lastConstraints,
      budgetLimit: budget,
    };
    setAltBudget(budget);
    const result = generateScenarios(MOCK_EMPLOYEES, constraints);
    setAltScenarios(result);
  };

  const filteredForMetrics =
    lastConstraints != null
      ? filterEmployeesForConstraints(MOCK_EMPLOYEES, lastConstraints)
      : [];
  const initialGapPercent =
    filteredForMetrics.length > 0 ? computeGap(filteredForMetrics) * 100 : 0;
  const womenCount = filteredForMetrics.filter((e) => e.gender === "K").length;

  const showResults = scenarios !== null && scenarios.length > 0;
  const anyTargetNotReached = showResults && scenarios.some((s) => !s.targetReached);
  const alreadyBelowTarget =
    showResults &&
    scenarios.length > 0 &&
    scenarios[0].raises.length === 0 &&
    scenarios[0].targetReached;
  const minBudget =
    lastConstraints && anyTargetNotReached
      ? getMinimumBudgetForTarget(MOCK_EMPLOYEES, lastConstraints)
      : 0;
  const achievableGap =
    lastConstraints && anyTargetNotReached
      ? computeAchievableGap(MOCK_EMPLOYEES, lastConstraints)
      : 0;
  const achievableGapPercent = achievableGap * 100;
  const targetPercent = lastConstraints ? lastConstraints.targetGap * 100 : targetGapPercent;
  const currentGapPercent = showResults && scenarios[0] ? scenarios[0].newGap * 100 : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-primary">
            Optymalizator Budżetowy — Wyrównanie Luk Płacowych
          </h1>
          <Badge variant="outline">Strategia</Badge>
        </div>
        <p className="text-text-secondary">
          Narzędzie Strategia | Art. 9 Dyrektywy 2023/970
        </p>
      </div>

      {/* Info bar */}
      <Alert className="border-border bg-card">
        <AlertDescription>
          Optymalizator Budżetowy oblicza minimalne korekty wynagrodzeń potrzebne do
          osiągnięcia docelowej luki płacowej. Podstawa prawna: Art. 9 ust. 1
          Dyrektywy 2023/970.
        </AlertDescription>
      </Alert>

      {/* Summary metrics bar — visible after simulation */}
      {showResults && lastConstraints && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <span className="text-text-secondary">Luka obecna: </span>
            <span className="font-semibold text-[#e040fb]">{initialGapPercent.toFixed(1)}%</span>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <span className="text-text-secondary">Cel: </span>
            <span className="font-semibold text-[#e040fb]">{(lastConstraints.targetGap * 100).toFixed(1)}%</span>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <span className="text-text-secondary">Min. budżet: </span>
            <span className="font-semibold text-[#e040fb]">{formatPLN(getMinimumBudgetForTarget(MOCK_EMPLOYEES, lastConstraints))}</span>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <span className="text-text-secondary">Pracownicy K: </span>
            <span className="font-semibold text-[#e040fb]">{womenCount}</span>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: Parametry Optymalizacji */}
        <div className="relative">
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle>Parametry Optymalizacji</CardTitle>
            <CardDescription>
              Ustawienia symulacji budżetu wyrównawczego
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Szybki start: presets */}
            <div className="space-y-2">
              <Label className="text-text-secondary">Szybki start:</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
                  <Button
                    key={key}
                    type="button"
                    variant={activePreset === key ? "default" : "outline"}
                    size="sm"
                    className={activePreset === key ? "bg-[#e040fb] text-white hover:bg-[#e040fb]/90 border-[#e040fb]" : ""}
                    onClick={() => applyPreset(key)}
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>

            {/* 1. TARGET GAP — Slider */}
            <div className="space-y-2">
              <Label>
                Docelowa luka płacowa (%)
              </Label>
              <Slider
                value={[targetGapPercent]}
                onValueChange={(v) => setTargetGapPercent(v[0])}
                min={0}
                max={15}
                step={0.5}
                className="w-full [&_.relative]:bg-elevated [&_span[data-orientation]]:bg-[#e040fb] [&_[role=slider]]:bg-[#e040fb] [&_[role=slider]]:border-[#e040fb] [&_[role=slider]]:border-2 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:shadow-[0_0_8px_rgba(224,64,251,0.6)]"
              />
              <p className="text-xs text-text-secondary">
                {targetGapPercent}%. Art. 9: Luka powyżej 5% wymaga uzasadnienia
              </p>
            </div>

            {/* 2. BUDGET LIMIT — Input */}
            <div className="space-y-2">
              <Label htmlFor="budget">Maksymalny budżet korekt (PLN)</Label>
              <Input
                id="budget"
                type="number"
                min={0}
                placeholder="np. 200000"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
              />
              <p className="text-xs text-text-secondary">
                Łączna suma podwyżek nie może przekroczyć tej kwoty
              </p>
            </div>

            {/* 3. MIN RAISE — Input */}
            <div className="space-y-2">
              <Label htmlFor="minRaise">Minimalna korekta na osobę (PLN)</Label>
              <Input
                id="minRaise"
                type="number"
                min={0}
                value={minRaise}
                onChange={(e) => setMinRaise(Number(e.target.value) || 0)}
              />
              <p className="text-xs text-text-secondary">
                Unikaj symbolicznych podwyżek poniżej tej kwoty
              </p>
            </div>

            {/* 4. DEPARTMENT FILTER — multi-select checkboxes */}
            <div className="space-y-2">
              <Label className="text-white">Ogranicz do działów</Label>
              <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={selectedDepts.length === 0 || selectedDepts.length === departments.length}
                    onChange={() => {
                      if (selectedDepts.length === departments.length) setSelectedDepts([]);
                      else setSelectedDepts([...departments]);
                    }}
                    className="h-4 w-4 rounded border-border bg-elevated text-[#e040fb] focus:ring-[#e040fb]"
                  />
                  <span>Wszystkie działy</span>
                </label>
                {departments.map((d) => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={selectedDepts.length === 0 || selectedDepts.includes(d)}
                      onChange={() => {
                        if (selectedDepts.length === 0) {
                          setSelectedDepts(departments.filter((x) => x !== d));
                        } else if (selectedDepts.includes(d)) {
                          const next = selectedDepts.filter((x) => x !== d);
                          setSelectedDepts(next.length === 0 ? [] : next);
                        } else {
                          setSelectedDepts([...selectedDepts, d].sort());
                        }
                      }}
                      className="h-4 w-4 rounded border-border bg-elevated text-[#e040fb] focus:ring-[#e040fb]"
                    />
                    <span>{d}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Performance Priority */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Priorytetyzuj wg wyników</p>
                  <p className="text-xs text-text-muted">
                    {hasPerformanceData
                      ? "Pracownicy z wyższą oceną dostaną podwyżkę w pierwszej kolejności"
                      : "Dodaj kolumnę performance_rating do CSV aby odblokować"}
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-block">
                        <Switch
                          checked={performanceEnabled}
                          onCheckedChange={setPerformanceEnabled}
                          disabled={!hasPerformanceData}
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800 text-slate-100 border-slate-600">
                      {hasPerformanceData ? "Włącz priorytetyzację wg oceny" : "Brak kolumny performance_rating w danych"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {performanceEnabled && hasPerformanceData && (
                <div className="space-y-2">
                  <label className="text-xs text-text-secondary">
                    Waga oceny performance: {Math.round(performanceWeight * 100)}%
                  </label>
                  <Slider
                    value={[performanceWeight * 100]}
                    onValueChange={([v]) => setPerformanceWeight((v ?? 0) / 100)}
                    min={0}
                    max={100}
                    step={10}
                    className="w-full [&_.relative]:bg-elevated [&_span[data-orientation]]:bg-[#e040fb] [&_[role=slider]]:bg-[#e040fb] [&_[role=slider]]:border-[#e040fb] [&_[role=slider]]:border-2 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:shadow-[0_0_8px_rgba(224,64,251,0.6)]"
                  />
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>0% (ignoruj)</span>
                    <span>100% (tylko performance)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Locked / Banned employees */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-text-secondary hover:text-white w-full py-2 border-t border-border">
                <ChevronDown className="h-4 w-4" />
                Priorytetowi i wykluczeni pracownicy
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-3">
                <div>
                  <p className="text-xs text-emerald-400 font-medium mb-2">🟢 Priorytetowi (MUSZĄ dostać)</p>
                  <Select
                    onValueChange={(id) => addLocked(id)}
                    value=""
                  >
                    <SelectTrigger className="text-xs bg-card text-white border-border">
                      <SelectValue placeholder="Dodaj pracownika..." />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-card">
                      {MOCK_EMPLOYEES.filter(
                        (e) => !lockedIds.includes(e.id) && !bannedIds.includes(e.id)
                      ).map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.id} — {e.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lockedIds.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-900/50 border border-emerald-500/50 text-emerald-300 text-xs"
                      >
                        🟢 {id}
                        <button
                          type="button"
                          onClick={() => removeLocked(id)}
                          className="hover:text-white"
                          aria-label={`Usuń ${id}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-red-400 font-medium mb-2">🔴 Wykluczeni (BEZ podwyżki)</p>
                  <Select
                    onValueChange={(id) => addBanned(id)}
                    value=""
                  >
                    <SelectTrigger className="text-xs bg-card text-white border-border">
                      <SelectValue placeholder="Dodaj pracownika..." />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-card">
                      {MOCK_EMPLOYEES.filter(
                        (e) => !bannedIds.includes(e.id) && !lockedIds.includes(e.id)
                      ).map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.id} — {e.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bannedIds.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-900/50 border border-red-500/50 text-red-300 text-xs"
                      >
                        🔴 {id}
                        <button
                          type="button"
                          onClick={() => removeBanned(id)}
                          className="hover:text-white"
                          aria-label={`Usuń ${id}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* 5. LOCKED EMPLOYEES — Switch */}
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="lockSenior">Zablokuj stanowiska kierownicze</Label>
                <p className="text-xs text-text-secondary">
                  Wyklucz pracowników na stanowiskach zawierających: Dyrektor,
                  Manager, Kierownik
                </p>
              </div>
              <Switch
                id="lockSenior"
                checked={lockSenior}
                onCheckedChange={setLockSenior}
              />
            </div>

            {/* 6. Uruchom Symulację */}
            <Button
              className="w-full"
              onClick={runSimulation}
            >
              Uruchom Symulację
            </Button>
          </CardContent>
        </Card>
        </div>

        {/* RIGHT: Wyniki Symulacji — visible after run */}
        <Card>
          <CardHeader>
            <CardTitle>Wyniki Symulacji</CardTitle>
            <CardDescription>
              Proponowane korekty wynagrodzeń i podsumowanie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scenarios === null ? (
              <p className="text-sm text-text-secondary">
                Ustaw parametry i kliknij &quot;Uruchom Symulację&quot;, aby
                zobaczyć trzy warianty: Minimalne koszty, Zbalansowany,
                Ekspresowy.
              </p>
            ) : scenarios.length === 0 ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Wprowadź prawidłowy budżet (liczba PLN &gt; 0).
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Edge: already below target */}
                {alreadyBelowTarget && (
                  <Alert className="border-emerald-500/30 bg-emerald-950/20 text-emerald-200 [&>svg]:text-emerald-400">
                    <AlertDescription>
                      ✓ Twoja luka ({currentGapPercent.toFixed(1)}%) już spełnia docelowy poziom ({targetPercent.toFixed(1)}%). Nie są wymagane korekty.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Edge: target not reached */}
                {anyTargetNotReached && !alreadyBelowTarget && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Cel nieosiągalny. Zwiększ budżet do minimum {formatPLN(minBudget)} lub zmień docelową lukę na {achievableGapPercent.toFixed(1)}%.
                    </AlertDescription>
                  </Alert>
                )}

                {/* 3 scenario cards */}
                <div className="space-y-4">
                  {scenarios.map((s, idx) => (
                    <ScenarioCard
                      key={s.name}
                      scenario={s}
                      scenarioLetter={SCENARIO_LETTER[s.name] ?? String(idx + 1)}
                      isRecommended={s.name === "Minimalne koszty"}
                      onExportCSV={() => exportToCSV(s)}
                    />
                  ))}
                </div>

                {/* Wizualizacje */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-primary">Wizualizacje</h3>

                  {/* Chart 1: Salary by department before/after */}
                  {scenarios[0] && filteredForMetrics.length > 0 && (() => {
                    const deptData = buildDeptComparisonData(filteredForMetrics, scenarios[0].raises);
                    if (deptData.length === 0) return null;
                    return (
                      <Card className="bg-card border-border">
                        <CardHeader>
                          <CardTitle className="text-sm text-white">Mediana wynagrodzeń — przed i po wyrównaniu</CardTitle>
                          <p className="text-xs text-text-muted">Scenariusz A (Minimalne koszty) | Per dział</p>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={deptData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                                <XAxis dataKey="dept" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <ChartTooltip
                                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "6px", color: "#f1f5f9" }}
                                  formatter={(value: number | undefined, name: string | undefined) =>
                                    value !== undefined ? [`${Math.round(value).toLocaleString("pl-PL")} PLN`, name ?? ""] : ["—", name ?? ""]
                                  }
                                />
                                <Legend wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }} />
                                <Bar dataKey="Kobiety (przed)" fill={CHART_COLORS.total} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Kobiety (po)" fill={CHART_COLORS.women} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Mężczyźni" fill={CHART_COLORS.men} radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* Chart 2: Quarterly timeline (recommended scenario A only) */}
                  {scenarios[0] && scenarios[0].name === "Minimalne koszty" && (() => {
                    const timelineData = buildTimelineData(scenarios[0], 0);
                    if (timelineData.length === 0) return null;
                    return (
                      <Card className="bg-card border-border">
                        <CardHeader>
                          <CardTitle className="text-sm text-white">Plan kwartalny — {scenarios[0].name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[180px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={timelineData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                                <XAxis dataKey="quarter" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <ChartTooltip
                                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "6px", color: "#f1f5f9" }}
                                  formatter={(value: number | undefined) =>
                                    value !== undefined ? [`${Math.round(value).toLocaleString("pl-PL")} PLN`, "Budżet"] : ["—", "Budżet"]
                                  }
                                />
                                <Bar dataKey="budget" fill={CHART_COLORS.action} radius={[4, 4, 0, 0]} name="Budżet" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>

                {/* Rozkład podwyżek — histogram (Scenariusz A) */}
                {scenarios[0]?.raises != null && scenarios[0].raises.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-primary">
                      Rozkład podwyżek — Scenariusz A
                    </h3>
                    <div className="h-[200px] w-full rounded-lg border border-border bg-card p-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={buildRaiseHistogram(scenarios[0].raises)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                          <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" allowDecimals={false} />
                          <ChartTooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "6px", color: "#f1f5f9" }} />
                          <Bar dataKey="count" fill={CHART_COLORS.action} radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Zaproponuj alternatywę */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-[#e040fb]/50 text-[#e040fb] hover:bg-[#e040fb]/10"
                  onClick={runAlternative}
                >
                  🔄 Zaproponuj alternatywę
                </Button>

                {/* Scenariusze alternatywne (budżet +20%) */}
                {altScenarios != null && altScenarios.length > 0 && altBudget != null && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">
                        Scenariusze alternatywne (budżet +20%)
                      </h3>
                      <p className="text-sm text-text-secondary mt-1">
                        Scenariusze przy budżecie {formatPLN(altBudget)} (+20%)
                      </p>
                    </div>
                    <div className="space-y-4">
                      {altScenarios.map((s, idx) => (
                        <ScenarioCard
                          key={`alt-${s.name}`}
                          scenario={s}
                          scenarioLetter={SCENARIO_LETTER[s.name] ?? String(idx + 1)}
                          isRecommended={s.name === "Minimalne koszty"}
                          onExportCSV={() => exportToCSV(s)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Legal footer */}
                <p className="text-xs text-text-secondary pt-2">
                  Wyniki są symulacją matematyczną. Każda korekta wynagrodzeń wymaga indywidualnej analizy prawnej. Podstawa: Art. 9 Dyrektywy 2023/970.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScenarioCard({
  scenario,
  scenarioLetter,
  isRecommended,
  onExportCSV,
}: {
  scenario: SolioScenario;
  scenarioLetter: string;
  isRecommended: boolean;
  onExportCSV: () => void;
}) {
  const [open, setOpen] = useState(false);
  const title = `Scenariusz ${scenarioLetter} — ${scenario.name}`;
  const visibleRaises = scenario.raises.slice(0, 10);
  const hasMore = scenario.raises.length > 10;
  const hiddenCount = scenario.raises.length - 10;

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          {isRecommended && (
            <Badge className="bg-emerald-600/90 text-white border-0">REKOMENDOWANY</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key metrics row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
          <div>
            <span className="text-text-secondary">Koszt całkowity: </span>
            <span className="font-bold">{formatPLN(scenario.totalCost)}</span>
          </div>
          <div>
            <span className="text-text-secondary">Liczba podwyżek: </span>
            <span className="font-bold">{scenario.affectedEmployees} pracowników</span>
          </div>
          <div>
            <span className="text-text-secondary">Nowa luka: </span>
            <span className="font-bold">{(scenario.newGap * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Collapsible: Szczegóły podwyżek */}
        {scenario.raises.length > 0 && (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0 h-auto font-normal text-primary hover:bg-transparent">
                {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                Szczegóły podwyżek →
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2 pr-2 font-medium">Pracownik</th>
                      <th className="py-2 pr-2 font-medium">Dział</th>
                      <th className="py-2 pr-2 font-medium">Stanowisko</th>
                      <th className="py-2 pr-2 text-right font-medium">Wynagrodzenie obecne</th>
                      <th className="py-2 pr-2 text-right font-medium">Korekta</th>
                      <th className="py-2 text-right font-medium">Wynagrodzenie nowe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRaises.map((r) => (
                      <tr key={r.id} className="border-b border-border/50">
                        <td className="py-2 pr-2 font-mono text-text-secondary">{r.id.slice(0, 2)}**</td>
                        <td className="py-2 pr-2">{r.department}</td>
                        <td className="py-2 pr-2">{r.position}</td>
                        <td className="py-2 pr-2 text-right font-mono">{formatPLN(r.oldSalary)}</td>
                        <td className="py-2 pr-2 text-right font-mono">+{formatPLN(r.raise)}</td>
                        <td className="py-2 text-right font-mono">{formatPLN(r.newSalary)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {hasMore && (
                  <p className="mt-2 text-xs text-text-secondary">
                    … oraz {hiddenCount} kolejnych podwyżek (łącznie {scenario.raises.length}).
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Eksportuj CSV */}
        <Button variant="outline" size="sm" className="gap-2" onClick={onExportCSV}>
          <FileDown className="size-4" />
          Eksportuj CSV
        </Button>
      </CardContent>
    </Card>
  );
}
