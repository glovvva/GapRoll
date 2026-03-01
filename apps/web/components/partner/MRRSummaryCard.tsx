"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Wallet } from "lucide-react";

export interface MRRData {
  active_clients: number;
  partner_mrr: number;
  payout_this_month: number;
}

interface MRRSummaryCardProps {
  data: MRRData | null;
  loading?: boolean;
}

function formatPLN(v: number): string {
  return `${Math.round(v).toLocaleString("pl-PL")} PLN`;
}

export function MRRSummaryCard({ data, loading }: MRRSummaryCardProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-text-secondary">—</CardTitle></CardHeader>
          <CardContent><div className="h-8 w-24 animate-pulse rounded bg-surface" /></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-text-secondary">—</CardTitle></CardHeader>
          <CardContent><div className="h-8 w-24 animate-pulse rounded bg-surface" /></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-text-secondary">—</CardTitle></CardHeader>
          <CardContent><div className="h-8 w-24 animate-pulse rounded bg-surface" /></CardContent>
        </Card>
      </div>
    );
  }
  const a = data?.active_clients ?? 0;
  const m = data?.partner_mrr ?? 0;
  const p = data?.payout_this_month ?? 0;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-text-secondary">Aktywni klienci</CardTitle>
          <Users className="size-4 text-text-muted" />
        </CardHeader>
        <CardContent><p className="text-2xl font-bold text-primary">{a}</p></CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-text-secondary">Twój MRR</CardTitle>
          <TrendingUp className="size-4 text-text-muted" />
        </CardHeader>
        <CardContent><p className="text-2xl font-bold text-primary">{formatPLN(m)}</p></CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-text-secondary">Wypłata w tym miesiącu</CardTitle>
          <Wallet className="size-4 text-text-muted" />
        </CardHeader>
        <CardContent><p className="text-2xl font-bold text-primary">{formatPLN(p)}</p></CardContent>
      </Card>
    </div>
  );
}
