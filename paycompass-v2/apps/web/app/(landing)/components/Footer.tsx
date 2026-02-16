"use client";

import Link from "next/link";

const productLinks = [
  { text: "Funkcje", href: "#funkcje" },
  { text: "Cennik", href: "#cennik" },
  { text: "Jak to działa", href: "#jak-to-dziala" },
  { text: "FAQ", href: "#faq" },
];

const legalLinks = [
  { text: "Polityka prywatności", href: "/privacy" },
  { text: "Regulamin", href: "/terms" },
  { text: "RODO & DPA", href: "/dpa" },
  { text: "kontakt@gaproll.eu", href: "mailto:kontakt@gaproll.eu" },
];

const linkClassName =
  "block text-sm text-text-secondary transition-colors hover:text-teal-primary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-primary rounded";

export default function Footer() {
  return (
    <footer className="border-t border-teal-primary/10 bg-forest-card">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 grid gap-12 md:grid-cols-3">
          {/* Kolumna 1 — Brand */}
          <div>
            <h3 className="mb-4 font-heading text-2xl font-bold text-teal-primary">
              GapRoll
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-text-secondary">
              Platforma zgodności płacowej dla polskich firm. Dyrektywa UE
              2023/970 — prosto, szybko, bezpiecznie.
            </p>
            <p className="text-xs text-text-muted">
              © 2026 GapRoll. Wszelkie prawa zastrzeżone.
            </p>
          </div>

          {/* Kolumna 2 — Produkt */}
          <nav aria-label="Produkt">
            <h4 className="mb-4 font-heading text-lg font-semibold text-text-primary">
              Produkt
            </h4>
            <ul className="space-y-3">
              {productLinks.map(({ text, href }) => (
                <li key={href}>
                  <Link href={href} className={linkClassName}>
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kolumna 3 — Legal & Kontakt */}
          <nav aria-label="Legal i kontakt">
            <h4 className="mb-4 font-heading text-lg font-semibold text-text-primary">
              Legal & Kontakt
            </h4>
            <ul className="space-y-3">
              {legalLinks.map(({ text, href }) => (
                <li key={href}>
                  <Link href={href} className={linkClassName}>
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <hr className="mb-6 border-t border-teal-primary/10" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-text-muted md:flex-row">
          <p>NIP: [po rejestracji]</p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="transition-colors hover:text-teal-primary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-primary rounded"
            >
              LinkedIn
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-teal-primary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-primary rounded"
            >
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
