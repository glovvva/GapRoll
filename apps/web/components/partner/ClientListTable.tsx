"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export type ClientStatus = "active" | "trial" | "inactive";
export type ClientTier = "compliance" | "strategia";

export interface PartnerClient {
  id: string;
  company_name: string;
  nip: string;
  employee_count: number;
  tier: ClientTier;
  status: ClientStatus;
  joined_at: string;
  partner_revenue_pln: number;
  /** Optional link to impersonate or open client account */
  account_link?: string;
}

interface ClientListTableProps {
  clients: PartnerClient[];
  loading?: boolean;
  onGoToAccount?: (client: PartnerClient) => void;
}

/* Semantic badges (NIE gender): Tier = produkt, Status = stan */
const tierStyles: Record<ClientTier, string> = {
  compliance: "badge-correct",
  strategia: "badge-action",
};

const statusStyles: Record<ClientStatus, string> = {
  active: "badge-correct",
  trial: "badge-review",
  inactive: "badge-alert",
};

const statusLabels: Record<ClientStatus, string> = {
  active: "Aktywny",
  trial: "Trial",
  inactive: "Nieaktywny",
};

const tierLabels: Record<ClientTier, string> = {
  compliance: "Compliance",
  strategia: "Strategia",
};

function formatDate(iso: string): string {
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

function formatPLN(value: number): string {
  return `${Math.round(value).toLocaleString("pl-PL")} PLN`;
}

export function ClientListTable({
  clients,
  loading,
  onGoToAccount,
}: ClientListTableProps) {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Moi klienci</CardTitle>
          <CardDescription>Ładowanie…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse rounded bg-elevated" />
        </CardContent>
      </Card>
    );
  }

  if (clients.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Moi klienci</CardTitle>
          <CardDescription>
            Brak klientów. Dodaj pierwszego klienta za pomocą formularza.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Moi klienci</CardTitle>
        <CardDescription>Lista firm objętych opieką</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-text-primary">
                  Nazwa firmy
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-primary">
                  NIP
                </th>
                <th className="px-4 py-3 text-center font-semibold text-text-primary">
                  Pracownicy
                </th>
                <th className="px-4 py-3 text-center font-semibold text-text-primary">
                  Tier
                </th>
                <th className="px-4 py-3 text-center font-semibold text-text-primary">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-primary">
                  Data dołączenia
                </th>
                <th className="px-4 py-3 text-right font-semibold text-text-primary">
                  Twój przychód
                </th>
                {(onGoToAccount || clients.some((c) => c.account_link)) && (
                  <th className="px-4 py-3 text-right font-semibold text-text-primary">
                    Akcje
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-border/50 hover:bg-card/80"
                >
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {client.company_name}
                  </td>
                  <td className="px-4 py-3 font-mono text-text-secondary">
                    {client.nip}
                  </td>
                  <td className="px-4 py-3 text-center text-text-secondary">
                    {client.employee_count}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border px-2 py-0.5 text-xs font-medium rounded-full",
                        tierStyles[client.tier]
                      )}
                    >
                      {tierLabels[client.tier]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border px-2 py-0.5 text-xs font-medium rounded-full",
                        statusStyles[client.status]
                      )}
                    >
                      {statusLabels[client.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatDate(client.joined_at)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-primary">
                    {formatPLN(client.partner_revenue_pln)}
                  </td>
                  {(onGoToAccount || client.account_link) && (
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() =>
                          onGoToAccount?.(client) ||
                          (client.account_link &&
                            window.open(client.account_link, "_blank"))
                        }
                        asChild={
                          client.account_link && !onGoToAccount
                            ? undefined
                            : undefined
                        }
                      >
                        {client.account_link && !onGoToAccount ? (
                          <a
                            href={client.account_link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-1 size-3.5" />
                            Przejdź do konta
                          </a>
                        ) : (
                          <>
                            <ExternalLink className="mr-1 size-3.5" />
                            Przejdź do konta
                          </>
                        )}
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
