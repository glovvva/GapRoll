"use client";

import { useCallback, useEffect, useState } from "react";
import { CitationBadge } from "@/components/explainability/CitationBadge";
import { PeriodSelector } from "@/components/data/PeriodSelector";
import { DataTableView } from "@/components/data/DataTableView";
import { fetchWithAuth } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

interface RecordsResponse {
  records: Record<string, unknown>[];
  total: number;
  page: number;
  per_page: number;
  periods: string[];
}

export default function DanePage() {
  const [data, setData] = useState<RecordsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("");
  const [compareWithPrevious, setCompareWithPrevious] = useState(false);
  const [page, setPage] = useState(1);
  const [previousRecords, setPreviousRecords] = useState<Record<string, unknown>[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: String(page), per_page: "50" });
      if (period) params.set("period", period);
      const res = await fetchWithAuth(`/api/data/records?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Błąd pobierania danych");
      }
      const json = (await res.json()) as RecordsResponse;
      setData(json);
      if (!period && json.periods?.length) {
        setPeriod(json.periods[0]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nieznany błąd");
    } finally {
      setLoading(false);
    }
  }, [page, period]);

  const prevPeriod =
    compareWithPrevious && data?.periods?.length
      ? data.periods[data.periods.indexOf(period) + 1] ?? null
      : null;

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!compareWithPrevious || !prevPeriod) {
      setPreviousRecords([]);
      return;
    }
    fetchWithAuth(
      `/api/data/records?page=1&per_page=1000&period=${encodeURIComponent(prevPeriod)}`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json: RecordsResponse) => setPreviousRecords(json.records ?? []))
      .catch(() => setPreviousRecords([]));
  }, [compareWithPrevious, prevPeriod]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          Podgląd załadowanych danych
        </h1>
        <p className="mt-1 text-slate-400 text-sm">
          Zweryfikuj dane pracowników przed wygenerowaniem raportu Art. 16
        </p>
        <div className="mt-3">
          <CitationBadge
            citation="Art. 7 Dyrektywy UE 2023/970"
            variant="info"
          />
        </div>
      </div>

      <PeriodSelector
        periods={data?.periods ?? ["2025-Q4"]}
        selectedPeriod={period}
        onPeriodChange={setPeriod}
        compareWithPrevious={compareWithPrevious}
        onCompareToggle={setCompareWithPrevious}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      ) : (
        <DataTableView
          records={data?.records ?? []}
          total={data?.total ?? 0}
          page={data?.page ?? 1}
          perPage={data?.per_page ?? 50}
          onPageChange={setPage}
          onRefresh={fetchData}
          compareWithPrevious={compareWithPrevious}
          currentPeriod={period}
          previousPeriod={prevPeriod ?? undefined}
          previousRecords={previousRecords}
          periods={data?.periods ?? []}
        />
      )}
    </div>
  );
}
