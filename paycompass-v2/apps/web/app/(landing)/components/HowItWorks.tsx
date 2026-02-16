"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { Upload, Settings, FileCheck, Clock, ChevronRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Wgraj dane",
    description:
      "Upload CSV lub Excel z danymi pracowników. Automatyczna walidacja i podpowiedzi przy błędach.",
    duration: "2 minuty",
  },
  {
    number: "02",
    icon: Settings,
    title: "Automatyczna analiza",
    description:
      "AI wykonuje wartościowanie stanowisk (EVG) i analizę luki płacowej. Możesz edytować każdą decyzję.",
    duration: "10 minut",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Pobierz raport",
    description:
      "Raport Art. 16 gotowy do wysłania do GUS/PIP/ZUS. Format PDF (druk) + Excel (analiza).",
    duration: "3 minuty",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="jak-to-dziala"
      aria-labelledby="how-it-works-heading"
      className="mx-auto max-w-7xl bg-forest-deep px-6 py-24"
    >
      <div className="text-center">
        <span className="mb-4 inline-block rounded-full border border-teal-primary/30 px-3 py-1 text-sm text-teal-primary">
          Proces
        </span>
        <h2
          id="how-it-works-heading"
          className="mb-6 font-heading text-3xl font-bold text-text-primary md:text-5xl"
        >
          3 kroki do pełnej zgodności
        </h2>
        <p className="mx-auto max-w-3xl text-center text-lg text-text-secondary mb-16">
          Od uploadu danych do gotowego raportu — bez stresu, bez Excela, z
          pełną kontrolą
        </p>
      </div>

      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center md:gap-4">
        {steps.map(({ number, icon: Icon, title, description, duration }, index) => (
          <Fragment key={title}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index, duration: 0.6 }}
              className="relative flex-1"
            >
              <div className="absolute -left-4 -top-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-teal-primary bg-teal-primary/10">
                <span className="font-heading text-2xl font-bold text-teal-primary">
                  {number}
                </span>
              </div>
              <div className="relative rounded-lg border border-teal-primary/10 bg-forest-card p-8 pt-12 transition-all duration-300 hover:border-teal-primary/30">
                <Icon
                  className="mb-4 h-12 w-12 text-teal-primary"
                  aria-hidden="true"
                />
                <h3 className="mb-3 font-heading text-2xl font-semibold text-text-primary">
                  {title}
                </h3>
                <p className="mb-4 leading-relaxed text-text-secondary">
                  {description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm text-teal-light">
                  <Clock className="h-4 w-4" aria-hidden /> {duration}
                </span>
              </div>
            </motion.div>
            {index < steps.length - 1 && (
              <div className="hidden flex-shrink-0 items-center justify-center mx-4 md:flex">
                <ChevronRight
                  className="h-8 w-8 text-teal-primary/40"
                  aria-hidden
                />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
