"use client";

import { motion } from "framer-motion";
import { Upload, Brain, BarChart3, FileText, Check } from "lucide-react";

const features = [
  {
    icon: Upload,
    iconColor: "text-teal-primary",
    title: "Upload danych w 2 minuty",
    description:
      "Wgraj CSV z danymi pracowników (imię, stanowisko, wynagrodzenie, płeć). System automatycznie rozpoznaje kolumny i waliduje dane.",
    bullets: [
      "Obsługa CSV, Excel (.xlsx)",
      "Automatyczna walidacja danych",
      "Podpowiedzi przy błędach",
    ],
  },
  {
    icon: Brain,
    iconColor: "text-legal-gold",
    title: "Wartościowanie stanowisk (EVG)",
    description:
      "AI analizuje opisy stanowisk według kryteriów z Dyrektywy UE 2023/970 (Art. 4). Pełna kontrola — możesz edytować każdą decyzję ręcznie.",
    bullets: [
      "Zgodność z Art. 4 Dyrektywy UE",
      "Edycja ręczna w każdej chwili",
      "Wyjaśnienia dla każdej oceny",
    ],
  },
  {
    icon: BarChart3,
    iconColor: "text-teal-light",
    title: "Analiza luki płacowej",
    description:
      "Automatyczne obliczenia różnic wynagrodzenia między kobietami i mężczyznami na równoważnych stanowiskach. Zgodność z Art. 7 Dyrektywy UE.",
    bullets: [
      "Rozdział wynagrodzenia: podstawa + dodatki",
      "Analiza według poziomu stanowisk",
      "Wykrywanie nierówności systemowych",
    ],
  },
  {
    icon: FileText,
    iconColor: "text-legal-gold",
    title: "Raport Art. 16 (gotowy do wysłania)",
    description:
      "Raport zgodny z wymogami Dyrektywy UE 2023/970, Art. 16. Gotowy do przekazania do GUS, PIP lub ZUS. Format PDF + Excel.",
    bullets: [
      "Zgodność z Art. 16 i Art. 9a",
      "Export PDF (druk) + Excel (analiza)",
      "Podpis elektroniczny (opcjonalnie)",
    ],
  },
];

export default function FeaturesGrid() {
  return (
    <section
      aria-labelledby="features-heading"
      className="mx-auto max-w-7xl bg-forest-deep px-6 py-24"
    >
      <div className="text-center">
        <span className="mb-4 inline-block rounded-full border border-teal-primary/30 px-3 py-1 text-sm text-teal-primary">
          Funkcje
        </span>
        <h2
          id="features-heading"
          className="mb-6 font-heading text-3xl font-bold text-text-primary md:text-5xl"
        >
          Wszystko, czego potrzebujesz do zgodności płacowej
        </h2>
        <p className="mx-auto max-w-3xl text-center text-lg text-text-secondary mb-16">
          Pełna automatyzacja procesu raportowania — od uploadu danych do
          gotowego raportu Art. 16
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {features.map(({ icon: Icon, iconColor, title, description, bullets }, index) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="rounded-lg border border-teal-primary/10 bg-forest-card p-8 transition-all duration-300 hover:border-teal-primary/30 hover:shadow-glow-teal"
          >
            <div className="mb-4 flex items-center gap-4">
              <Icon
                className={`h-10 w-10 ${iconColor}`}
                aria-hidden="true"
              />
              <h3 className="font-heading text-2xl font-semibold text-text-primary">
                {title}
              </h3>
            </div>
            <p className="mb-4 leading-relaxed text-text-secondary">
              {description}
            </p>
            <ul className="space-y-2">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-primary"
                    aria-hidden
                  />
                  <span className="text-sm text-text-secondary">{bullet}</span>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
