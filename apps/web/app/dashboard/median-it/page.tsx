"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Dane testowe: dział IT, n=47
const MEDIAN_M = 12_500;
const MEDIAN_F = 11_800;
const N_EMPLOYEES = 47;

const CHART_DATA = [
  { label: "Mężczyźni", median: MEDIAN_M, fill: "#14b8a6" },
  { label: "Kobiety", median: MEDIAN_F, fill: "#0d9488" },
];

const gapPln = MEDIAN_M - MEDIAN_F;
const gapPct =
  MEDIAN_M > 0 ? (gapPln / MEDIAN_M) * 100 : 0;

export default function MedianITPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">
          Mediana wynagrodzeń — Dział IT
        </h1>
        <p className="mt-2 text-muted-foreground">
          Porównanie mediany wynagrodzeń w podziale na płeć (dane testowe).
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        Analiza obejmuje {N_EMPLOYEES.toLocaleString("pl-PL")} pracowników
        działu IT.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Mediana wynagrodzeń: Mężczyźni
            </CardTitle>
            <CardDescription>Dział IT</CardDescription>
          </CardHeader>
          <CardContent>
            <p
              className="font-mono text-3xl font-bold text-foreground"
              aria-label={`Mediana wynagrodzeń mężczyzn: ${MEDIAN_M.toLocaleString("pl-PL")} PLN`}
            >
              {MEDIAN_M.toLocaleString("pl-PL")} PLN
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Mediana wynagrodzeń: Kobiety
            </CardTitle>
            <CardDescription>Dział IT</CardDescription>
          </CardHeader>
          <CardContent>
            <p
              className="font-mono text-3xl font-bold text-foreground"
              aria-label={`Mediana wynagrodzeń kobiet: ${MEDIAN_F.toLocaleString("pl-PL")} PLN`}
            >
              {MEDIAN_F.toLocaleString("pl-PL")} PLN
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Różnica median (M − K)
            </CardTitle>
            <CardDescription>W wartościach bezwzględnych i procentach</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-bold text-foreground">
              {gapPln.toLocaleString("pl-PL")} PLN
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {gapPct.toFixed(1)}% względem mediany mężczyzn
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Mediana wynagrodzeń w podziale na płeć
          </CardTitle>
          <CardDescription>
            Dział IT, n = {N_EMPLOYEES.toLocaleString("pl-PL")} pracowników
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="h-[320px] w-full"
            role="img"
            aria-label="Wykres słupkowy: mediana wynagrodzeń mężczyzn 12 500 PLN, kobiet 11 800 PLN."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={CHART_DATA}
                margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `${v.toLocaleString("pl-PL")} PLN`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={100}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toLocaleString("pl-PL")} PLN`,
                    "Mediana",
                  ]}
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
                />
                <Bar dataKey="median" radius={[0, 4, 4, 0]} minPointSize={24}>
                  {CHART_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
