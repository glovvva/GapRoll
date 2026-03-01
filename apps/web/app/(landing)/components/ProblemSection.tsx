"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const problems = [
  "Ręczne sortowanie danych w Excelu",
  "Błędy w wartościowaniu stanowisk",
  "Brak pewności zgodności prawnej",
  "Ryzyko kar finansowych (do 30 000 PLN)",
  "Stres przed kontrolą PIP/ZUS",
];

const solutions = [
  "Automatyczne wartościowanie stanowisk (EVG)",
  "Raport Art. 16 zgodny z Dyrektywą UE 2023/970",
  "Pełna kontrola i możliwość edycji ręcznej",
  "Bezpieczeństwo danych (RODO compliance)",
  "Spokój ducha przed terminem 7 czerwca 2026",
];

export default function ProblemSection() {
  return (
    <section
      id="funkcje"
      aria-labelledby="problem-heading"
      className="mx-auto max-w-7xl px-6 py-24"
    >
      <motion.h2
        id="problem-heading"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center font-heading text-3xl font-bold text-text-primary md:text-5xl"
      >
        Od chaosu w Excelu do raportu w 15 minut
      </motion.h2>

      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        {/* Kolumna 1 — Problem */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-6 transition-shadow duration-300 hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.12)]"
        >
          <span className="mb-4 inline-block rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-500">
            ❌ Bez GapRoll
          </span>
          <h3 className="mb-4 font-heading text-2xl font-semibold text-text-primary">
            3 tygodnie pracy ręcznej
          </h3>
          <ul className="flex flex-col gap-3">
            {problems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-text-secondary"
              >
                <X className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Kolumna 2 — Rozwiązanie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl p-6 transition-shadow duration-300 hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.12)]"
        >
          <span className="mb-4 inline-block rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-500">
            ✅ Z GapRoll
          </span>
          <h3 className="mb-4 font-heading text-2xl font-semibold text-text-primary">
            15 minut do gotowego raportu
          </h3>
          <ul className="flex flex-col gap-3">
            {solutions.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-text-secondary"
              >
                <Check
                  className="mt-0.5 h-5 w-5 shrink-0 text-green-500"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
