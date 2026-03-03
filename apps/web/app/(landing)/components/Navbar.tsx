"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import WaitlistDialog from "@/components/marketing/WaitlistDialog";

const NAV_LINKS = [
  { label: "Funkcje", id: "funkcje" },
  { label: "Cennik", id: "cennik" },
  { label: "FAQ", id: "faq" },
] as const;

const COLORS = {
  navBg: "rgba(15,23,42,0.97)",
  link: "#94A3B8",
  linkHover: "#F1F5F9",
  ctaBg: "#2A7BFF",
  accent: "#FF4FA3",
  border: "rgba(148,163,184,0.2)",
} as const;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

const MD_BREAK = 768;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MD_BREAK);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleNavClick = (id: string) => {
    setMobileOpen(false);
    scrollToSection(id);
  };

  return (
    <>
      <motion.nav
        aria-label="Main navigation"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "72px",
          background: scrolled ? COLORS.navBg : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? `1px solid ${COLORS.border}` : "1px solid transparent",
          transition: "background 0.3s, backdrop-filter 0.3s, border-color 0.3s",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <Image
              src="/logo.png"
              alt="GapRoll"
              width={120}
              height={36}
              style={{ objectFit: "contain", mixBlendMode: "screen" }}
            />
          </Link>

          {/* Desktop: center links */}
          <div
            style={{
              display: isMobile ? "none" : "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {[
              { label: "Dyrektywa UE", href: "#dyrektywa" },
              { label: "Funkcje", href: "#funkcje" },
              { label: "Jak to działa", href: "#jak-dziala" },
              { label: "Bezpieczeństwo", href: "#bezpieczenstwo" },
              { label: "Cennik", href: "#cennik" },
              { label: "FAQ", href: "#faq" },
              { label: "Baza wiedzy", href: "/baza-wiedzy" },
              { label: "Kontakt", href: "#kontakt" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: "#CBD5E1",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#CBD5E1")}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop: CTA */}
          <div
            style={{
              display: isMobile ? "none" : "flex",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => setWaitlistOpen(true)}
              style={{
                background: "transparent",
                border: "1.5px solid rgba(255,255,255,0.25)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.9rem",
                padding: "0.5rem 1.25rem",
                borderRadius: "8px",
                cursor: "pointer",
                marginRight: "0.75rem",
              }}
            >
              Umów bezpłatne demo
            </button>
            <button
              type="button"
              onClick={() => setWaitlistOpen(true)}
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                background: ctaHovered ? "rgba(42,123,255,0.85)" : COLORS.ctaBg,
                color: "#fff",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
                transition: "background 0.15s",
                border: "none",
                cursor: "pointer",
              }}
            >
              Zarezerwuj miejsce
            </button>
          </div>

          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            id="mobile-menu-button"
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "72px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: COLORS.linkHover,
              padding: 0,
              display: isMobile ? "flex" : "none",
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-menu"
              aria-labelledby="mobile-menu-button"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                overflow: "hidden",
                borderTop: `1px solid ${COLORS.border}`,
                display: isMobile ? "block" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  background: COLORS.navBg,
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  padding: "16px 24px",
                }}
              >
                {NAV_LINKS.map(({ label, id }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleNavClick(id)}
                    style={{
                      padding: "12px 8px",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: COLORS.link,
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = COLORS.linkHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = COLORS.link;
                    }}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setWaitlistOpen(true);
                  }}
                  style={{
                    marginTop: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    background: COLORS.ctaBg,
                    color: "#fff",
                    padding: "12px 20px",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  Zarezerwuj miejsce
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </>
  );
}
