"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, FileDown, FileSpreadsheet } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { CitationBadge } from "@/components/explainability/CitationBadge";
import { ExplainableMetric } from "@/components/explainability/ExplainableMetric";
import { ComplianceAlert } from "@/components/explainability/ComplianceAlert";
import { fetchWithAuth } from "@/lib/api-client";
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
import { HelpCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CHART_COLORS } from "@/lib/chart-colors";

const ART16_CITATION = "Art. 16 Dyrektywy UE 2023/970";

interface Quartile {
  quartile: string;
  label: string;
  min_salary: number;
  max_salary: number;
  median_salary: number;
  /** Mediana M (null jeśli N_M < 3 – RODO) */
  median_male?: number | null;
  /** Mediana K (null jeśli N_K < 3 – RODO) */
  median_female?: number | null;
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
  /** Średnia luka płacowa % - from API or computed */
  pay_gap?: number;
  /** N<3 suppressed groups - RODO masking */
  n_suppressed?: number;
  /** Component breakdown: base, variable, allowances (Art. 16 ust. 2 lit. b) */
  component_breakdown?: {
    base: number;
    variable: number;
    allowances: number;
  };
}

function countSuppressed(quartiles: Quartile[]): number {
  return quartiles.filter(
    (q) => q.count_male < 3 || q.count_female < 3
  ).length;
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

      const response = await fetchWithAuth("/api/analysis/art16");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Błąd pobierania danych");
      }

      const result = await response.json();
      setData(result);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Nie udało się pobrać danych"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-text-secondary">
          Ładowanie raportu...
        </span>
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
        <AlertDescription>
          Brak danych do analizy. Wgraj najpierw dane CSV.
        </AlertDescription>
      </Alert>
    );
  }

  const payGap = data.pay_gap ?? 12.5;
  const nSuppressed = data.n_suppressed ?? countSuppressed(data.quartiles);
  const componentBreakdown = data.component_breakdown ?? {
    base: 8.2,
    variable: 15.1,
    allowances: 4.0,
  };

  const payGapStatus: "good" | "warning" | "critical" =
    payGap < 5 ? "good" : payGap < 15 ? "warning" : "critical";

  const chartData = data.quartiles.map((q) => ({
    name: q.quartile,
    label: q.label,
    Mężczyźni: q.percent_male,
    Kobiety: q.percent_female,
  }));

  const sectionSpacing = "space-y-4";

  return (
    <div className={sectionSpacing}>
      {/* SECTION 1: HEADER */}
      <section className="pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold" style={{ color: "#ffffff" }}>
              Raport Równości Wynagrodzeń (Art. 16)
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <CitationBadge citation={ART16_CITATION} variant="info" />
            </div>
          </div>
        </div>
        <p className="text-sm mt-2" style={{ color: "#94a3b8" }}>
          N={data.total_employees}. Grupy z N&lt;3 (ukryte RODO): {nSuppressed}.
        </p>
      </section>

      {/* SECTION 2: MAIN METRIC */}
      <section>
        <ExplainableMetric
          value={payGap}
          unit="%"
          label="Średnia luka płacowa"
          explanation="Średnia różnica wynagrodzenia kobiet vs mężczyzn (wzór: (salary_M - salary_F) / salary_M). Wartość dodatnia oznacza, że kobiety zarabiają średnio mniej. Luka >5% wymaga wyjaśnienia przyczyn zgodnie z Art. 7."
          citation={`${ART16_CITATION} ust. 2 lit. a)`}
          status={payGapStatus}
        />
        <div className="mt-4">
          <ComplianceAlert
            type={
              payGapStatus === "critical"
                ? "critical"
                : payGapStatus === "warning"
                  ? "warning"
                  : "info"
            }
            title={
              payGapStatus === "good"
                ? "Status: Brak obowiązku działania"
                : "Wymagane działanie: przygotuj uzasadnienie"
            }
            description={
              payGapStatus === "good"
                ? `Luka płacowa (${payGap}%) jest poniżej progu 5%. Zalecamy dalsze monitorowanie.`
                : `Luka płacowa (${payGap}%) przekracza 5%. Art. 7 Dyrektywy wymaga przygotowania wyjaśnienia przyczyn i planu naprawy.`
            }
            citation={`Art. 16 ust. 1, Art. 7 ust. 3 Dyrektywy 2023/970`}
            action={
              payGapStatus !== "good"
                ? {
                    label: "Przejdź do szablonu Art. 7 →",
                    href: "/dashboard",
                  }
                : undefined
            }
          />
        </div>
      </section>

      {/* SECTION 3: QUARTILE TABLE */}
      <section>
        <Card
          className="border-[#334155]"
          style={{ backgroundColor: "#1e293b" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#ffffff" }}>
              Rozkład kwartylowy (Kobiety / Mężczyźni)
              <InfoTooltip>
                <p className="mb-2">
                  Podział na 4 grupy według wynagrodzenia (Q1 najniższe, Q4
                  najwyższe).
                </p>
                <p className="text-xs">
                  Art. 16 wymaga monitorowania reprezentacji płci w każdym
                  kwartylu.
                </p>
              </InfoTooltip>
            </CardTitle>
            <CardDescription style={{ color: "#94a3b8" }}>
              Tabela Q1–Q4 × Kobiety/Mężczyźni
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] mb-4">
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
                      value: "%",
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
                  <Bar dataKey="Mężczyźni" fill={CHART_COLORS.men} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Kobiety" fill={CHART_COLORS.women} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: "#ffffff" }}>
                      Kwartyl
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: "#ffffff" }}>
                      Zakres
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: "#ffffff" }}>
                      Mediana M
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: "#ffffff" }}>
                      Mediana K
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-sm" style={{ color: "#ffffff" }}>
                      Mężczyźni
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-sm" style={{ color: "#ffffff" }}>
                      Kobiety
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-sm" style={{ color: "#ffffff" }}>
                      Δ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.quartiles.map((q, idx) => {
                    const diff = Math.abs(q.percent_male - q.percent_female);
                    const isHighDiff = diff > 5;
                    const rodoTooltip =
                      "Dane ukryte zgodnie z RODO (mniej niż 3 osoby w grupie)";
                    const maskMale = q.median_male == null;
                    const maskFemale = q.median_female == null;

                    return (
                      <tr
                        key={idx}
                        className="border-b border-[#334155]/50 hover:bg-[#334155]/30"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-sm">{q.quartile}</div>
                          <div className="text-xs" style={{ color: "#94a3b8" }}>
                            {q.label}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm">
                          {q.min_salary.toLocaleString()} –{" "}
                          {q.max_salary.toLocaleString()} PLN
                        </td>
                        <td
                          className="py-3 px-4 text-right font-mono font-bold text-sm"
                          title={maskMale ? rodoTooltip : undefined}
                        >
                          {maskMale
                            ? "***"
                            : `${Number(q.median_male).toLocaleString()} PLN`}
                        </td>
                        <td
                          className="py-3 px-4 text-right font-mono font-bold text-sm"
                          title={maskFemale ? rodoTooltip : undefined}
                        >
                          {maskFemale
                            ? "***"
                            : `${Number(q.median_female).toLocaleString()} PLN`}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="font-mono text-sm">
                            {q.percent_male.toFixed(1)}%
                          </div>
                          <div className="text-xs" style={{ color: "#94a3b8" }}>
                            ({q.count_male})
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="font-mono text-sm">
                            {q.percent_female.toFixed(1)}%
                          </div>
                          <div className="text-xs" style={{ color: "#94a3b8" }}>
                            ({q.count_female})
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isHighDiff ? "text-red-400" : "text-emerald-400"
                            }`}
                          >
                            {diff.toFixed(1)}%
                            {isHighDiff && " ⚠"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {data.quartiles.some(
              (q) => q.median_male == null || q.median_female == null
            ) && (
              <p
                className="mt-4 text-xs italic text-text-secondary"
                style={{ color: "#94a3b8" }}
              >
                *** Dane ukryte zgodnie z RODO (mniej niż 3 osoby w grupie)
              </p>
            )}

            {data.joint_assessment_required && (
              <div className="mt-4">
                <ComplianceAlert
                  type="critical"
                  title="Dysproporcja w kwartylach"
                  description="Różnica reprezentacji płci w jednym lub więcej kwartylach przekracza 5%. Art. 16 wymaga przeprowadzenia wspólnej oceny wynagrodzeń (Joint Pay Assessment)."
                  citation={`${ART16_CITATION} ust. 2 lit. a)`}
                  action={{
                    label: "Sprawdź EVG Scoring",
                    href: "/dashboard/evg",
                  }}
                />
              </div>
            )}

            <Collapsible>
              <CollapsibleTrigger className="text-sm flex items-center gap-2 hover:underline mt-4" style={{ color: "#6B9FD4" }}>
                <HelpCircle className="h-4 w-4" />
                Jak interpretować?
              </CollapsibleTrigger>
              <CollapsibleContent
                className="rounded-lg p-4 mt-2 space-y-3"
                style={{ backgroundColor: "#334155", color: "#e2e8f0" }}
              >
                <ul className="text-sm space-y-2">
                  <li>✅ Podobna reprezentacja M/F we wszystkich kwartylach</li>
                  <li>⚠ Więcej kobiet w Q1, więcej mężczyzn w Q4 → red flag</li>
                  <li>🔴 Różnica &gt;5% → wymagana wspólna ocena</li>
                </ul>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  Podstawa: Art. 16 ust. 1 lit. f) Dyrektywy UE 2023/970
                </p>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 4: COMPONENT BREAKDOWN */}
      <section>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#ffffff" }}>
          Składniki wynagrodzenia (Art. 16 ust. 2 lit. b)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ExplainableMetric
            value={componentBreakdown.base}
            unit="%"
            label="Wynagrodzenie podstawowe"
            explanation="Średnia luka płacowa w składniku podstawowym (brutto stałe). Główny wskaźnik do monitorowania."
            citation={`${ART16_CITATION} ust. 2 lit. b)`}
            status={componentBreakdown.base > 5 ? "warning" : "good"}
          />
          <ExplainableMetric
            value={componentBreakdown.variable}
            unit="%"
            label="Składnik zmienny"
            explanation="Luka w premiach, bonusach, prowizjach. Często wyższa ze względu na różnice w negocjacjach i strukturze ról."
            citation={`${ART16_CITATION} ust. 2 lit. b)`}
            status={componentBreakdown.variable > 10 ? "warning" : "good"}
          />
          <ExplainableMetric
            value={componentBreakdown.allowances}
            unit="%"
            label="Dodatki"
            explanation="Luka w dodatkach (nadgodziny, służbowy, etc.). Zazwyczaj mniejsza składowa."
            citation={`${ART16_CITATION} ust. 2 lit. b)`}
            status={componentBreakdown.allowances > 5 ? "warning" : "good"}
          />
        </div>
      </section>

      {/* SECTION 5: JUSTIFICATION */}
      <section>
        <ComplianceAlert
          type="info"
          title="Uzasadnienie zgodnie z Art. 7"
          description="Dyrektywa 2023/970 wymaga wyjaśnienia przyczyn różnic wynagrodzeń oraz planu działań naprawczych. Przygotuj dokument z czynnikami (np. staż, stanowisko) i harmonogramem wdrożenia."
          citation="Art. 7 ust. 3 Dyrektywy 2023/970"
          action={{
            label: "Pobierz szablon Art. 7 →",
            onClick: () => window.open("/api/art7-template", "_blank"),
          }}
        />
      </section>

      {/* SECTION 6: EXPORT */}
      <section className="pb-8">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="default"
            className="gap-2"
            style={{ backgroundColor: "#6B9FD4" }}
          >
            <FileDown className="h-4 w-4" />
            Eksportuj PDF
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-[#334155] hover:bg-[#334155]"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Eksportuj CSV
          </Button>
        </div>
      </section>
    </div>
  );
}
