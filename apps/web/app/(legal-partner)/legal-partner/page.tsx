"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CitationBadge } from "@/components/explainability/CitationBadge";
import { Coins, FileCheck, Users, PlusCircle, X } from "lucide-react";
import { fetchWithAuth } from "@/lib/api-client";
import { NewAuditModal } from "@/components/legal-partner/NewAuditModal";

type DashboardData = {
  tokens_available: number;
  tokens_used_this_month: number;
  total_clients_audited: number;
  recent_audits: Array<{
    client_name: string;
    nip: string;
    date: string;
    report_ready: boolean;
  }>;
};

export default function LegalPartnerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchWithAuth("/api/legal-partner/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const refreshDashboard = () => {
    setLoading(true);
    fetchWithAuth("/api/legal-partner/dashboard")
      .then((res) => res.ok ? res.json() : null)
      .then((json) => {
        setData(json ?? null);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Portal Kancelarii</h1>
        <p className="mt-2 text-muted-foreground">
          Audyty zgodności z Dyrektywą UE 2023/970 — tokeny audytowe i raporty
        </p>
      </div>

      {!bannerDismissed && (
        <Alert className="border-emerald-700 bg-emerald-950/50 text-emerald-100">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <AlertDescription className="flex flex-wrap items-center gap-2">
                <span className="font-medium">Tryb Ścisłej Anonimowości RODO Aktywny</span>
                <CitationBadge
                  article="Art. 9 ust. 1 Dyrektywy UE 2023/970"
                  variant="neutral"
                  className="shrink-0"
                />
              </AlertDescription>
              <p className="text-sm text-emerald-200/90">
                Żadne dane osobowe nie opuszczają Państwa przeglądarki podczas analizy.
              </p>
              <Link
                href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32023L0970"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-emerald-300 underline hover:text-emerald-200"
              >
                Dowiedz się więcej
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-emerald-300 hover:bg-emerald-800/50 hover:text-white"
              onClick={() => setBannerDismissed(true)}
              aria-label="Zamknij baner"
            >
              <X className="size-4" />
            </Button>
          </div>
        </Alert>
      )}

      {loading && !data ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">—</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-10 w-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dostępne tokeny audytowe
              </CardTitle>
              <Coins className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {data?.tokens_available ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Przeprowadzone audyty (ten miesiąc)
              </CardTitle>
              <FileCheck className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {data?.tokens_used_this_month ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Klienci obsłużeni łącznie
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {data?.total_clients_audited ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Ostatnie audyty</CardTitle>
          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2"
          >
            <PlusCircle className="size-4" />
            Rozpocznij nowy audyt
          </Button>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <div className="h-32 animate-pulse rounded bg-muted" />
          ) : !data?.recent_audits?.length ? (
            <p className="text-muted-foreground">Brak przeprowadzonych audytów.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 pr-4 text-left font-medium">Nazwa klienta</th>
                    <th className="pb-3 pr-4 text-left font-medium">NIP</th>
                    <th className="pb-3 pr-4 text-left font-medium">Data</th>
                    <th className="pb-3 text-left font-medium">Status raportu</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_audits.map((a, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-3 pr-4">{a.client_name}</td>
                      <td className="py-3 pr-4 font-mono">{a.nip}</td>
                      <td className="py-3 pr-4">{a.date}</td>
                      <td className="py-3">
                        {a.report_ready ? (
                          <Badge className="bg-emerald-600/90 text-white border-0">
                            Raport gotowy
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 dark:text-amber-400">
                            W trakcie
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <NewAuditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={refreshDashboard}
      />
    </div>
  );
}
