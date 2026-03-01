"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PartnerBillingPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Panel Partnera</h1>
        <p className="mt-2 text-text-secondary">
          Zarządzaj klientami i śledź przychody
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Rozliczenia</CardTitle>
          <CardDescription>
            Historia wypłat i płatności za Twoich klientów.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">
            Lista rozliczeń będzie dostępna w tej sekcji.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
