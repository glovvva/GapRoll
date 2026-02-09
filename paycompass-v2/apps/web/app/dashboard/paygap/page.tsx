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
import { Loader2, TrendingDown, DollarSign } from "lucide-react";
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

interface PayGapData {
  overall_gap_percent: number;
  median_male: number;
  median_female: number;
  count_male: number;
  count_female: number;
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
  }>;
  fair_pay_line: {
    slope: number;
    intercept: number;
    line_points: Array<{
      position: string;
      salary: number;
    }>;
  };
}

export default function PayGapPage() {
  const [data, setData] = useState<PayGapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayGapData();
  }, []);

  async function fetchPayGapData() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/analysis/paygap");

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
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">
            Ładowanie analizy...
          </span>
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-sm">{data.name}</p>
        <p className="text-xs text-muted-foreground">{data.position}</p>
        <p className="text-sm font-mono font-bold mt-1">
          {data.salary.toLocaleString()} PLN
        </p>
        <p className="text-xs text-muted-foreground mt-1">
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
        <p className="mt-2 text-muted-foreground">
          Porównanie wynagrodzeń między mężczyznami a kobietami
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Overall Gap */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Całkowita Luka Płacowa
            </CardTitle>
            <TrendingDown className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-primary">
              {data.overall_gap_percent.toFixed(1)}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Kobiety zarabiają{" "}
              {(100 - data.overall_gap_percent).toFixed(1)}% mediany mężczyzn
            </p>
          </CardContent>
        </Card>

        {/* Median Male */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mediana Mężczyźni
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-primary">
              {data.median_male.toLocaleString()} PLN
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {data.count_male} pracowników
            </p>
          </CardContent>
        </Card>

        {/* Median Female */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mediana Kobiety
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-primary">
              {data.median_female.toLocaleString()} PLN
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
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
            jeśli N &lt; 3)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
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
                {data.gap_by_position.map((pos, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border/50 hover:bg-secondary/50"
                  >
                    <td className="px-4 py-3">{pos.position}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      {pos.masked ? (
                        <span className="italic text-muted-foreground">
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
                    <td className="px-4 py-3 text-right font-mono">
                      {pos.masked
                        ? "***"
                        : `${pos.median_male!.toLocaleString()} PLN`}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {pos.masked
                        ? "***"
                        : `${pos.median_female!.toLocaleString()} PLN`}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {pos.count_male} / {pos.count_female}
                      {pos.masked && (
                        <span className="ml-2 text-xs text-destructive">
                          (&lt;3)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.gap_by_position.some((p) => p.masked) && (
            <p className="mt-4 text-xs italic text-muted-foreground">
              *** Dane ukryte zgodnie z RODO (mniej niż 3 osoby w grupie)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Scatter Plot */}
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
                  dataKey="position"
                  type="category"
                  allowDuplicatedCategory={false}
                  stroke="#94a3b8"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  dataKey="salary"
                  type="number"
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
                  data={data.data_points.filter((d) => d.gender === "Male")}
                  fill="#4A90E2"
                />

                {/* Female data points */}
                <Scatter
                  name="Kobiety"
                  data={data.data_points.filter((d) => d.gender === "Female")}
                  fill="#FF6B9D"
                />

                {/* Fair Pay Line */}
                <Line
                  name="Fair Pay Line"
                  data={data.fair_pay_line.line_points}
                  dataKey="salary"
                  stroke="#14b8a6"
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

      {/* Fair Pay Line explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Fair Pay Line</CardTitle>
          <CardDescription>
            Linia regresji pokazuje &quot;sprawiedliwe&quot; wynagrodzenie
            bazując na stanowisku
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Równanie:</span>{" "}
              <span className="font-mono">
                y = {data.fair_pay_line.slope.toFixed(2)}x +{" "}
                {data.fair_pay_line.intercept.toFixed(2)}
              </span>
            </p>
            <p className="text-muted-foreground">
              Punkty <strong>poniżej linii</strong> mogą wskazywać na
              niedopłacenie. Punkty <strong>powyżej linii</strong> -
              ponadprzeciętne wynagrodzenie.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
