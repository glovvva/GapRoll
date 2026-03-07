import type { Config } from "tailwindcss";

const config: Config = {
  // CRITICAL: darkMode via class (controlled by next-themes)
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── BRAND PRIMARIES (Pantone-matched, muted) ──────────────────
        brand: {
          pink: "#D4789C", // Pantone 225 C — Women data ONLY
          blue: "#6B9FD4", // Pantone 2382 C — Men data ONLY + CTA
          navy: "#0F1B2D", // Pantone 296 C — UI Anchor
        },
        // ── SEMANTIC / ACTION (NOT gender) ───────────────────────────
        status: {
          correct: "#5BAD7F", // Salary Correct / Zgodność
          action: "#C4934A", // Recommend Raise / Akcja
          review: "#7B6FAF", // Under Review / W toku
          alert: "#C45A5A", // Over Market / Naruszenie
        },
        // Flat keys so text-status-*, bg-status-*, border-status-* work
        "status-correct": "#5BAD7F",
        "status-action": "#C4934A",
        "status-review": "#7B6FAF",
        "status-alert": "#C45A5A",
        // ── CSS VARIABLE TOKENS ──────────────────────────────────────
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // surface/elevated/border use hex CSS vars directly (not HSL-wrapped)
        surface: "#1E293B",
        elevated: "#334155",
        border: "#334155",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        micro: "150ms",
        section: "280ms",
        load: "300ms",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
