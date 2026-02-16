import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          deep: "#0A3A2A", // Główne tło
          card: "#0F4A36", // Karty, surface
          surface: "#134D3A", // Hover, active states
        },
        teal: {
          primary: "#14b8a6", // CTA, linki
          hover: "#0d9488", // Hover na CTA
          light: "#5eead4", // Badges, highlights
        },
        legal: {
          gold: "#F59E0B", // Compliance badges
          "gold-muted": "#D97706",
        },
        text: {
          primary: "#F1F5F9", // slate-100
          secondary: "#CBD5E1", // slate-300
          muted: "#94A3B8", // slate-400
        },
      },
      fontFamily: {
        heading: ["var(--font-lora)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
      },
      boxShadow: {
        "glow-teal": "0 0 40px -12px rgba(20, 184, 166, 0.2)",
        "glow-gold": "0 0 30px -10px rgba(245, 158, 11, 0.15)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
