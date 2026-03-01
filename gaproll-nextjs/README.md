# GapRoll Landing Page

Next.js 15 landing page dla GapRoll — platforma zgodności płacowej.

## Setup

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000)

## Struktura

- `app/page.tsx` - główna strona landing
- `app/globals.css` - style globalne (CSS variables + animations)
- `app/layout.tsx` - root layout z fontami Google (DM Sans, JetBrains Mono)
- `public/dashboard.webp` - screenshot dashboardu (185KB)

## Features

- ✅ Miami Vice palette (pink #FF6EC7 + cyan #00D4FF)
- ✅ Pricing z projektu: 99/299/799 (Compliance), 199/599/1599 (Strategia)
- ✅ Dashboard jako Next.js Image (optimized WebP)
- ✅ Intersection Observer scroll animations
- ✅ Interactive pricing segment switcher
- ✅ FAQ accordion
- ✅ Consistent typography (DM Sans + JetBrains Mono)
- ✅ Mobile responsive (needs testing)

## Build

```bash
npm run build
npm start
```

Deployment: Vercel, Netlify, or any Next.js host.

## Notes

- Image optimization requires Next.js Image component
- Fonts loaded from Google Fonts (no custom font files needed)
- All styles in page.tsx via `<style jsx global>` for single-file simplicity
- Can be refactored to separate CSS modules if needed
