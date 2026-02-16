"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-screen items-center justify-center px-6 py-20 md:py-32"
    >
      {/* Background gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest-card/40 opacity-40 blur-[120px]"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-block rounded-full border border-legal-gold/30 bg-legal-gold/5 px-4 py-2 text-sm text-legal-gold"
        >
          Dyrektywa UE 2023/970 · Termin: 7 czerwca 2026
        </motion.div>

        {/* H1 */}
        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 font-heading text-4xl font-bold leading-[1.15] tracking-tight text-text-primary md:text-[3.5rem]"
        >
          Raport zgodności płacowej gotowy w 15 minut
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-auto mt-6 max-w-3xl text-lg leading-[1.7] text-text-secondary md:text-xl"
        >
          Automatyczne wartościowanie stanowisk, analiza luki płacowej i raport
          Art. 16 — bez Excela, bez stresu, z pełną kontrolą.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.div whileTap={{ scale: 0.98 }}>
            <Link
              href="/register"
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-teal-primary px-8 py-4 text-lg font-semibold text-forest-deep transition-colors hover:bg-teal-hover outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-primary"
            >
              Rozpocznij darmowy trial
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.98 }}>
            <button
              type="button"
              onClick={() => scrollToSection("jak-to-dziala")}
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-teal-primary/30 px-8 py-4 text-lg font-semibold text-teal-primary transition-colors hover:bg-teal-primary/10 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-primary"
            >
              Zobacz jak działa →
            </button>
          </motion.div>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-sm text-text-muted"
        >
          14 dni za darmo · Bez karty kredytowej · RODO compliance
        </motion.p>
      </div>
    </section>
  );
}
