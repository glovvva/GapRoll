"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTAFinal() {
  return (
    <section
      aria-label="Final call to action"
      className="mx-auto max-w-4xl px-6 py-24"
    >
      <div className="relative overflow-hidden rounded-2xl border border-teal-primary/20 bg-forest-card p-12 md:p-16">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-primary/5 to-transparent"
          aria-hidden
        />

        <div className="relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-block rounded-full border border-teal-primary/30 px-3 py-1 text-sm text-teal-primary"
          >
            Ostatni krok
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4 font-heading text-3xl font-bold text-text-primary md:text-4xl"
          >
            Gotowy na zgodność z Dyrektywą UE 2023/970?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mb-8 max-w-2xl text-lg text-text-secondary"
          >
            Rozpocznij darmowy trial i przygotuj raport Art. 16 w 15 minut —
            bez karty kredytowej, bez zobowiązań.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/register" className="inline-block">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                className="min-h-[48px] rounded-lg bg-teal-primary px-10 py-5 text-xl font-bold text-forest-deep shadow-glow-teal transition-colors hover:bg-teal-hover outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-primary"
              >
                Rozpocznij za darmo
              </motion.button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-sm text-text-muted"
          >
            14 dni za darmo · Anuluj w każdej chwili · Wsparcie w języku polskim
          </motion.p>
        </div>
      </div>
    </section>
  );
}
