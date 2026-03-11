"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Building2, Check, CreditCard, Mail, Shield, X, Zap } from "lucide-react";
import SpotlightCard from "@/components/marketing/SpotlightCard";

// ─── Pricing data ────────────────────────────────────────────────────────────
type SegmentId = "small" | "midI" | "midII" | "large" | "largePlus" | "enterprise";

const PRICING: Record<SegmentId, { standard: number | null; pro: number | null }> = {
  small:      { standard: 149,  pro: 299  },
  midI:       { standard: 249,  pro: 499  },
  midII:      { standard: 349,  pro: 699  },
  large:      { standard: 599,  pro: 1199 },
  largePlus:  { standard: 999,  pro: 1999 },
  enterprise: { standard: null, pro: null },
};

const SEGMENTS: { id: SegmentId; label: string; sub: string }[] = [
  { id: "small",      label: "Small",      sub: "do 99 os."   },
  { id: "midI",       label: "Mid I",       sub: "100–149 os." },
  { id: "midII",      label: "Mid II",      sub: "150–249 os." },
  { id: "large",      label: "Large",       sub: "250–499 os." },
  { id: "largePlus",  label: "Large+",      sub: "500–999 os." },
  { id: "enterprise", label: "Enterprise",  sub: "1000+ os."   },
];

const SEGMENT_DESC: Record<SegmentId, string> = {
  small:      "do 99 pracowników",
  midI:       "100–149 pracowników",
  midII:      "150–249 pracowników",
  large:      "250–499 pracowników",
  largePlus:  "500–999 pracowników",
  enterprise: "1000+ pracowników",
};

// ─── Feature lists ────────────────────────────────────────────────────────────
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

// ─── Sub-components ───────────────────────────────────────────────────────────
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function PricingSection({ onOpenWaitlist }: { onOpenWaitlist?: () => void }) {
  const [activeSegment, setActiveSegment] = useState<SegmentId>("small");

  const isEnterprise = activeSegment === "enterprise";
  const standardPrice = PRICING[activeSegment].standard;
  const proPrice = PRICING[activeSegment].pro;

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
        {/* Standard card */}
        <SpotlightCard spotlightColor={TEAL_SPOTLIGHT} className="relative p-8">
          <h3 className="font-display text-2xl text-foreground">Standard</h3>
          <p className="mt-1 text-sm text-muted-foreground">{SEGMENT_DESC[activeSegment]}</p>
          {isEnterprise ? (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dedykowane wdrożenie dla organizacji 1000+ pracowników. SSO/SAML, SCIM, SLA 99.9%, dedykowany opiekun klienta.
              </p>
              <a
                href="mailto:bartek@gaproll.eu"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-6 py-3.5 font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Mail className="size-4" />
                Skontaktuj się
              </a>
            </div>
          ) : (
            <>
              <div className="mt-6 flex items-baseline gap-1">
                <PriceDisplay price={standardPrice!} />
                <span className="text-lg text-muted-foreground">PLN/mies</span>
              </div>
              <button
                type="button"
                onClick={onOpenWaitlist}
                className="mt-8 flex w-full items-center justify-center rounded-xl border border-border px-6 py-3.5 font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Zarezerwuj miejsce
              </button>
            </>
          )}
        </SpotlightCard>

        {/* Pro card */}
        <SpotlightCard
          spotlightColor={GOLD_SPOTLIGHT}
          className="relative border-primary/40 p-8 shadow-[0_0_40px_-10px_rgba(107,159,212,0.35)]"
        >
          <span className="inline-block rounded-full bg-[#6B9FD4] px-3 py-1 text-xs font-mono font-bold uppercase tracking-wide text-background">
            Rekomendowane
          </span>
          <h3 className="mt-3 font-display text-2xl text-foreground">Pro</h3>
          <p className="mt-1 text-sm text-muted-foreground">{SEGMENT_DESC[activeSegment]}</p>
          {isEnterprise ? (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dedykowane wdrożenie dla organizacji 1000+ pracowników. SSO/SAML, SCIM, SLA 99.9%, dedykowany opiekun klienta.
              </p>
              <a
                href="mailto:bartek@gaproll.eu"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B9FD4] px-6 py-3.5 font-medium text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Mail className="size-4" />
                Skontaktuj się
              </a>
            </div>
          ) : (
            <>
              <div className="mt-6 flex items-baseline gap-1">
                <StrategiaPriceDisplay price={proPrice!} />
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
            </>
          )}
        </SpotlightCard>
      </div>

      {/* Feature checklists */}
      <div className="mx-auto mt-16 max-w-4xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <h3 className="mb-4 font-display text-lg text-foreground">
              Standard zawiera:
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
              Pro zawiera wszystko z Standard, plus:
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
