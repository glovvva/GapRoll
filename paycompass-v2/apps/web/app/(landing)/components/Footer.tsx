"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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

const COLORS = {
  bg: "#1E293B",
  border: "rgba(255,255,255,0.08)",
  text: "#F1F5F9",
  muted: "#94A3B8",
  linkHover: "#F1F5F9",
};

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      style={{
        display: "block",
        fontSize: "14px",
        color: hover ? COLORS.linkHover : COLORS.muted,
        transition: "color 0.15s",
        textDecoration: "none",
        outline: "none",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${COLORS.border}`,
        background: COLORS.bg,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            marginBottom: "32px",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "48px",
          }}
        >
          {/* Kolumna 1 — Brand */}
          <div>
            <div style={{ marginBottom: "16px" }}>
              <Image
                src="/logo.png"
                alt="GapRoll"
                width={130}
                height={32}
                style={{ height: "32px", width: "auto" }}
              />
            </div>
            <p
              style={{
                marginBottom: "16px",
                fontSize: "14px",
                lineHeight: 1.6,
                color: COLORS.muted,
              }}
            >
              Platforma zgodności płacowej dla polskich firm. Dyrektywa UE
              2023/970 — prosto, szybko, bezpiecznie.
            </p>
            <p style={{ fontSize: "12px", color: COLORS.muted }}>
              © 2026 GapRoll. Wszelkie prawa zastrzeżone.
            </p>
          </div>

          {/* Kolumna 2 — Produkt */}
          <nav aria-label="Produkt">
            <h4
              style={{
                marginBottom: "16px",
                fontSize: "18px",
                fontWeight: 600,
                color: COLORS.text,
              }}
            >
              Produkt
            </h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {productLinks.map(({ text, href }) => (
                <li key={href} style={{ marginBottom: "12px" }}>
                  <FooterLink href={href}>{text}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kolumna 3 — Legal & Kontakt */}
          <nav aria-label="Legal i kontakt">
            <h4
              style={{
                marginBottom: "16px",
                fontSize: "18px",
                fontWeight: 600,
                color: COLORS.text,
              }}
            >
              Legal & Kontakt
            </h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {legalLinks.map(({ text, href }) => (
                <li key={href} style={{ marginBottom: "12px" }}>
                  <FooterLink href={href}>{text}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <hr
          style={{
            marginBottom: "24px",
            border: "none",
            borderTop: `1px solid ${COLORS.border}`,
          }}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            fontSize: "14px",
            color: COLORS.muted,
          }}
        >
          <p style={{ margin: 0 }}>NIP: [po rejestracji]</p>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link
              href="#"
              style={{
                color: COLORS.muted,
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COLORS.linkHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = COLORS.muted;
              }}
            >
              LinkedIn
            </Link>
            <Link
              href="#"
              style={{
                color: COLORS.muted,
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COLORS.linkHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = COLORS.muted;
              }}
            >
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
