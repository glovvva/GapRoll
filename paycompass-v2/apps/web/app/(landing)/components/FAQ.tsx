"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question:
      "Czy muszę mieć wiedzę techniczną, żeby korzystać z GapRoll?",
    answer:
      "Nie. GapRoll został zaprojektowany dla HR Managerów bez wiedzy technicznej. Wystarczy wgrać plik CSV lub Excel — resztę zrobi platforma. Każdy krok ma podpowiedzi i wyjaśnienia.",
  },
  {
    question: "Jak długo trwa przygotowanie raportu Art. 16?",
    answer:
      "Średnio 15 minut od uploadu danych do gotowego raportu. Dla firm z 50 pracownikami: ~10 minut. Dla firm z 500+ pracownikami: ~20-25 minut (zależy od złożoności struktury stanowisk).",
  },
  {
    question: "Czy mogę edytować wartościowanie stanowisk ręcznie?",
    answer:
      "Tak. AI wykonuje automatyczne wartościowanie według kryteriów z Art. 4 Dyrektywy UE, ale masz pełną kontrolę — możesz edytować każdą decyzję, dodawać komentarze i zatwierdzać zmiany przed wygenerowaniem raportu.",
  },
  {
    question: "Gdzie są przechowywane dane pracowników?",
    answer:
      "Wszystkie dane są przechowywane w Polsce (datacenter Hetzner w Niemczech, zgodność z RODO). Używamy szyfrowania end-to-end (AES-256) i nie udostępniamy danych podmiotom trzecim. Możesz usunąć dane w każdej chwili.",
  },
  {
    question: "Czy raport jest zgodny z wymogami GUS/PIP/ZUS?",
    answer:
      "Tak. Raport spełnia wymogi Art. 16 Dyrektywy UE 2023/970 oraz wytyczne GUS. Zawiera wszystkie wymagane elementy: podział wynagrodzeń, analizę EVG, uzasadnienie różnic. Format PDF (do druku) + Excel (do analizy).",
  },
  {
    question: "Co to jest EVG (Equal Value of Work)?",
    answer:
      "EVG to wartościowanie stanowisk według 'równej wartości pracy' — wymagane przez Art. 4 Dyrektywy UE. GapRoll analizuje stanowiska według 4 kryteriów: umiejętności, wysiłek, odpowiedzialność, warunki pracy. AI sugeruje oceny, ale Ty masz ostatnie słowo.",
  },
  {
    question: "Czy mogę anulować subskrypcję w każdej chwili?",
    answer:
      "Tak. Subskrypcja działa w modelu miesięcznym bez zobowiązań. Możesz anulować w dowolnym momencie (nie pobieramy opłat za kolejny miesiąc). Twoje dane pozostają dostępne przez 30 dni po anulowaniu.",
  },
  {
    question: "Czy oferujecie wsparcie przy wdrożeniu?",
    answer:
      "Plan Compliance: wsparcie email (48h response). Plan Strategia: priorytetowe wsparcie (4h response) + dedykowany onboarding call (30 min) na Zoom, gdzie przeprowadzimy Cię przez pierwszą analizę krok po kroku.",
  },
];

export default function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="mx-auto max-w-4xl px-6 py-24"
    >
      <h2
        id="faq-heading"
        className="mb-12 text-center font-heading text-3xl font-bold text-text-primary md:text-5xl"
      >
        Najczęściej zadawane pytania
      </h2>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left font-heading text-lg text-text-primary transition-colors hover:text-teal-primary">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="leading-relaxed text-text-secondary">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
