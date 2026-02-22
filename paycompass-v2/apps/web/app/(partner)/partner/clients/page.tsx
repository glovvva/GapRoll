"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api-client";
import { ClientListTable, type PartnerClient } from "@/components/partner/ClientListTable";

export default function PartnerClientsPage() {
  const [clients, setClients] = useState<PartnerClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/api/partner/clients")
      .then((r) => (r.ok ? r.json() : { clients: [] }))
      .then((d) => setClients(d.clients ?? []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Panel Partnera</h1>
        <p className="mt-2 text-text-secondary">Zarządzaj klientami i śledź przychody</p>
      </div>
      <ClientListTable clients={clients} loading={loading} />
    </div>
  );
}
