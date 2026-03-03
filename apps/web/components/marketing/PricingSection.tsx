"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Building2, Check, CreditCard, Shield, X, Zap } from "lucide-react";
import SpotlightCard from "@/components/marketing/SpotlightCard";

const pricing = {
  small: { compliance: 99, strategia: 199 },
  medium: { compliance: 299, strategia: 599 },
  large: { compliance: 799, strategia: 1599 },
} as const;

const SEGMENTS = [
  { id: "small" as const, label: "Małe", sub: "<100" },
  { id: "medium" as const, label: "Średnie", sub: "100-249" },
  { id: "large" as const, label: "Duże", sub: "250+" },
];

const complianceFeatures = [
  "Raport Art. 16 (analiza kwartylowa, luka płacowa)",
  "Wartościowanie stanowisk EVG (AI + edycja ręczna)",
  "Raporty dla pracowników (Art. 7)",
  "Ekwiwalent B2B (specyfika polska)",
  "Ochrona RODO (maskowanie N<3)",
  "Eksport PDF",
  "Nielimitowana liczba pracowników",
];

const strategiaExtras = [
  "Analiza przyczyn luki (Root Cause Analysis)",
  "Przegląd wynagrodzeń z menedżerami (Collaborative Review)",
  "Kalkulator ROI retencji",
  "Optymalizator budżetu (Symulator korekty wynagrodzeń)",
  "Benchmark rynkowy (porównanie z branżą)",
];

const TEAL_SPOTLIGHT = "rgba(107,159,212,0.12)";
const GOLD_SPOTLIGHT = "rgba(212,168,83,0.12)";

function PriceDisplay({ price }: { price: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={price}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="font-mono text-4xl font-bold text-foreground"
      >
        {price}
      </motion.span>
    </AnimatePresence>
  );
}

function StrategiaPriceDisplay({ price }: { price: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={price}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="font-mono text-4xl font-bold text-[#6B9FD4]"
      >
        {price}
      </motion.span>
    </AnimatePresence>
  );
}

export default function PricingSection({ onOpenWaitlist }: { onOpenWaitlist?: () => void }) {
  const [activeSegment, setActiveSegment] = useState<"small" | "medium" | "large">("small");

  const compliancePrice = pricing[activeSegment].compliance;
  const strategiaPrice = pricing[activeSegment].strategia;

  return (
    <section id="pricing" className="px-6 py-24">
      {/* Section header */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-2 text-xs font-mono uppercase tracking-widest text-[#6B9FD4]">
          Cennik
        </p>
        <h2 className="font-display text-3xl text-foreground md:text-4xl">
          Przejrzyste ceny. Zero niespodzianek.
        </h2>
        <p className="mt-2 text-muted-foreground">
          Wybierz rozmiar swojej firmy. Pełna zgodność z Dyrektywą UE 2023/970.
        </p>
      </div>

      {/* Segment switcher */}
      <div className="mx-auto mt-10 flex flex-wrap justify-center gap-2">
        {SEGMENTS.map((seg) => (
          <button
            key={seg.id}
            type="button"
            onClick={() => setActiveSegment(seg.id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              activeSegment === seg.id
                ? "bg-[#6B9FD4] text-white"
                : "bg-surface text-muted-foreground hover:bg-elevated hover:text-foreground"
            }`}
          >
            {seg.label} {seg.sub}
          </button>
        ))}
      </div>

      {/* Two cards side by side */}
      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Compliance card */}
        <SpotlightCard
          spotlightColor={TEAL_SPOTLIGHT}
          className="relative p-8"
        >
          <h3 className="font-display text-2xl text-foreground">Compliance</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeSegment === "small" && "do 100 pracowników"}
            {activeSegment === "medium" && "100–249 pracowników"}
            {activeSegment === "large" && "250+ pracowników"}
          </p>
          <div className="mt-6 flex items-baseline gap-1">
            <PriceDisplay price={compliancePrice} />
            <span className="text-lg text-muted-foreground">PLN/mies</span>
          </div>
          <button
            type="button"
            onClick={onOpenWaitlist}
            className="mt-8 flex w-full items-center justify-center rounded-xl border border-border px-6 py-3.5 font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Zarezerwuj miejsce
          </button>
        </SpotlightCard>

        {/* Strategia card */}
        <SpotlightCard
          spotlightColor={GOLD_SPOTLIGHT}
          className="relative border-primary/40 p-8 shadow-[0_0_40px_-10px_rgba(107,159,212,0.35)]"
        >
          <span className="inline-block rounded-full bg-[#6B9FD4] px-3 py-1 text-xs font-mono font-bold uppercase tracking-wide text-background">
            Rekomendowane
          </span>
          <h3 className="mt-3 font-display text-2xl text-foreground">Strategia</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeSegment === "small" && "do 100 pracowników"}
            {activeSegment === "medium" && "100–249 pracowników"}
            {activeSegment === "large" && "250+ pracowników"}
          </p>
          <div className="mt-6 flex items-baseline gap-1">
            <StrategiaPriceDisplay price={strategiaPrice} />
            <span className="text-lg text-muted-foreground">PLN/mies</span>
          </div>
          <p className="mt-2 font-mono text-xs text-[#6B9FD4]">
            ROI 360% · oszczędzasz 8 600 PLN/rok
          </p>
          <button
            type="button"
            onClick={onOpenWaitlist}
            className="mt-8 flex w-full items-center justify-center rounded-xl bg-[#6B9FD4] px-6 py-3.5 font-medium text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Zarezerwuj miejsce
          </button>
        </SpotlightCard>
      </div>

      {/* Feature checklists — Compliance vs Strategia */}
      <div className="mx-auto mt-16 max-w-4xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <h3 className="mb-4 font-display text-lg text-foreground">
              Compliance zawiera:
            </h3>
            <ul className="space-y-2">
              {complianceFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <Check className="mt-0.5 size-5 shrink-0 text-[#6B9FD4]" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-display text-lg text-foreground">
              Strategia zawiera wszystko z Compliance, plus:
            </h3>
            <ul className="space-y-2">
              {strategiaExtras.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-primary/60"
                >
                  <Check className="mt-0.5 size-5 shrink-0 text-[#6B9FD4]" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Partner row */}
      <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center gap-4 rounded-2xl border border-border/50 bg-surface/40 p-6 sm:flex-nowrap">
        <Building2 className="h-10 w-10 shrink-0 text-[#6B9FD4]" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Jesteś biurem rachunkowym lub kancelarią?
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Program partnerski — obsługuj klientów z jednego panelu, zarabiaj
            prowizję od każdej subskrypcji.
          </p>
        </div>
        <Link
          href="/partnerzy"
          className="shrink-0 text-sm font-medium text-[#6B9FD4] transition-colors hover:text-primary/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Dowiedz się więcej →
        </Link>
      </div>

      {/* Trust row */}
      <div className="mx-auto mt-16 flex max-w-2xl flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <Shield className="size-4" />
          14 dni za darmo
        </span>
        <span className="flex items-center gap-2">
          <CreditCard className="size-4" />
          <X className="size-3.5" />
          Bez karty kredytowej
        </span>
        <span className="flex items-center gap-2">
          <Zap className="size-4" />
          Rezygnacja w 1 klik
        </span>
      </div>
    </section>
  );
}
