"use client";

import Link from "next/link";
import {
  AlertTriangle,
  FolderCheck,
  Mail,
  Zap,
} from "lucide-react";
import SpotlightCard from "@/components/marketing/SpotlightCard";

const CARD_ICONS = [
  <Mail key="mail" className="h-8 w-8 text-[#6B9FD4]" />,
  <Zap key="zap" className="h-8 w-8 text-[#6B9FD4]" />,
  <FolderCheck key="folder" className="h-8 w-8 text-[#6B9FD4]" />,
];

const CARDS = [
  {
    title: "Pracownik składa wniosek",
    body: "GapRoll automatycznie rejestruje wniosek, przypisuje numer referencyjny i wysyła potwierdzenie do pracownika zgodnie z Art. 7 ust. 3.",
    badge: "Automatyczne",
  },
  {
    title: "System generuje odpowiedź",
    body: "Raport dla pracownika: jego wynagrodzenie vs mediana grupy porównawczej (zanonimizowane, RODO-compliant). Projekt odpowiedzi gotowy do zatwierdzenia.",
    badge: "AI + RODO",
  },
  {
    title: "Pełny audit trail",
    body: "Każdy wniosek, każda odpowiedź, każda data — archiwizowane przez 5 lat zgodnie z Art. 7 ust. 6. Gotowe na kontrolę PIP w każdej chwili.",
    badge: "PIP-ready",
  },
] as const;

export default function WorkerRequestsSection() {
  return (
    <section id="wnioski" className="relative px-6 py-24">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-2 text-xs font-mono uppercase tracking-widest text-[#6B9FD4]">
          Art. 7 Dyrektywy UE 2023/970
        </p>
        <h2 className="font-display text-3xl text-foreground md:text-4xl">
          Od 7 czerwca pracownicy mogą pytać o Twoje zarobki
        </h2>
        <p className="mt-2 text-[#C45A5A]">
          Masz 8 tygodni na odpowiedź. Brak procedury = naruszenie = kara.
        </p>
      </div>

      {/* Threat bar */}
      <div className="mx-auto mb-16 mt-8 flex max-w-3xl flex-wrap items-center gap-4 rounded-2xl border border-[#C45A5A]/40 bg-[rgba(196,90,90,0.15)] p-6 sm:flex-nowrap">
        <AlertTriangle className="h-6 w-6 shrink-0 text-[#C45A5A]" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">
            Pracownik wysyła wniosek → masz 8 tygodni na odpowiedź
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Brak odpowiedzi lub niekompletna = postępowanie PIP + kara do 50 000
            PLN
          </p>
        </div>
        <span className="shrink-0 rounded-full px-3 py-1.5 font-mono text-xs font-medium badge-alert">
          Termin: 7 czerwca 2026
        </span>
      </div>

      {/* Three-column solution grid */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        {CARDS.map((card, i) => (
          <SpotlightCard key={card.badge} className="p-6">
            <span className="inline-block rounded-full bg-primary/20 px-2.5 py-0.5 font-mono text-xs text-[#6B9FD4]">
              {card.badge}
            </span>
            <span className="mt-4 block" aria-hidden>
              {CARD_ICONS[i]}
            </span>
            <h3 className="mt-2 font-display text-xl text-foreground">
              {card.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {card.body}
            </p>
          </SpotlightCard>
        ))}
      </div>

      {/* Bottom urgency row */}
      <div className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-8">
        <div className="text-center">
          <p className="font-mono text-3xl text-[#C45A5A]">8 tygodni</p>
          <p className="mt-1 text-sm text-muted-foreground">
            na odpowiedź na wniosek
          </p>
        </div>
        <div className="text-center">
          <p className="font-mono text-3xl text-[#C4934A]">50 000 PLN</p>
          <p className="mt-1 text-sm text-muted-foreground">
            maksymalna kara za naruszenie
          </p>
        </div>
        <div className="text-center">
          <p className="font-mono text-3xl text-[#6B9FD4]">0 kliknięć</p>
          <p className="mt-1 text-sm text-muted-foreground">
            wymaganych od Ciebie — GapRoll robi to automatycznie
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 flex justify-center">
        <Link
          href="#pricing"
          className="inline-flex items-center justify-center rounded-xl border border-primary/50 px-6 py-3 font-medium text-[#6B9FD4] transition-colors hover:border-primary/80 hover:bg-primary/10 hover:text-primary/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Sprawdź czy Twoja firma jest gotowa →
        </Link>
      </div>
    </section>
  );
}
