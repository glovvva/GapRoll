"use client";

import { useRouter } from "next/navigation";
import { OnboardClientForm } from "@/components/partner/OnboardClientForm";

export default function PartnerOnboardPage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Panel Partnera</h1>
        <p className="mt-2 text-text-secondary">Zarządzaj klientami i śledź przychody</p>
      </div>
      <OnboardClientForm onSuccess={() => router.push("/partner")} />
    </div>
  );
}
