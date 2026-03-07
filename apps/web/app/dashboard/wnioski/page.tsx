"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link2, FileText, ExternalLink, Copy } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { fetchWithAuthCached } from "@/lib/api-client";
import { DeadlineCountdown } from "@/components/dashboard/DeadlineCountdown";

interface RequestRow {
  id: string;
  employee_name: string;
  employee_email: string | null;
  employee_position: string | null;
  source: string;
  auth_verified: boolean;
  submitted_channel: string;
  status: string;
  deadline_at: string | null;
  created_at: string;
  sent_at?: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Nowy",
  in_review: "W trakcie",
  approved: "Do wysłania",
  sent: "Wysłany",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_review: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  approved: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  sent: "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function WnioskiPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "deadline_at", desc: false },
  ]);

  useEffect(() => {
    let cancelled = false;
    fetchWithAuthCached("/api/employee-requests/")
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setError("Nie udało się załadować listy wniosków.");
          return res.json();
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data) return;
        setRequests(data.requests || []);
      })
      .catch(() => {
        if (!cancelled) setError("Błąd połączenia.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCopyLink() {
    setGeneratingLink(true);
    setGeneratedUrl(null);
    try {
      const res = await fetchWithAuthCached("/api/employee-requests/generate-link", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const fullUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}${data.url}`
            : data.url;
        setGeneratedUrl(fullUrl);
        await navigator.clipboard.writeText(fullUrl).catch(() => {});
      }
    } finally {
      setGeneratingLink(false);
    }
  }

  const columns = useMemo<ColumnDef<RequestRow>[]>(
    () => [
      {
        accessorKey: "employee_name",
        header: "Wnioskodawca",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.employee_name}</span>
            {row.original.employee_position && (
              <span className="text-muted-foreground text-xs">
                {row.original.employee_position}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Data złożenia",
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        accessorKey: "deadline_at",
        header: "Termin odpowiedzi",
        cell: ({ row }) => (
          <DeadlineCountdown
            deadline_at={row.original.deadline_at}
            status={row.original.status}
          />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const s = (getValue() as string) || "pending";
          const label = STATUS_LABELS[s] ?? s;
          const cls = STATUS_CLASS[s] ?? STATUS_CLASS.pending;
          return <Badge variant="outline" className={cls}>{label}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Akcje",
        cell: ({ row }) => (
          <Link href={`/dashboard/wnioski/${row.original.id}`}>
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Otwórz
            </Button>
          </Link>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: requests,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    sortingFns: {
      dateSorter: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId);
        const b = rowB.getValue(columnId);
        if (columnId === "deadline_at") {
          const da = a ? new Date(a as string).getTime() : 0;
          const db = b ? new Date(b as string).getTime() : 0;
          return da - db;
        }
        if (columnId === "created_at") {
          const da = a ? new Date(a as string).getTime() : 0;
          const db = b ? new Date(b as string).getTime() : 0;
          return da - db;
        }
        return String(a).localeCompare(String(b));
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Skrzynka wniosków pracowniczych</h1>
        <p className="text-muted-foreground">
          Art. 7 Dyrektywy UE 2023/970 — wnioski o informację od pracowników
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/wnioski/nowy-reczny">
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Wprowadź wniosek ręczny
          </Button>
        </Link>
      </div>

      {generatedUrl && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <AlertDescription>
            Link skopiowany do schowka:{" "}
            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline break-all"
            >
              {generatedUrl}
            </a>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista wniosków</CardTitle>
          <CardDescription>
            Ostatnie wnioski złożone przez pracowników lub wprowadzone ręcznie.
            Termin odpowiedzi zgodnie z Art. 7 ust. 4 Dyrektywy 2023/970 (60 dni).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Ładowanie...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-4 text-center">
              <p className="text-muted-foreground max-w-md">
                Żaden pracownik nie złożył jeszcze wniosku. Udostępnij pracownikom
                link do formularza, aby mogli skorzystać z prawa do informacji o
                wynagrodzeniu (Art. 7 Dyrektywy 2023/970).
              </p>
              <Button
                onClick={handleCopyLink}
                disabled={generatingLink}
                variant="outline"
              >
                {generatingLink ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                Skopiuj link do formularza
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b bg-muted/50">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left py-3 px-4 font-medium"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-muted/30">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3 px-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
