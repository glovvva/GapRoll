"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Mail } from "lucide-react";

// ─── Pricing data ─────────────────────────────────────────────────────────────
type SegmentId = "small" | "midI" | "midII" | "large" | "largePlus" | "enterprise";

const PRICING: Record<SegmentId, { standard: number | null; pro: number | null }> = {
  small:      { standard: 149,  pro: 299  },
  midI:       { standard: 249,  pro: 499  },
  midII:      { standard: 349,  pro: 699  },
  large:      { standard: 599,  pro: 1199 },
  largePlus:  { standard: 999,  pro: 1999 },
  enterprise: { standard: null, pro: null },
};

const SEGMENTS: { id: SegmentId; label: string }[] = [
  { id: "small",      label: "Small (do 99 os.)"       },
  { id: "midI",       label: "Mid I (100–149 os.)"      },
  { id: "midII",      label: "Mid II (150–249 os.)"     },
  { id: "large",      label: "Large (250–499 os.)"      },
  { id: "largePlus",  label: "Large+ (500–999 os.)"     },
  { id: "enterprise", label: "Enterprise (1000+ os.)"   },
];

const tiers = [
  {
    id: "standard" as const,
    name: "Standard",
    description: "Podstawowa zgodność z Dyrektywą UE 2023/970",
    period: "mies.",
    highlight: false,
    features: [
      "Upload danych pracowników (CSV/Excel)",
      "Automatyczne wartościowanie stanowisk (EVG)",
      "Analiza luki płacowej (Art. 7)",
      "Raport Art. 16 (PDF + Excel)",
      "Edycja ręczna wszystkich danych",
      "Wsparcie email (48h response)",
    ],
    cta: "Rozpocznij z Gaproll",
  },
  {
    id: "pro" as const,
    name: "Pro",
    description: "Zaawansowana analiza + AI agents",
    period: "mies.",
    highlight: true,
    badge: "Najpopularniejszy",
    features: [
      "Wszystko z planu Standard",
      "Root Cause Analysis — przyczyny nierówności",
      "Collaborative Review — współpraca z zespołem",
      "Hunter Agent — automatyczna rekrutacja zgodna z EVG",
      "Guardian Agent — monitoring zgodności prawnej 24/7",
      "Priorytetowe wsparcie (4h response)",
      "Dedykowany onboarding call (30 min)",
    ],
    cta: "Rozpocznij z Gaproll",
  },
];

export default function PricingSection({ onOpenWaitlist }: { onOpenWaitlist?: () => void }) {
  const [activeSegment, setActiveSegment] = useState<SegmentId>("small");
  const isEnterprise = activeSegment === "enterprise";

  return (
    <section
      id="cennik"
      aria-labelledby="pricing-heading"
      className="mx-auto max-w-7xl bg-background px-6 py-24"
    >
      <div className="text-center">
        <span className="mb-4 inline-block rounded-full border border-[#6B9FD4]/30 px-3 py-1 text-sm text-[#6B9FD4]">
          Cennik
        </span>
        <h2
          id="pricing-heading"
          className="mb-6 font-heading text-3xl font-bold text-text-primary md:text-5xl"
        >
          Proste, przejrzyste ceny w PLN
        </h2>
        <p className="mx-auto max-w-3xl text-center text-lg text-text-secondary mb-8">
          Bez ukrytych kosztów. Bez niespodzianek. Anuluj w każdej chwili.
        </p>
      </div>

      {/* Segment switcher */}
      <div className="mx-auto mb-10 flex flex-wrap justify-center gap-2">
        {SEGMENTS.map((seg) => (
          <button
            key={seg.id}
            type="button"
            onClick={() => setActiveSegment(seg.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B9FD4] ${
              activeSegment === seg.id
                ? "bg-[#6B9FD4] text-white"
                : "border border-[#6B9FD4]/20 text-text-secondary hover:border-[#6B9FD4]/40 hover:text-text-primary"
            }`}
          >
            {seg.label}
          </button>
        ))}
      </div>

      {/* Mobile scroll hint */}
      <p className="md:hidden text-center text-xs mb-3 text-[#94A3B8]">← Przesuń, aby porównać plany →</p>

      <div className="overflow-x-auto [scroll-snap-type:x_mandatory] pb-4">
        <div className="flex md:grid md:grid-cols-2 gap-8 md:mx-auto md:max-w-5xl" style={{ minWidth: 'max-content' }}>
          {tiers.map((tier, index) => {
            const price = PRICING[activeSegment][tier.id === "standard" ? "standard" : "pro"];
            return (
              <motion.article
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={tier.highlight ? undefined : { y: -4 }}
                className={`relative flex flex-col rounded-lg border bg-card p-8 [scroll-snap-align:start] min-w-[300px] md:min-w-0 ${
                  tier.highlight
                    ? "border-[#6B9FD4] shadow-glow-teal"
                    : "border-[#6B9FD4]/10 transition-all duration-300 hover:border-[#6B9FD4]/30"
                }`}
              >
                {tier.highlight && tier.badge && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#6B9FD4] px-4 py-1 text-sm font-semibold text-foreground"
                    aria-hidden
                  >
                    {tier.badge}
                  </div>
                )}

                <h3 className="mb-2 font-heading text-2xl font-bold text-text-primary">
                  {tier.name}
                </h3>
                <p className="mb-6 text-sm text-text-secondary">{tier.description}</p>

                {isEnterprise ? (
                  <div className="mb-8 flex-grow">
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Dedykowane wdrożenie dla organizacji 1000+ pracowników. SSO/SAML, SCIM, SLA 99.9%, dedykowany opiekun klienta.
                    </p>
                  </div>
                ) : (
                  <div className="mb-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${activeSegment}-${tier.id}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-baseline gap-2"
                      >
                        <span className="font-heading text-5xl font-bold text-text-primary">
                          {price}
                        </span>
                        <span className="text-text-secondary">PLN / {tier.period}</span>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}

                <ul className="mb-8 flex-grow space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#6B9FD4]"
                        aria-hidden
                      />
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isEnterprise ? (
                  <a
                    href="mailto:bartek@gaproll.eu"
                    className={`flex w-full items-center justify-center gap-2 rounded-lg py-4 text-lg font-semibold transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B9FD4] min-h-[48px] ${
                      tier.highlight
                        ? "bg-[#6B9FD4] text-foreground hover:bg-teal-hover"
                        : "border border-[#6B9FD4]/30 text-[#6B9FD4] hover:bg-[#6B9FD4]/10"
                    }`}
                  >
                    <Mail className="size-5" />
                    Skontaktuj się
                  </a>
                ) : tier.highlight ? (
                  <motion.button
                    type="button"
                    onClick={onOpenWaitlist}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-lg bg-[#6B9FD4] py-4 text-lg font-semibold text-foreground transition-colors hover:bg-teal-hover outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B9FD4] min-h-[48px]"
                  >
                    {tier.cta}
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={onOpenWaitlist}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-lg border border-[#6B9FD4]/30 py-4 text-lg font-semibold text-[#6B9FD4] transition-colors hover:bg-[#6B9FD4]/10 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B9FD4] min-h-[48px]"
                  >
                    {tier.cta}
                  </motion.button>
                )}

                {!isEnterprise && (
                  <p className="mt-4 text-center text-xs text-text-muted">
                    14 dni za darmo · Bez karty kredytowej
                  </p>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
