"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2, TrendingDown, DollarSign } from "lucide-react";
import { fetchWithAuthCached } from "@/lib/api-client";
import {
  ScatterChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { ExplainerCard } from "@/components/ui/explainer-card";
import { CHART_COLORS } from "@/lib/chart-colors";
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

interface PayGapData {
  overall_gap_percent: number;
  median_male: number;
  median_female: number;
  count_male: number;
  count_female: number;
  evg_available?: boolean;
  evg_session_approved?: boolean;
  gap_by_position: Array<{
    position: string;
    gap_percent: number | null;
    median_male: number | null;
    median_female: number | null;
    count_male: number;
    count_female: number;
    masked: boolean;
    reason?: string;
  }>;
  data_points: Array<{
    name: string;
    position: string;
    gender: string;
    salary: number;
    evg_score: number | null;
  }>;
  fair_pay_line: {
    slope: number;
    intercept: number;
    line_points: Array<{
      position?: string;
      evg_score?: number;
      salary: number;
    }>;
    use_evg: boolean;
  };
}

export default function PayGapPage() {
  const [data, setData] = useState<PayGapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchPayGapData();
  }, [selectedDepartment]);

  async function fetchDepartments() {
    try {
      const res = await fetchWithAuthCached("/api/analysis/departments");
      if (res.ok) {
        const json = (await res.json()) as { departments: string[] };
        setDepartments(json.departments || []);
      }
    } catch {
      // ignore
    }
  }

  async function fetchPayGapData() {
    try {
      setLoading(true);
      setError(null);

      const url =
        selectedDepartment && selectedDepartment !== "all"
          ? `/api/analysis/paygap?department=${encodeURIComponent(selectedDepartment)}`
          : "/api/analysis/paygap";
      const response = await fetchWithAuthCached(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Błąd pobierania danych");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się pobrać danych"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6 animate-pulse mx-auto max-w-7xl">
        <div className="h-8 bg-slate-700 rounded w-64" />
        <div className="h-4 bg-slate-800 rounded w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-6 space-y-3">
              <div className="h-4 bg-slate-700 rounded w-32" />
              <div className="h-8 bg-slate-600 rounded w-24" />
              <div className="h-3 bg-slate-700 rounded w-40" />
            </div>
          ))}
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="h-4 bg-slate-700 rounded w-48 mb-4" />
          <div className="h-64 bg-slate-700 rounded" />
        </div>
        <div className="flex items-center gap-2 justify-center text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Trwa analiza danych...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl">
        <Alert>
          <AlertDescription>
            Brak danych do analizy. Wgraj najpierw dane CSV.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  type TooltipPayload = { name: string; position: string; salary: number; gender: string };
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: TooltipPayload }> }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-sm">{data.name}</p>
        <p className="text-xs text-text-secondary">{data.position}</p>
        <p className="text-sm font-mono font-bold mt-1">
          {data.salary.toLocaleString()} PLN
        </p>
        <p className="text-xs text-text-secondary mt-1">
          {data.gender === "Male" ? "Mężczyzna" : "Kobieta"}
        </p>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-primary">
          Analiza Luki Płacowej
        </h1>
        <p className="mt-2 text-text-secondary">
          Porównanie wynagrodzeń między mężczyznami a kobietami
        </p>
      </div>

      {/* Filtr działowy */}
      <div className="flex items-center gap-2">
        <Select
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
        >
          <SelectTrigger className="w-[200px] bg-slate-800 border-slate-600">
            <SelectValue placeholder="Wszystkie działy" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600 text-slate-100">
            <SelectItem value="all">Cała organizacja</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* EVG hint */}
      {!data.fair_pay_line.use_evg && (
        <Alert>
          <AlertDescription>
            💡 <strong>Wskazówka:</strong> Uruchom EVG Scoring w zakładce
            &quot;EVG&quot; aby uzyskać dokładniejszą Fair Pay Line bazującą na
            obiektywnej ocenie wartości pracy.
          </AlertDescription>
        </Alert>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Overall Gap */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              Całkowita Luka Płacowa
              <InfoTooltip>
                <p className="font-semibold mb-2">
                  Co oznacza {data.overall_gap_percent.toFixed(1)}%?
                </p>
                <ul className="text-xs space-y-1">
                  <li>
                    • <strong>{"<"}3%:</strong> Naturalny rozrzut, brak problemu
                  </li>
                  <li>
                    • <strong>3-5%:</strong> Monitoruj, sprawdź przyczyny
                  </li>
                  <li>
                    • <strong>5-10%:</strong> Joint Pay Assessment wymagany (Art.
                    10)
                  </li>
                  <li>
                    • <strong>{">"}10%:</strong> Krytyczne - natychmiastowa akcja
                    + ryzyko kary
                  </li>
                </ul>
                <p className="mt-2 text-xs text-text-secondary">
                  W UE średnia luka płacowa to ~13%. Cel: {"<"}5%.
                </p>
              </InfoTooltip>
            </CardTitle>
            <TrendingDown className="size-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-primary">
              {data.overall_gap_percent.toFixed(1)}%
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              Kobiety zarabiają{" "}
              {(100 - data.overall_gap_percent).toFixed(1)}% mediany mężczyzn
            </p>
          </CardContent>
        </Card>

        {/* Median Male */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mediana (mężczyźni)
            </CardTitle>
            <DollarSign className="size-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-primary">
              {data.median_male.toLocaleString()} PLN
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              {data.count_male} pracowników
            </p>
          </CardContent>
        </Card>

        {/* Median Female */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mediana (kobiety)
            </CardTitle>
            <DollarSign className="size-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-primary">
              {data.median_female.toLocaleString()} PLN
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              {data.count_female} pracownic
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gap by Position Table */}
      <Card>
        <CardHeader>
          <CardTitle>Luka Płacowa per Stanowisko</CardTitle>
          <CardDescription>
            Porównanie wynagrodzeń w podziale na stanowiska (RODO: maskowane
            tylko ta płeć, w której N &lt; 3)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#6B9FD4]/15">
                  <th className="px-4 py-3 text-left font-semibold">
                    Stanowisko
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Luka %</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Mediana M
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Mediana K
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Liczebność (M/K)
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.gap_by_position.map((pos, idx) => {
                  const rodoTooltip =
                    "Dane ukryte zgodnie z RODO (mniej niż 3 osoby w grupie)";
                  const maskMale = pos.median_male == null;
                  const maskFemale = pos.median_female == null;
                  const maskGap = pos.gap_percent == null;
                  return (
                    <tr
                      key={idx}
                      className="border-b border-[#6B9FD4]/15/50 hover:bg-secondary/50"
                    >
                      <td className="px-4 py-3">{pos.position}</td>
                      <td
                        className="px-4 py-3 text-right font-mono font-bold"
                        title={maskGap ? rodoTooltip : undefined}
                      >
                        {maskGap ? (
                          <span className="italic text-text-secondary">
                            RODO
                          </span>
                        ) : (
                          <span
                            className={
                              pos.gap_percent != null && pos.gap_percent > 5
                                ? "text-destructive"
                                : "text-primary"
                            }
                          >
                            {pos.gap_percent!.toFixed(1)}%
                          </span>
                        )}
                      </td>
                      <td
                        className="px-4 py-3 text-right font-mono"
                        title={maskMale ? rodoTooltip : undefined}
                      >
                        {maskMale
                          ? "***"
                          : `${pos.median_male!.toLocaleString()} PLN`}
                      </td>
                      <td
                        className="px-4 py-3 text-right font-mono"
                        title={maskFemale ? rodoTooltip : undefined}
                      >
                        {maskFemale
                          ? "***"
                          : `${pos.median_female!.toLocaleString()} PLN`}
                      </td>
                      <td className="px-4 py-3 text-center text-text-secondary">
                        {pos.count_male} / {pos.count_female}
                        {(pos.count_male < 3 || pos.count_female < 3) && (
                          <span
                            className="ml-2 text-xs text-destructive"
                            title={rodoTooltip}
                          >
                            (M&lt;3 lub K&lt;3)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data.gap_by_position.some((p) => p.masked) && (
            <p className="mt-4 text-xs italic text-text-secondary">
              *** Dane ukryte zgodnie z RODO (mniej niż 3 osoby w grupie)
            </p>
          )}
        </CardContent>
      </Card>

      {/* EVG not approved warning */}
      {data.evg_available === true &&
        data.evg_session_approved === false && (
          <Alert className="mb-4 border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <div className="font-semibold text-amber-400">
              Wartościowanie stanowisk nie zostało zatwierdzone
            </div>
            <AlertDescription className="text-amber-300/80">
              Wykres luki płacowej działa poprawnie po zatwierdzeniu wyników EVG.
              Przejdź do{" "}
              <a href="/dashboard/evg" className="underline text-teal-400">
                Wartościowania stanowisk
              </a>{" "}
              i zatwierdź sesję, aby zobaczyć pełną analizę.
            </AlertDescription>
          </Alert>
        )}

      {/* Scatter Plot */}
      {(() => {
        const scatterData = data.data_points;
        const useEvg = data.fair_pay_line.use_evg;
        const rawLinePoints = data.fair_pay_line.line_points;
        const evgScores = scatterData
          .map((d) => d.evg_score)
          .filter((s): s is number => s != null);
        const minEVG = evgScores.length > 0 ? Math.min(...evgScores) : 0;
        const maxEVG = evgScores.length > 0 ? Math.max(...evgScores) : 100;
        const fairPayLineData = rawLinePoints.filter((p) =>
          useEvg
            ? p.salary >= 0 &&
              p.evg_score != null &&
              p.evg_score >= minEVG &&
              p.evg_score <= maxEVG
            : true
        );
        const xDomain = useEvg
          ? [Math.floor(minEVG * 0.95), Math.ceil(maxEVG * 1.05)]
          : undefined;
        return (
          <Card>
            <CardHeader>
              <CardTitle>Rozkład Wynagrodzeń</CardTitle>
              <CardDescription>
                Wizualizacja wynagrodzeń w podziale na płeć i stanowisko
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey={useEvg ? "evg_score" : "position"}
                      type={useEvg ? "number" : "category"}
                      domain={useEvg ? xDomain : undefined}
                      allowDuplicatedCategory={false}
                      stroke="#94a3b8"
                      label={
                        useEvg
                          ? {
                              value: "Wynik EVG",
                              position: "insideBottom",
                              offset: -10,
                              style: { fill: "#94a3b8" },
                            }
                          : undefined
                      }
                      angle={useEvg ? 0 : -45}
                      textAnchor={useEvg ? "middle" : "end"}
                      height={useEvg ? 60 : 80}
                    />
                    <YAxis
                      dataKey="salary"
                      type="number"
                      domain={[0, "auto"]}
                      tickFormatter={(v: number) =>
                        v < 0 ? "" : `${(v / 1000).toFixed(0)}k PLN`
                      }
                      stroke="#94a3b8"
                      label={{
                        value: "Wynagrodzenie (PLN)",
                        angle: -90,
                        position: "insideLeft",
                        style: { fill: "#94a3b8" },
                      }}
                    />
                <Tooltip
                  content={<CustomTooltip />}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                    fontSize: "13px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.4)",
                  }}
                  labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                  itemStyle={{ color: "#f1f5f9" }}
                  cursor={{ strokeDasharray: "3 3" }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                />

                {/* Male data points */}
                <Scatter
                  name="Mężczyźni"
                  data={data.data_points.filter((d) => d.gender === "male")}
                  fill={CHART_COLORS.men}
                />

                {/* Female data points */}
                <Scatter
                  name="Kobiety"
                  data={data.data_points.filter((d) => d.gender === "female")}
                  fill={CHART_COLORS.women}
                />

                {/* Fair Pay Line */}
                <Line
                  name="Linia Fair Pay"
                  data={fairPayLineData}
                  dataKey="salary"
                  stroke={CHART_COLORS.total}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  legendType="line"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
        );
      })()}

      <ExplainerCard title="Co to jest Linia Fair Pay?" variant="info">
        <div>
          <h4 className="font-semibold mb-1">CO TO JEST:</h4>
          <p className="text-text-secondary">
            Linia Fair Pay to linia regresji pokazująca „sprawiedliwe”
            wynagrodzenie wg wartości pracy (wynik EVG). Im wyższy wynik EVG
            (trudniejsza, bardziej odpowiedzialna praca), tym wyższe
            powinno być wynagrodzenie.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-1">JAK TO CZYTAĆ:</h4>
          <ul className="space-y-1 text-text-secondary">
            <li>
              ✅ <strong>Punkty NA linii:</strong> Wynagrodzenie odpowiada wartości
              pracy
            </li>
            <li>
              ⬆️ <strong>Punkty POWYŻEJ linii:</strong> Wynagrodzenie wyższe niż
              oczekiwane
            </li>
            <li>
              ⬇️ <strong>Punkty PONIŻEJ linii:</strong> Wynagrodzenie niższe niż
              oczekiwane ⚠️
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-1">CO TO OZNACZA DLA CIEBIE:</h4>
          <p className="text-text-secondary">
            Jeśli <strong>kobiety są głównie poniżej linii</strong>, a{" "}
            <strong>mężczyźni powyżej</strong> → może to wskazywać na
            dyskryminację płacową za pracę o tej samej wartości.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-1">CO ZROBIĆ:</h4>
          <ol className="list-decimal list-inside space-y-1 text-text-secondary">
            <li>Sprawdź kto jest {">"}10% poniżej linii</li>
            <li>Porównaj M/K na podobnych wynikach EVG (±5 punktów)</li>
            <li>Jeśli różnica {">"}5% → przeprowadź korektę wynagrodzeń</li>
          </ol>
          <p className="mt-2 text-xs">
            📋 <strong>Podstawa prawna:</strong> Art. 4 ust. 4 Dyrektywy UE
            2023/970 (ocena wartości pracy)
          </p>
        </div>
      </ExplainerCard>

      {/* Fair Pay Line explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Linia Fair Pay</CardTitle>
          <CardDescription>
            {data.fair_pay_line.use_evg
              ? "Linia regresji bazuje na Wynik EVG (1-100) – obiektywna ocena wartości pracy"
              : "Linia regresji pokazuje „sprawiedliwe” wynagrodzenie wg stanowiska"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {data.fair_pay_line.use_evg ? (
              <>
                <p>
                  <span className="font-semibold">Równanie:</span>{" "}
                  <span className="font-mono">
                    Wynagrodzenie = {data.fair_pay_line.slope.toFixed(2)} × Wynik_EVG +{" "}
                    {data.fair_pay_line.intercept.toFixed(2)}
                  </span>
                </p>
                <p className="text-text-secondary">
                  Punkty <strong>poniżej linii</strong> mogą wskazywać na
                  niedopłacenie względem wartości pracy. Linia rośnie wraz z
                  rosnącym wynikiem EVG (↗️).
                </p>
              </>
            ) : (
              <>
                <p>
                  <span className="font-semibold">Równanie:</span>{" "}
                  <span className="font-mono">
                    y = {data.fair_pay_line.slope.toFixed(2)}x +{" "}
                    {data.fair_pay_line.intercept.toFixed(2)}
                  </span>
                </p>
                <p className="text-text-secondary">
                  Punkty <strong>poniżej linii</strong> mogą wskazywać na
                  niedopłacenie. (Uwaga: linia bazuje na pozycjach, nie EVG
                  score - uruchom scoring w zakładce EVG dla dokładniejszej
                  analizy)
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
