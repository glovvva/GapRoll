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
import { Loader2, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Quartile {
  quartile: string;
  label: string;
  min_salary: number;
  max_salary: number;
  median_salary: number;
  count_male: number;
  count_female: number;
  percent_male: number;
  percent_female: number;
}

interface Art16Data {
  quartiles: Quartile[];
  joint_assessment_required: boolean;
  total_employees: number;
  overall_gender_balance: {
    percent_male: number;
    percent_female: number;
  };
}

export default function ReportPage() {
  const [data, setData] = useState<Art16Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArt16Data();
  }, []);

  async function fetchArt16Data() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/analysis/art16");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Błąd pobierania danych");
      }

      const result = await response.json();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Nie udało się pobrać danych");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Ładowanie raportu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertDescription>Brak danych do analizy. Wgraj najpierw dane CSV.</AlertDescription>
      </Alert>
    );
  }

  const chartData = data.quartiles.map((q) => ({
    name: q.quartile,
    label: q.label,
    Mężczyźni: q.percent_male,
    Kobiety: q.percent_female,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-primary">Raport Art. 16</h1>
        <p className="text-muted-foreground mt-2">
          Analiza kwartylowa zgodnie z Dyrektywą UE 2023/970
        </p>
      </div>

      {/* Joint Assessment Alert */}
      {data.joint_assessment_required ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Wymagana Wspólna Ocena Wynagrodzeń!</strong>
            <br />
            Różnica reprezentacji płci w jednym lub więcej kwartylach przekracza 5%.
            Art. 16 Dyrektywy wymaga przeprowadzenia wspólnej oceny (Joint Pay Assessment).
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-green-500/10 border-green-500/50">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">
            Balans płci w kwartylach jest akceptowalny (różnica &lt; 5%).
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszyscy Pracownicy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              {data.total_employees}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mężczyźni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              {data.overall_gender_balance.percent_male.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kobiety</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              {data.overall_gender_balance.percent_female.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quartile Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Reprezentacja Płci w Kwartylach</CardTitle>
          <CardDescription>
            Podział pracowników na 4 grupy według wynagrodzenia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  label={{
                    value: "% Pracowników",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#94a3b8" },
                  }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                  }}
                  cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                />
                <Legend />
                <Bar dataKey="Mężczyźni" fill="#4A90E2" />
                <Bar dataKey="Kobiety" fill="#FF6B9D" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quartile Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Szczegóły Kwartyli</CardTitle>
          <CardDescription>
            Statystyki wynagrodzeń dla każdego kwartyla
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Kwartyl</th>
                  <th className="text-right py-3 px-4 font-semibold">
                    Zakres Wynagrodzeń
                  </th>
                  <th className="text-right py-3 px-4 font-semibold">Mediana</th>
                  <th className="text-center py-3 px-4 font-semibold">Mężczyźni</th>
                  <th className="text-center py-3 px-4 font-semibold">Kobiety</th>
                  <th className="text-center py-3 px-4 font-semibold">Różnica</th>
                </tr>
              </thead>
              <tbody>
                {data.quartiles.map((q, idx) => {
                  const diff = Math.abs(q.percent_male - q.percent_female);
                  const isHighDiff = diff > 5;

                  return (
                    <tr
                      key={idx}
                      className="border-b border-border/50 hover:bg-secondary/50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold">{q.quartile}</div>
                        <div className="text-xs text-muted-foreground">
                          {q.label}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm">
                        {q.min_salary.toLocaleString()} -{" "}
                        {q.max_salary.toLocaleString()} PLN
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {q.median_salary.toLocaleString()} PLN
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-mono">
                          {q.percent_male.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ({q.count_male})
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-mono">
                          {q.percent_female.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ({q.count_female})
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold ${isHighDiff ? "text-destructive" : "text-primary"}`}
                        >
                          {diff.toFixed(1)}%
                          {isHighDiff && " ⚠️"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
