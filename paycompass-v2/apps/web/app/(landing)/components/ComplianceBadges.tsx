"use client";

import { motion } from "framer-motion";
import { Shield, Lock, FileCheck } from "lucide-react";

const badges = [
  {
    icon: Shield,
    iconColor: "text-legal-gold",
    title: "Art. 16 — Raportowanie",
    description:
      "Zgodność z wymogami Dyrektywy UE 2023/970 w zakresie raportowania luki płacowej",
  },
  {
    icon: Lock,
    iconColor: "text-teal-primary",
    title: "RODO Compliance",
    description:
      "Dane przetwarzane w Polsce, szyfrowanie end-to-end, zgodność z art. 32 RODO",
  },
  {
    icon: FileCheck,
    iconColor: "text-teal-light",
    title: "EU AI Act — Przejrzystość",
    description:
      "Pełna kontrola nad decyzjami AI, wyjaśnienia na żądanie (Art. 13 EU AI Act)",
  },
];

export default function ComplianceBadges() {
  return (
    <section
      aria-label="Compliance certifications"
      className="mx-auto max-w-7xl px-6 py-16"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {badges.map(({ icon: Icon, iconColor, title, description }, index) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="rounded-lg border border-teal-primary/10 bg-forest-card p-6 transition-all duration-300 hover:border-teal-primary/30"
          >
            <Icon
              className={`mb-4 h-8 w-8 ${iconColor}`}
              aria-hidden="true"
            />
            <h3 className="mb-2 font-heading text-xl text-text-primary">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              {description}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
