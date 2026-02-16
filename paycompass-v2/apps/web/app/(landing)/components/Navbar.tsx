"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Funkcje", id: "funkcje" },
  { label: "Cennik", id: "cennik" },
  { label: "FAQ", id: "faq" },
] as const;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setMobileOpen(false);
    scrollToSection(id);
  };

  return (
    <motion.nav
      aria-label="Main navigation"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] bg-forest-deep/80 backdrop-blur-md px-6 transition-[box-shadow,border-color] duration-300 ${
        scrolled ? "border-b border-teal-primary/20 shadow-glow-teal" : ""
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading text-2xl font-semibold text-teal-primary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-primary rounded"
        >
          GapRoll
        </Link>

        {/* Desktop: center links */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {NAV_LINKS.map(({ label, id }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className="text-text-secondary transition-colors hover:text-teal-primary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-primary rounded"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Desktop: CTA */}
        <div className="hidden md:block">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-teal-primary px-5 py-2.5 text-sm font-semibold text-forest-deep transition-colors hover:bg-teal-hover outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-primary"
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
          className="flex h-[72px] w-10 items-center justify-center rounded text-text-primary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-primary md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
            className="overflow-hidden border-t border-forest-surface md:hidden"
          >
            <div className="flex flex-col gap-1 bg-forest-deep/95 px-6 py-4 backdrop-blur-md">
              {NAV_LINKS.map(({ label, id }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleNavClick(id)}
                  className="py-3 text-left text-text-secondary transition-colors hover:text-teal-primary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-primary rounded px-2"
                >
                  {label}
                </button>
              ))}
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-teal-primary px-5 py-3 text-sm font-semibold text-forest-deep transition-colors hover:bg-teal-hover outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-primary"
              >
                Rozpocznij trial
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
