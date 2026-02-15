"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Scale, TrendingDown, Users } from "lucide-react";
import { ExplainableMetric } from "@/components/explainability/ExplainableMetric";
import { ComplianceAlert } from "@/components/explainability/ComplianceAlert";
import { fetchWithAuth } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const metrics = [
  { label: "Liczba Pracowników", value: "247", icon: Users },
  { label: "Luka Płacowa", value: "8.5%", icon: TrendingDown, destructive: true },
  { label: "Grupy EVG", value: "12", icon: Scale },
  { label: "Raporty", value: "3", icon: FileText },
];

export interface DashboardMetricsResponse {
  median_gap_percent: number | null;
  median_gap_citation: string;
  median_gap_explanation: string;
  median_gap_confidence: number | null;
  quartile4_gap_percent: number | null;
  quartile4_gap_citation: string;
  quartile4_gap_explanation: string;
  quartile4_gap_confidence: number | null;
  female_representation_percent: number | null;
  female_representation_citation: string;
  female_representation_explanation: string;
  female_representation_confidence: number | null;
}

function gapStatus(percent: number | null): "good" | "warning" | "critical" {
  if (percent == null) return "good";
  if (percent < 5) return "good";
  if (percent <= 15) return "warning";
  return "critical";
}

function representationStatus(
  percent: number | null
): "good" | "warning" | "critical" {
  if (percent == null) return "good";
  if (percent >= 40) return "good";
  if (percent >= 20) return "warning";
  return "critical";
}

export default function HomePage() {
  const [data, setData] = useState<DashboardMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth("/api/analysis/dashboard-metrics");
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as DashboardMetricsResponse;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Nie udało się załadować metryk.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const payGapPercent = data?.median_gap_percent ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {payGapPercent > 5 && data && (
        <ComplianceAlert
          payGapPercent={payGapPercent}
          citation={data.median_gap_citation}
          action={{
            label: "Zobacz Plan Działania",
            href: "/solio-solver",
          }}
        />
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="space-y-2 pb-2">
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ExplainableMetric
            label="Luka Płacowa (Mediana)"
            value={data.median_gap_percent ?? 0}
            unit="%"
            citation={data.median_gap_citation}
            explanation={data.median_gap_explanation}
            confidence={data.median_gap_confidence ?? 0}
            status={gapStatus(data.median_gap_percent)}
          />
          <ExplainableMetric
            label="Luka w Kwartylu 4 (najwyższe zarobki)"
            value={data.quartile4_gap_percent ?? 0}
            unit="%"
            citation={data.quartile4_gap_citation}
            explanation={data.quartile4_gap_explanation}
            confidence={data.quartile4_gap_confidence ?? 0}
            status={gapStatus(data.quartile4_gap_percent)}
          />
          <ExplainableMetric
            label="Wskaźnik Reprezentacji Kobiet (Zarząd)"
            value={data.female_representation_percent ?? 0}
            unit="%"
            citation={data.female_representation_citation}
            explanation={data.female_representation_explanation}
            confidence={data.female_representation_confidence ?? 0}
            status={representationStatus(data.female_representation_percent)}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">
            Witamy w GapRoll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map(({ label, value, icon: Icon, destructive }) => (
              <div
                key={label}
                className="rounded-lg bg-secondary p-4 transition-colors duration-200"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="size-5 shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <p
                  className={`mt-2 text-2xl font-semibold ${
                    destructive ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
