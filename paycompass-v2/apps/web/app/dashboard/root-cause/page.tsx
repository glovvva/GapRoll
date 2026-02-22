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
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { runRootCauseAnalysis } from "@/lib/api-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

interface ContributionItem {
  factor: string;
  factor_key: string;
  contribution_pct: number;
  contribution_pln: number;
  mean_M: number;
  mean_F: number;
  direction: "niekorzystny" | "korzystny" | "neutralny";
}

interface RootCauseData {
  gap_total_pln: number;
  gap_pct: number;
  avg_salary_M: number;
  avg_salary_F: number;
  n_employees: number;
  n_male: number;
  n_female: number;
  contributions: ContributionItem[];
  narrative_pl: string;
  legal_citation: string;
  computed_at: string;
}

const COLORS = {
  red: "#ef4444",
  green: "#22c55e",
  gray: "#94a3b8",
} as const;

function barFill(direction: ContributionItem["direction"]): string {
  if (direction === "niekorzystny") return COLORS.red;
  if (direction === "korzystny") return COLORS.green;
  return COLORS.gray;
}

export default function RootCausePage() {
  const [data, setData] = useState<RootCauseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Brak aktywnej sesji użytkownika.");
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .maybeSingle();

        const companyId =
          profile?.company_id ?? "28072cc6-5cfb-47b0-962a-a975bcc47a60";
        console.log("company_id being sent:", companyId);
        const response = await runRootCauseAnalysis(companyId);

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}));
          throw new Error(
            errorPayload?.detail || "Nie udało się pobrać analizy przyczyn."
          );
        }

        const payload = (await response.json()) as RootCauseData;
        if (!cancelled) {
          setData(payload);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Wystąpił błąd podczas pobierania analizy przyczyn."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-80" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
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
        <Alert variant="destructive">
          <AlertDescription>
            Nie udało się wyświetlić danych analizy przyczyn.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Analiza przyczyn</h1>
        <p className="mt-2 text-text-secondary">
          Identyfikacja głównych czynników wpływających na lukę płacową.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Luka płacowa</CardTitle>
            <CardDescription>Różnica średnich wynagrodzeń (M − K)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {data.gap_pct.toFixed(1)}%
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {data.gap_total_pln.toFixed(0)} PLN
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Średnie wynagrodzenie: Mężczyźni</CardTitle>
            <CardDescription>Średnia arytmetyczna wynagrodzeń</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {data.avg_salary_M.toFixed(0)} PLN
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Średnie wynagrodzenie: Kobiety</CardTitle>
            <CardDescription>Średnia arytmetyczna wynagrodzeń</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {data.avg_salary_F.toFixed(0)} PLN
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-text-secondary">
        Analiza obejmuje {data.n_employees} pracowników ({data.n_male} mężczyzn,{" "}
        {data.n_female} kobiet)
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Rozkład przyczyn luki płacowej</CardTitle>
          <CardDescription>
            Udział poszczególnych czynników w luce (procent całości)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.contributions.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Brak wystarczających danych do rozkładu przyczyn.
            </p>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.contributions}
                  layout="vertical"
                  margin={{ top: 8, right: 48, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    type="number"
                    unit="%"
                    tickFormatter={(v) => `${v}%`}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    type="category"
                    dataKey="factor"
                    width={140}
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Udział"]}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="contribution_pct" radius={[0, 4, 4, 0]} minPointSize={4}>
                    <LabelList
                      dataKey="contribution_pct"
                      position="right"
                      formatter={(v: number) => `${v.toFixed(1)}%`}
                      fill="#94a3b8"
                    />
                    {data.contributions.map((entry, index) => (
                      <Cell key={index} fill={barFill(entry.direction)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interpretacja wyników</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
            {data.narrative_pl}
          </p>
          <p className="text-xs text-text-muted">
            {data.legal_citation} •{" "}
            {new Date(data.computed_at).toLocaleDateString("pl-PL")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
