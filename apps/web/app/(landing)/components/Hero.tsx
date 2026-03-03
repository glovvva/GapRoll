"use client";

import { motion } from "framer-motion";
import { CheckCircle, CreditCard, Globe, Shield } from "lucide-react";
import GapAnimation from "@/components/marketing/GapAnimation";

export default function Hero({ onOpenWaitlist }: { onOpenWaitlist?: () => void }) {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-20 md:py-32"
    >
      {/* Background gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-elevated/40 opacity-40 blur-[120px]"
      />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1fr,1fr] lg:gap-16">
        {/* Left column — Typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl"
        >
          <span className="mb-6 inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono uppercase tracking-widest text-[#6B9FD4]">
            EU Dyrektywa 2023/970 · Termin: 7 czerwca 2026
          </span>

          <h1
            id="hero-heading"
            className="font-black leading-[1.05] tracking-[-0.03em] text-foreground text-5xl max-sm:font-sans max-sm:text-4xl max-sm:font-bold sm:font-display sm:text-6xl"
          >
            Raport zgodności płacowej{" "}
            <span className="brand-gradient-text">gotowy w 15 minut.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Od podstawowych danych kadrowych do pełnej dokumentacji zgodności:
            wartościowanie stanowisk, analiza wynagrodzeń i gotowe odpowiedzi
            na wnioski pracowników.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={onOpenWaitlist}
              className="inline-flex items-center justify-center rounded-xl bg-[#6B9FD4] px-8 py-3.5 font-medium text-white transition-all duration-150 ease-brand hover:bg-[#5A8FC4] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(107,159,212,0.35)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Umów bezpłatne demo →
            </button>
            <a
              href="#jak-dziala"
              className="inline-flex items-center justify-center rounded-xl border border-border px-8 py-3.5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Zobacz jak działa ↓
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface/50 px-3 py-2 backdrop-blur-sm">
              <Shield className="h-4 w-4 shrink-0 text-[#6B9FD4]" />
              <span className="text-sm font-medium text-muted-foreground">RODO</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface/50 px-3 py-2 backdrop-blur-sm">
              <Globe className="h-4 w-4 shrink-0 text-[#6B9FD4]" />
              <span className="text-sm font-medium text-muted-foreground">EU hosting</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface/50 px-3 py-2 backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 shrink-0 text-[#5BAD7F]" />
              <span className="text-sm font-medium text-muted-foreground">14 dni za darmo</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface/50 px-3 py-2 backdrop-blur-sm">
              <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Bez karty kredytowej</span>
            </div>
          </div>
        </motion.div>

        {/* Right column — GapAnimation */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-lg lg:justify-self-end"
        >
          <GapAnimation />
        </motion.div>
      </div>
    </section>
  );
}
