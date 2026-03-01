"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Compliance",
    description: "Podstawowa zgodność z Dyrektywą UE 2023/970",
    price: "99",
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
    cta: "Rozpocznij trial",
    ctaLink: "/register",
  },
  {
    name: "Strategia",
    description: "Zaawansowana analiza + AI agents",
    price: "1599",
    period: "mies.",
    highlight: true,
    badge: "Najpopularniejszy",
    features: [
      "Wszystko z planu Compliance",
      "Root Cause Analysis — przyczyny nierówności",
      "Collaborative Review — współpraca z zespołem",
      "Hunter Agent — automatyczna rekrutacja zgodna z EVG",
      "Guardian Agent — monitoring zgodności prawnej 24/7",
      "Priorytetowe wsparcie (4h response)",
      "Dedykowany onboarding call (30 min)",
    ],
    cta: "Rozpocznij trial",
    ctaLink: "/register",
  },
];

export default function PricingSection() {
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
        <p className="mx-auto max-w-3xl text-center text-lg text-text-secondary mb-16">
          Bez ukrytych kosztów. Bez niespodzianek. Anuluj w każdej chwili.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        {tiers.map((tier, index) => (
          <motion.article
            key={tier.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            whileHover={tier.highlight ? undefined : { y: -4 }}
            className={`relative flex flex-col rounded-lg border bg-card p-8 ${
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

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-5xl font-bold text-text-primary">
                  {tier.price}
                </span>
                <span className="text-text-secondary">PLN / {tier.period}</span>
              </div>
            </div>

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

            <Link href={tier.ctaLink} className="block">
              {tier.highlight ? (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-lg bg-[#6B9FD4] py-4 text-lg font-semibold text-foreground transition-colors hover:bg-teal-hover outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B9FD4] min-h-[48px]"
                >
                  {tier.cta}
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-lg border border-[#6B9FD4]/30 py-4 text-lg font-semibold text-[#6B9FD4] transition-colors hover:bg-[#6B9FD4]/10 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B9FD4] min-h-[48px]"
                >
                  {tier.cta}
                </motion.button>
              )}
            </Link>

            <p className="mt-4 text-center text-xs text-text-muted">
              14 dni za darmo · Bez karty kredytowej
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
