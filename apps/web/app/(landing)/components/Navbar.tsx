"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [contact, setContact] = useState('');
  const [consents, setConsents] = useState({ marketing: false, rodo: false });
  const [submitted, setSubmitted] = useState(false);

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
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Image
            src="/logo.png"
            alt="GapRoll"
            width={120}
            height={36}
            style={{ objectFit: 'contain', mixBlendMode: 'screen' }}
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
            { label: 'Dyrektywa UE', href: '#dyrektywa' },
            { label: 'Funkcje', href: '#funkcje' },
            { label: 'Jak to działa', href: '#jak-dziala' },
            { label: 'Bezpieczeństwo', href: '#bezpieczenstwo' },
            { label: 'Cennik', href: '#cennik' },
            { label: 'FAQ', href: '#faq' },
            { label: 'Baza wiedzy', href: '/baza-wiedzy' },
            { label: 'Kontakt', href: '#kontakt' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{
                color: '#CBD5E1',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'color 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#CBD5E1')}
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
            onClick={() => setShowModal(true)}
            style={{
              background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.25)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '0.75rem'
            }}
          >
            Zapytaj o szczegóły
          </button>
          <Link
            href="/register"
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
              textDecoration: "none",
            }}
          >
            Rozpocznij trial
          </Link>
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
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
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
                  textDecoration: "none",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                Rozpocznij trial
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>

    {showModal ? (
      <div
        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}
      >
        <div style={{
          background: '#1E293B',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '2.5rem',
          maxWidth: '480px',
          width: '100%',
          position: 'relative'
        }}>
          <button
            onClick={() => setShowModal(false)}
            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#64748B', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
          >×</button>

          {!submitted ? (
            <>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                Zapytaj o szczegóły
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                Odezwiemy się w ciągu 24 godzin roboczych.
              </p>

              <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Służbowy adres e-mail lub numer telefonu
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="np. anna.kowalska@firma.pl lub +48 600 000 000"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px', color: '#fff', fontSize: '0.95rem',
                  outline: 'none', boxSizing: 'border-box', marginBottom: '1.5rem'
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.75rem' }}>
                {[
                  {
                    key: 'marketing' as const,
                    text: 'Wyrażam zgodę na kontakt w celach handlowych i marketingowych dotyczących usług GapRoll (e-mail, telefon). Zgodę można wycofać w każdej chwili.'
                  },
                  {
                    key: 'rodo' as const,
                    text: 'Zapoznałem/am się z Polityką Prywatności GapRoll i wyrażam zgodę na przetwarzanie moich danych osobowych w celu obsługi zapytania (RODO Art. 6 ust. 1 lit. a).'
                  }
                ].map(({ key, text }) => (
                  <label key={key} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={consents[key]}
                      onChange={(e) => setConsents(prev => ({ ...prev, [key]: e.target.checked }))}
                      style={{ marginTop: '3px', accentColor: '#FF4FA3', flexShrink: 0, width: '16px', height: '16px' }}
                    />
                    <span style={{ color: '#94A3B8', fontSize: '0.8rem', lineHeight: 1.5 }}>{text}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={() => {
                  if (contact && consents.marketing && consents.rodo) {
                    setSubmitted(true);
                  }
                }}
                disabled={!contact || !consents.marketing || !consents.rodo}
                style={{
                  width: '100%', padding: '0.875rem',
                  background: (!contact || !consents.marketing || !consents.rodo)
                    ? '#334155'
                    : 'linear-gradient(135deg, #FF4FA3, #2A7BFF)',
                  color: '#fff', fontWeight: 700, fontSize: '1rem',
                  border: 'none', borderRadius: '12px', cursor: (!contact || !consents.marketing || !consents.rodo) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Wyślij zapytanie
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.5rem' }}>Dziękujemy!</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Odezwiemy się na podany kontakt w ciągu 24 godzin roboczych.
              </p>
            </div>
          )}
        </div>
      </div>
    ) : null}
    </>
  );
}
