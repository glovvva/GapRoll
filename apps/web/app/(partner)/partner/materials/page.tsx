"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PartnerMaterialsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Panel Partnera</h1>
        <p className="mt-2 text-text-secondary">
          Zarządzaj klientami i śledź przychody
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center gap-2">
          <CardTitle>Materiały sprzedażowe</CardTitle>
          <Badge variant="secondary">Wkrótce</Badge>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-2">
            Broszury, prezentacje i szablony do współpracy z klientami.
          </CardDescription>
          <p className="text-sm text-text-muted">
            Ta sekcja będzie dostępna wkrótce.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
