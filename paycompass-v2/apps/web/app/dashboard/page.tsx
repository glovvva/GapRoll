"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Scale, TrendingDown, Users } from "lucide-react";
import { ExplainableMetric } from "@/components/explainability/ExplainableMetric";
import { CitationBadge } from "@/components/explainability/CitationBadge";
import { ComplianceAlert } from "@/components/explainability/ComplianceAlert";

const metrics = [
  { label: "Liczba Pracowników", value: "247", icon: Users },
  { label: "Luka Płacowa", value: "8.5%", icon: TrendingDown, destructive: true },
  { label: "Grupy EVG", value: "12", icon: Scale },
  { label: "Raporty", value: "3", icon: FileText },
];

/** Luka płacowa w % używana do warunkowego wyświetlania ComplianceAlert (gap > 5%). */
const DASHBOARD_PAY_GAP_PERCENT = 23.5;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ComplianceAlert: wyświetlany gdy luka płacowa > 5% */}
      {DASHBOARD_PAY_GAP_PERCENT > 5 && (
        <ComplianceAlert
          payGapPercent={DASHBOARD_PAY_GAP_PERCENT}
          citation="Art. 9 Dyrektywy UE 2023/970"
          action={{
            label: "Zobacz Plan Działania",
            href: "/solio-solver",
          }}
        />
      )}

      {/* Metryki z objaśnieniami (responsive: 1 / 2 / 3 kolumny) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ExplainableMetric
          label="Luka Płacowa (Mediana)"
          value={23.5}
          unit="%"
          citation="Art. 9 ust. 2 Dyrektywy UE 2023/970"
          explanation="Mediana to środkowa wartość w uporządkowanym zbiorze wynagrodzeń. Luka płacowa obliczana jest jako różnica median męskich i żeńskich, podzielona przez medianę męską."
          confidence={0.95}
          status="critical"
        />
        <ExplainableMetric
          label="Luka w Kwartylu 4 (najwyższe zarobki)"
          value={18.2}
          unit="%"
          citation="Art. 16 ust. 1 lit. b Dyrektywy UE 2023/970"
          explanation="Kwartyl 4 to 25% najlepiej zarabiających pracowników. Wysoka luka w tym kwartylu wskazuje na niedoreprezentację kobiet na stanowiskach kierowniczych."
          confidence={0.92}
          status="critical"
        />
        <ExplainableMetric
          label="Wskaźnik Reprezentacji Kobiet (Zarząd)"
          value={33.3}
          unit="%"
          citation="Art. 7 ust. 1 Dyrektywy UE 2023/970"
          explanation="Odsetek kobiet w składzie zarządu. Dyrektywa wymaga raportowania reprezentacji w kategoriach zarządczych."
          confidence={1.0}
          status="good"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">
            Witamy w PayCompass
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
