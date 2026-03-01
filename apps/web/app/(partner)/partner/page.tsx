"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api-client";
import { MRRSummaryCard, type MRRData } from "@/components/partner/MRRSummaryCard";
import {
  ClientListTable,
  type PartnerClient,
} from "@/components/partner/ClientListTable";

export default function PartnerDashboardPage() {
  const [clients, setClients] = useState<PartnerClient[]>([]);
  const [mrr, setMrr] = useState<MRRData | null>(null);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingMrr, setLoadingMrr] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [clientsRes, mrrRes] = await Promise.all([
          fetchWithAuth("/api/partner/clients"),
          fetchWithAuth("/api/partner/mrr"),
        ]);
        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.clients ?? []);
        }
        if (mrrRes.ok) {
          const data = await mrrRes.json();
          setMrr(data);
        }
      } catch {
        setClients([]);
        setMrr(null);
      } finally {
        setLoadingClients(false);
        setLoadingMrr(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Panel Partnera</h1>
        <p className="mt-2 text-text-secondary">
          Zarządzaj klientami i śledź przychody
        </p>
      </div>

      <MRRSummaryCard data={mrr} loading={loadingMrr} />

      <ClientListTable clients={clients} loading={loadingClients} />
    </div>
  );
}
