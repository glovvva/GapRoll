'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Scale, FileText, Lock, ClipboardList,
  ArrowRight, ChevronDown, Server, Eye,
  Users, Clock, FileCheck,
  Database, Zap,
  LayoutDashboard, PieChart, GitCompare, TrendingDown,
  CheckCircle2, AlertTriangle, ShieldCheck, MapPin, BellRing
} from 'lucide-react'


// ─── Miami Vice SVG icon components ──────────────────────────────────────────
// Pink: #FF4FA3  Purple: #9B7FEA  Blue: #2A7BFF

function IconUpload() {
  return (
    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg,rgba(42,123,255,0.15),rgba(42,123,255,0.05))', border: '1px solid rgba(42,123,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '20px' }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="none">
        <defs><linearGradient id="g-upload" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2A7BFF"/><stop offset="100%" stopColor="#9B7FEA"/></linearGradient></defs>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="url(#g-upload)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="17 8 12 3 7 8" stroke="url(#g-upload)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="3" x2="12" y2="15" stroke="url(#g-upload)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function IconAnalysis() {
  return (
    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg,rgba(155,127,234,0.15),rgba(155,127,234,0.05))', border: '1px solid rgba(155,127,234,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '20px' }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="g-analysis" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#9B7FEA"/><stop offset="100%" stopColor="#FF4FA3"/></linearGradient></defs>
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="url(#g-analysis)" strokeWidth="1.5"/>
        <line x1="8" y1="17" x2="8" y2="12" stroke="url(#g-analysis)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="12" y2="8" stroke="url(#g-analysis)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="17" x2="16" y2="11" stroke="url(#g-analysis)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M6 9 l3-3 l3 3 l3-4" stroke="url(#g-analysis)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    </div>
  )
}

function IconReportReady() {
  return (
    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg,rgba(255,79,163,0.15),rgba(255,79,163,0.05))', border: '1px solid rgba(255,79,163,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '20px' }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="g-report" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF4FA3"/><stop offset="100%" stopColor="#9B7FEA"/></linearGradient></defs>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="url(#g-report)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="14 2 14 8 20 8" stroke="url(#g-report)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="9 15 11 17 15 13" stroke="url(#g-report)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

// Feature section icons
function IconChart() {
  return (
    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg,rgba(42,123,255,0.15),rgba(42,123,255,0.05))', border: '1px solid rgba(42,123,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '14px' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="g-chart" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2A7BFF"/><stop offset="100%" stopColor="#9B7FEA"/></linearGradient></defs>
        <line x1="18" y1="20" x2="18" y2="10" stroke="url(#g-chart)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="12" y1="20" x2="12" y2="4" stroke="url(#g-chart)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="6" y1="20" x2="6" y2="14" stroke="url(#g-chart)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="3" y1="20" x2="21" y2="20" stroke="#334155" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function IconScale() {
  return (
    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg,rgba(155,127,234,0.15),rgba(155,127,234,0.05))', border: '1px solid rgba(155,127,234,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '14px' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="g-scale" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#9B7FEA"/><stop offset="100%" stopColor="#FF4FA3"/></linearGradient></defs>
        <line x1="12" y1="3" x2="12" y2="20" stroke="url(#g-scale)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M5 8l7-5 7 5" stroke="url(#g-scale)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M3 14 a4 4 0 0 0 8 0 L7 8 Z" stroke="url(#g-scale)" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(155,127,234,0.1)"/>
        <path d="M13 14 a4 4 0 0 0 8 0 L17 8 Z" stroke="url(#g-scale)" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(255,79,163,0.1)"/>
        <line x1="8" y1="20" x2="16" y2="20" stroke="url(#g-scale)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function IconPerson() {
  return (
    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg,rgba(255,79,163,0.15),rgba(255,79,163,0.05))', border: '1px solid rgba(255,79,163,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '14px' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="g-person" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FF4FA3"/><stop offset="100%" stopColor="#9B7FEA"/></linearGradient></defs>
        <circle cx="12" cy="8" r="4" stroke="url(#g-person)" strokeWidth="1.5" fill="rgba(255,79,163,0.1)"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="url(#g-person)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="17" y1="13" x2="22" y2="18" stroke="url(#g-person)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="19.5" cy="15.5" r="2" stroke="url(#g-person)" strokeWidth="1.5" fill="none"/>
      </svg>
    </div>
  )
}

function IconB2B() {
  return (
    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg,rgba(42,123,255,0.12),rgba(155,127,234,0.08))', border: '1px solid rgba(42,123,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '14px' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="g-b2b" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2A7BFF"/><stop offset="100%" stopColor="#9B7FEA"/></linearGradient></defs>
        <rect x="3" y="8" width="7" height="12" rx="2" stroke="url(#g-b2b)" strokeWidth="1.5" fill="rgba(42,123,255,0.08)"/>
        <rect x="14" y="5" width="7" height="15" rx="2" stroke="url(#g-b2b)" strokeWidth="1.5" fill="rgba(155,127,234,0.08)"/>
        <path d="M10 14 h4" stroke="url(#g-b2b)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M11.5 12 l2 2 -2 2" stroke="url(#g-b2b)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function IconLock() {
  return (
    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg,rgba(255,79,163,0.12),rgba(42,123,255,0.08))', border: '1px solid rgba(255,79,163,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '14px' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="g-lock" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FF4FA3"/><stop offset="100%" stopColor="#2A7BFF"/></linearGradient></defs>
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="url(#g-lock)" strokeWidth="1.5" fill="rgba(255,79,163,0.07)"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="url(#g-lock)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1.5" fill="url(#g-lock)"/>
      </svg>
    </div>
  )
}

function IconClipboard() {
  return (
    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg,rgba(155,127,234,0.12),rgba(42,123,255,0.08))', border: '1px solid rgba(155,127,234,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '14px' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id="g-clip" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#9B7FEA"/><stop offset="100%" stopColor="#2A7BFF"/></linearGradient></defs>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="url(#g-clip)" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="url(#g-clip)" strokeWidth="1.5" fill="rgba(155,127,234,0.12)"/>
        <line x1="9" y1="12" x2="15" y2="12" stroke="url(#g-clip)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="9" y1="16" x2="13" y2="16" stroke="url(#g-clip)" strokeWidth="1.5" strokeLinecap="round"/>
        <polyline points="12 15 13.5 16.5 16 13" stroke="#9B7FEA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px', padding: '20px 0', background: 'none', border: 'none',
        cursor: 'pointer', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 500,
        fontFamily: 'var(--font-body)', textAlign: 'left',
      }}>
        <span>{q}</span>
        <span style={{ flexShrink: 0, color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms var(--ease)' }}>
          <ChevronDown size={20} />
        </span>
      </button>
      <div style={{ maxHeight: open ? '500px' : '0', overflow: 'hidden', transition: 'max-height 250ms var(--ease)' }}>
        <p style={{ paddingBottom: '20px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.75 }}>{a}</p>
      </div>
    </div>
  )
}

// ─── Icon image component ─────────────────────────────────────────────────────
function FeatureIcon({ src, alt, size = 56 }: { src: string; alt: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '12px', overflow: 'hidden', flexShrink: 0, marginBottom: '16px' }}>
      <Image src={src} alt={alt} width={size} height={size} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
// FIX #1: Kolejność zmieniona — Strategia first (wyróżniony), Compliance second
// FIX #8: Strategia jako "najpopularniejszy" (domyślnie aktywny)
const plans = {
  strategia: {
    name: 'Strategia',
    tagline: 'Oszczędza 3 tygodnie rocznie · ROI 360%',
    prices: { small: 199, medium: 499, large: 999 },
    badge: 'Najpopularniejszy',
    badgeColor: '#FF4FA3',
    features: [
      { text: 'Wszystko z planu Compliance, plus:', cite: '' },
      { text: 'Analiza Przyczyn Luki — dlaczego gap wynosi X%', cite: 'Art. 10' },
      { text: 'Przegląd Wynagrodzeń — workflow 5 menedżerów', cite: 'Art. 10 ust. 3' },
      { text: 'Kalkulator ROI retencji pracowników', cite: '' },
      { text: 'Optymalizator Budżetowy — scenariusze budżetowe', cite: '' }, // FIX #3: Solio → Optymalizator
      { text: 'Benchmark rynkowy stanowisk (GUS/PARP)', cite: '' },
    ],
    // FIX #7: Wyróżniony przycisk dla Strategia — gradient pink
    cta: 'Zacznij z Strategia',
    ctaStyle: {
      background: 'linear-gradient(135deg, #FF4FA3 0%, #9B7FEA 100%)',
      boxShadow: '0 4px 20px rgba(255,79,163,0.35)',
    },
  },
  compliance: {
    name: 'Compliance',
    tagline: 'Spełnia wszystkie wymogi prawne Art. 9 i 16',
    prices: { small: 99, medium: 299, large: 599 },
    badge: 'Obowiązkowy',
    badgeColor: '#2A7BFF',
    features: [
      { text: 'Raport Art. 16 (analiza kwartylowa luki płacowej)', cite: 'Art. 9 ust. 1' },
      { text: 'Wartościowanie stanowisk EVG + korekta ręczna', cite: 'Art. 4' },
      { text: 'Raporty dla pracowników na żądanie', cite: 'Art. 7' },
      { text: 'Ekwiwalent B2B (UoP↔B2B, stawki ZUS 2026)', cite: 'Art. 2 ust. 1' },
      { text: 'Ochrona RODO — maskowanie N<3, audit trail', cite: 'RODO Art. 5' },
      { text: 'Eksport PDF gotowy do złożenia w PIP', cite: 'Art. 9 ust. 2' },
      { text: '14 dni bezpłatnego trialu — pełny dostęp', cite: '' },
    ],
    cta: 'Rozpocznij bezpłatny trial',
    ctaStyle: {
      background: '#2A7BFF',
      boxShadow: '0 4px 16px rgba(42,123,255,0.3)',
    },
  },
} as const

const sizes = [
  { key: 'small', label: 'Małe (50–149 os.)' },
  { key: 'medium', label: 'Średnie (150–499 os.)' },
  { key: 'large', label: 'Duże (500+ os.)' },
]

const features = [
  {
    iconComp: <IconChart />,
    title: 'Raport Art. 16',
    desc: 'Pełna analiza kwartylowa luki płacowej: mediana kobiet i mężczyzn, luka składnikowa (podstawowe + zmienne), rozkład w 4 kwartylach. PDF gotowy dla PIP.',
    cite: 'Art. 9 ust. 1 lit. a–g',
  },
  {
    iconComp: <IconScale />,
    title: 'Wartościowanie Stanowisk (EVG)',
    desc: 'Metodologia Art. 4 w 4 wymiarach: Umiejętności, Wysiłek, Odpowiedzialność, Warunki pracy. Silnik EVG wartościuje stanowiska — AI propozycja + obowiązkowa korekta ręczna.',
    cite: 'Art. 4 Dyrektywy',
  },
  {
    iconComp: <IconPerson />,
    title: 'Raporty dla Pracowników',
    desc: 'Art. 7: każdy pracownik ma prawo zapytać o swoją pozycję płacową. Termin odpowiedzi: 2 miesiące. GapRoll generuje raport porównawczy automatycznie — bez godzin w Excelu.',
    cite: 'Art. 7 ust. 4',
  },
  {
    iconComp: <IconB2B />,
    title: 'Ekwiwalent B2B',
    desc: 'Polska specyfika: normalizacja UoP↔B2B ze składkami ZUS 2026, kosztami uzyskania przychodu i brutto/netto. Pierwsza platforma obsługująca ten wymóg.',
    cite: 'Art. 2 ust. 1 lit. c',
  },
  {
    iconComp: <IconLock />,
    title: 'Ochrona RODO',
    desc: 'Automatyczne maskowanie danych gdy grupa liczy mniej niż 3 osoby. PII (imię, PESEL) nigdy nie trafia do AI. Każda operacja logowana z timestampem.',
    cite: 'RODO Art. 5 ust. 1 lit. e',
  },
  {
    iconComp: <IconClipboard />,
    title: 'Ślad Audytowy',
    desc: 'Każda zmiana wynagrodzenia i korekta EVG zapisana z: datą, autorem, poprzednią wartością, uzasadnieniem. Niezbędne przy kontroli PIP lub postępowaniu sądowym.',
    cite: 'Art. 18 Dyrektywy',
  },
]

const securityItems = [
  { img: '/icons/shield_mioffice.webp', icon: <Server size={20} />, title: 'Serwery UE — Frankfurt, Niemcy', desc: 'Hetzner Cloud DE. Dane pracownicze nigdy nie opuszczają EOG. Gwarancja suwerenności danych zgodna z RODO Art. 44 i ISO 27001.' },
  { img: '/icons/data_privacy_mioffice.webp', icon: <Lock size={20} />, title: 'Szyfrowanie end-to-end', desc: 'Dane w spoczynku: AES-256-GCM. Dane w transmisji: TLS 1.3. Szyfrowanie end-to-end — od Twojego CSV do raportu PDF.' },
  { img: '/icons/shield_mioffice.webp', icon: <Eye size={20} />, title: 'Zero Data Retention (AI)', desc: 'OpenAI Zero Data Retention Policy: dane AI nie są przechowywane ani używane do trenowania modeli. PESEL i imię nigdy nie trafiają do silnika AI.' },
  { img: '/icons/data_privacy_mioffice.webp', icon: <Database size={20} />, title: 'Izolacja danych (RLS)', desc: 'Row-Level Security (Supabase). Każda organizacja widzi wyłącznie swoje dane. Partner widzi klientów, klient widzi tylko swoje dane.' },
  { img: '/icons/shield_mioffice.webp', icon: <ClipboardList size={20} />, title: 'Retencja 3 lata + ISO 27001', desc: 'Dane przechowywane 3 lata (wymóg audytu PIP). Zgodność z ISO 27001 i RODO. Automatyczne usuwanie po upływie okresu retencji.' },
  { img: '/icons/data_privacy_mioffice.webp', icon: <ShieldCheck size={20} />, title: 'DPA na żądanie', desc: 'Data Processing Agreement (umowa powierzenia danych) dostępna na żądanie. Jesteśmy procesorem danych — RODO Art. 28.' },
]

const faqData = [
  { q: 'Kogo obowiązuje Dyrektywa UE 2023/970 i kiedy?', a: 'Pracodawcy z 250+ pracownikami: obowiązek od 7 czerwca 2027 r. za rok 2026. Pracodawcy z 150–249 pracownikami: co 3 lata od 7 czerwca 2027 r. Pracodawcy z 50–149 pracownikami: co 3 lata od 7 czerwca 2031 r. Jednak wartościowanie stanowisk EVG (Art. 4) i prawo pracownika do raportu porównawczego (Art. 7) obowiązują WSZYSTKICH pracodawców bez względu na rozmiar.' },
  { q: 'Co musi zawierać Raport Art. 16?', a: 'Raport (na podstawie Art. 9 Dyrektywy) zawiera: (a) lukę płacową ze względu na płeć, (b) lukę w składnikach zmiennych, (c) medianą luki, (d) medianą luki w składnikach zmiennych, (e) odsetek pracowników danej płci w składnikach zmiennych, (f) odsetek pracowników każdej płci w każdym kwartylu, (g) lukę w podziale na kategorie pracowników. GapRoll generuje ten raport w PDF z cytacjami prawnymi w mniej niż 15 minut.' },
  { q: 'Na czym polega jawność wynagrodzeń (Art. 7)?', a: 'Art. 7 przyznaje każdemu pracownikowi prawo do informacji o wynagrodzeniu pracowników wykonujących pracę o równej wartości (w podziale na płeć). Pracodawca musi odpowiedzieć w ciągu 2 miesięcy (Art. 7 ust. 4). Art. 5 nakłada obowiązek podawania przedziału wynagrodzenia w ogłoszeniach. Pracownicy nie mogą być objęci klauzulami poufności wynagrodzenia (Art. 7 ust. 5). GapRoll automatyzuje odpowiedzi na wnioski Art. 7.' },
  { q: 'Czym jest Wartościowanie Stanowisk EVG i dlaczego jest obowiązkowe?', a: 'EVG (Equal Value of Work) to metodologia wymagana przez Art. 4 Dyrektywy. 4 wymiary oceny: Umiejętności i kwalifikacje, Wysiłek (fizyczny i umysłowy), Odpowiedzialność, Warunki pracy. Bez EVG nie możesz odpowiedzieć na wniosek Art. 7 — to naruszenie Dyrektywy. GapRoll: AI scoring + obowiązkowa korekta ręczna (EU AI Act Art. 14: Human-In-The-Loop).' },
  { q: 'Czy dane pracowników są bezpieczne i zgodne z RODO?', a: 'Tak. Dane przetwarzane wyłącznie na serwerach Hetzner Cloud w Niemczech (Frankfurt). Podstawa prawna: Art. 6 ust. 1 lit. c RODO (obowiązek prawny). Automatyczne maskowanie danych przy N<3. PESEL i imię nigdy nie trafiają do AI (Zero Data Retention). Retencja 3 lata. DPA dostępna na żądanie. Zgodność z ISO 27001.' },
  { q: 'Jakie sankcje grożą za brak raportu?', a: 'Według projektu ustawy implementacyjnej: grzywny do 30 000 PLN za każdy miesiąc opóźnienia. PIP otrzymuje nowe uprawnienia kontrolne. Domniemanie dyskryminacji w postępowaniach sądowych — ciężar dowodu przeniesiony na pracodawcę (Art. 18). Zbiorowe dochodzenie roszczeń przez pracowników (Art. 19). Termin implementacji: 7 czerwca 2026.' },
  { q: 'Jak GapRoll obsługuje umowy B2B?', a: 'B2B Equalizer: automatyczna normalizacja UoP↔B2B ze składkami ZUS 2026, kosztami uzyskania przychodu (KUP) i różnicą brutto/netto. Dyrektywa 2023/970 obejmuje pracowników i "osoby pracujące" — zdefiniowane szerzej niż tylko umowa o pracę (Art. 2 ust. 1 lit. c).' },
]

// ─── Brand colors (only pink/blue/navy — FIX #13) ─────────────────────────────
// FIX #13: No green, amber, teal — only #FF4FA3 pink, #2A7BFF blue, their tints
const C = {
  pink: '#FF4FA3',
  pinkLight: '#FF80BF', // pastel pink
  pinkDim: 'rgba(255,79,163,0.15)',
  blue: '#2A7BFF',
  blueLight: '#60A5FA',
  blueDim: 'rgba(42,123,255,0.12)',
  navy: '#0F172A',
  surface: '#1E293B',
  border: '#334155',
  t1: '#F1F5F9',
  t2: '#CBD5E1',
  tm: '#94A3B8',
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useReveal()
  // FIX #8: Strategia as default selected plan
  const [activePlan, setActivePlan] = useState<'strategia' | 'compliance'>('strategia')
  const [activeSize, setActiveSize] = useState<'small' | 'medium' | 'large'>('small')
  const [navScrolled, setNavScrolled] = useState(false)

  // FIX #2: Hydration fix — useEffect only, no SSR mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    const handler = () => setNavScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const plan = plans[activePlan]
  const price = plan.prices[activeSize]

  // FIX #5: CTA "Umów bezpłatne demo" in navbar
  // FIX #12: KPI stats in pink/blue only
  // FIX #13: All green replaced with pink or blue tints

  const cardBase: React.CSSProperties = {
    padding: '26px 24px', borderRadius: '12px',
    background: C.surface, border: `1px solid ${C.border}`,
    transition: 'border-color 150ms, box-shadow 150ms, transform 150ms',
    cursor: 'default',
  }

  return (
    <>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #FF4FA3 0%, #9B7FEA 50%, #2A7BFF 100%)' }} />

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: mounted && navScrolled ? 'rgba(15,23,42,0.97)' : 'transparent',
        backdropFilter: mounted && navScrolled ? 'blur(16px)' : 'none',
        borderBottom: mounted && navScrolled ? `1px solid ${C.border}` : '1px solid transparent',
        transition: 'all 200ms',
        padding: '0 32px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* FIX #11: Real logo image */}
          <a href="#" aria-label="GapRoll">
            <Image src="/logo.png" alt="GapRoll" width={140} height={36} style={{ height: '42px', width: 'auto' }} priority />
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {[['#jak-dziala','Jak działa'],['#funkcje','Funkcje'],['#bezpieczenstwo','Bezpieczeństwo'],['#cennik','Cennik'],['#faq','FAQ']].map(([href,label]) => (
              <a key={href} href={href} style={{ fontSize: '14px', fontWeight: 500, color: C.tm, transition: 'color 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.color = C.t1)}
                onMouseLeave={e => (e.currentTarget.style.color = C.tm)}
              >{label}</a>
            ))}
          </div>
          {/* FIX #5: "Umów bezpłatne demo" */}
          <a href="#cennik" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 22px', borderRadius: '8px', background: C.blue,
            color: '#fff', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)',
            transition: 'all 150ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(42,123,255,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            Umów bezpłatne demo <ArrowRight size={14} />
          </a>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '88px 32px 72px', background: C.navy }}>
        <div style={{ position: 'absolute', top: '-160px', left: '38%', width: '900px', height: '700px', background: `radial-gradient(ellipse, ${C.blueDim} 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '72px', alignItems: 'center' }}>
          {/* Left */}
          <div>
            <div className="reveal" style={{ marginBottom: '28px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '20px', border: `1px solid rgba(42,123,255,0.3)`, background: C.blueDim, fontSize: '12px', fontWeight: 600, color: C.blueLight }}>
                🇪🇺 Dyrektywa UE 2023/970 · Termin: 7 czerwca 2026
              </span>
            </div>
            <h1 className="reveal" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,4.2vw,48px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', color: C.t1, marginBottom: '22px' }}>
              Zamknij lukę płacową{' '}
              <span style={{ background: 'linear-gradient(90deg,#FF4FA3 0%,#9B7FEA 50%,#2A7BFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>raz na zawsze.</span>
            </h1>
            <p className="reveal delay-1" style={{ fontSize: '18px', lineHeight: 1.65, color: C.t2, marginBottom: '12px', maxWidth: '500px' }}>
              Pełna zgodność z Dyrektywą UE 2023/970 za <strong style={{ color: C.t1 }}>99 PLN/mies</strong>. Raport Art.&nbsp;16 gotowy w 15 minut. Dane wyłącznie na serwerach UE.
            </p>
            <div className="reveal delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
              {[
                { text: '98% taniej niż zachodnie alternatywy (€1 100/mies vs 99 PLN/mies)', color: C.pink },
                { text: 'Szyfrowanie AES-256 · serwery Hetzner Frankfurt · Zero Data Retention AI', color: C.blue },
                // FIX #13: amber → pink for warning bullet
                { text: 'Kary do 30 000 PLN/mies za brak raportu — termin: 7 czerwca 2026', color: C.pinkLight },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ flexShrink: 0, marginTop: '2px', color: item.color }}><CheckCircle2 size={16} /></span>
                  <span style={{ fontSize: '14px', color: C.t2, lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="reveal delay-2" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="#cennik" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 30px', borderRadius: '8px', background: 'linear-gradient(135deg,#2A7BFF,#9B7FEA)', color: '#fff', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-body)', boxShadow: '0 4px 16px rgba(42,123,255,0.28)', transition: 'all 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(42,123,255,0.42)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(42,123,255,0.28)' }}
              >Sprawdź dysproporcje płac <ArrowRight size={15} /></a>
              <a href="#jak-dziala" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '13px 24px', borderRadius: '8px', border: `1px solid ${C.border}`, color: C.t2, fontSize: '15px', fontWeight: 500, transition: 'all 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.t1 }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.t2 }}
              >Jak to działa?</a>
            </div>

            {/* FIX #12: KPI numbers — pink/blue only, no green/amber */}
            <div className="reveal delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', marginTop: '36px', paddingTop: '28px', borderTop: `1px solid ${C.border}` }}>
              {[
                { val: '7 cze 2026', label: 'Termin implementacji', color: C.pinkLight },
                { val: '95%', label: 'firm nie spełnia wymogów', color: C.pink },
                { val: '15 min', label: 'Raport Art. 16 w GapRoll', color: C.blueLight },
                { val: '98%', label: 'taniej niż zachodnie SaaS', color: C.blue },
              ].map(({ val, label, color }) => (
                <div key={val}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900, color, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{val}</div>
                  <div style={{ fontSize: '11px', color: C.tm, marginTop: '4px', lineHeight: 1.4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — dashboard */}
          <div className="reveal delay-1" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '-20px', background: `radial-gradient(ellipse, ${C.blueDim} 0%, transparent 70%)`, borderRadius: '24px', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: '0 24px 72px rgba(0,0,0,0.5)' }}>
              <Image src="/dashboard.png" alt="GapRoll Dashboard — analiza luki płacowej Art. 16" width={1456} height={816} style={{ width: '100%', height: 'auto', display: 'block' }} priority />
            </div>
            <div style={{ position: 'absolute', bottom: '-14px', left: '20px', padding: '10px 16px', borderRadius: '10px', background: C.surface, border: `1px solid ${C.border}`, boxShadow: '0 8px 28px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* FIX #13: dot pink instead of green */}
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.pink, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: C.t1 }}>Raport Art. 16 — zgodny</div>
                <div style={{ fontSize: '11px', color: C.tm }}>Gotowy do złożenia w PIP</div>
              </div>
            </div>
            <div style={{ position: 'absolute', top: '-14px', right: '20px', padding: '8px 14px', borderRadius: '10px', background: C.surface, border: `1px solid ${C.border}`, boxShadow: '0 8px 28px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={14} color={C.blue} />
              <span style={{ fontSize: '12px', fontWeight: 500, color: C.t2 }}>Dane na serwerach UE</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ JAK DZIAŁA — 3 kroki ══ */}
      <section id="jak-dziala" style={{ padding: '96px 32px', background: C.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: C.blue, marginBottom: '14px' }}>Przejrzystość to decyzja strategiczna.</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3vw,38px)', fontWeight: 900, letterSpacing: '-0.025em', color: C.t1 }}>Raport Art. 16 w trzech krokach</h2>
            <p style={{ fontSize: '16px', color: C.t2, marginTop: '14px', maxWidth: '520px', margin: '14px auto 0', lineHeight: 1.65 }}>Od pliku CSV do raportu gotowego dla Państwowej Inspekcji Pracy — w mniej niż kwadrans.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '28px' }}>
            {[
              { iconComp: <IconUpload />, color: C.blue, colorDim: C.blueDim,
                num: '01', title: 'Wgraj dane CSV',
                desc: 'Importujesz plik CSV z danymi płacowymi. Obsługujemy separator `;` (polski standard). Kreator mapowania kolumn prowadzi krok po kroku — bez wiedzy technicznej.',
                note: 'Min. 4 kolumny: ID, wynagrodzenie, płeć, okres', cite: 'Art. 9 ust. 1' },
              { iconComp: <IconAnalysis />, color: '#9B7FEA', colorDim: 'rgba(155,127,234,0.12)',
                num: '02', title: 'Automatyczna analiza EVG',
                desc: 'Silnik AI wartościuje stanowiska w 4 wymiarach (Art. 4), oblicza lukę płacową mediany, analizuje kwartyle (Art. 16). Każdy wynik możesz edytować ręcznie — Ty jesteś ekspertem, AI to propozycja.',
                note: 'Wyniki w mniej niż 15 minut', cite: 'Art. 4 + Art. 16' },
              { iconComp: <IconReportReady />, color: C.pink, colorDim: C.pinkDim,
                num: '03', title: 'Raport gotowy do PIP',
                desc: 'Generujesz Raport Art. 16 w formacie PDF z pełnymi cytacjami prawnymi. Jeden klik — archiwum audytowe zapisane automatycznie. Gotowe do złożenia w Państwowej Inspekcji Pracy.',
                note: 'Eksport PDF + ślad audytowy', cite: 'Art. 9 ust. 2' },
            ].map((step, i) => (
              <div key={i} className={`reveal delay-${i}`} style={{ ...cardBase, background: C.navy, position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = step.color; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '56px', fontWeight: 900, color: step.color, opacity: 0.22, position: 'absolute', top: '10px', right: '16px', lineHeight: 1, letterSpacing: '-0.04em', userSelect: 'none' }}>{step.num}</div>
                {step.iconComp}
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: C.t1, marginBottom: '10px', letterSpacing: '-0.01em' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: C.t2, lineHeight: 1.7, marginBottom: '16px' }}>{step.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', background: step.colorDim, color: step.color, fontSize: '12px', fontWeight: 500 }}>
                    <CheckCircle2 size={12} /> {step.note}
                  </span>
                  <span className="citation">{step.cite}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FUNKCJE ══ */}
      <section id="funkcje" style={{ padding: '96px 32px', background: C.navy }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: C.pink, marginBottom: '14px' }}>Regulacja to minimum. Dane to przewaga.</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3vw,38px)', fontWeight: 900, letterSpacing: '-0.025em', color: C.t1 }}>Wszystko, czego wymaga Dyrektywa</h2>
            <p style={{ fontSize: '16px', color: C.t2, marginTop: '14px', maxWidth: '540px', margin: '14px auto 0', lineHeight: 1.65 }}>Każda funkcja zmapowana do konkretnego artykułu Dyrektywy 2023/970.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '40px' }}>
            {features.map((f, i) => (
              <div key={i} className={`reveal delay-${i % 3}`} style={cardBase}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(42,123,255,0.4)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
              >
                {f.iconComp}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: C.t1, letterSpacing: '-0.01em' }}>{f.title}</h3>
                  <span className="citation">{f.cite}</span>
                </div>
                <p style={{ fontSize: '13px', color: C.t2, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Dashboard features strip */}
          <div className="reveal" style={{ padding: '32px 36px', borderRadius: '12px', background: C.surface, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.blue}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <LayoutDashboard size={18} color={C.blue} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: C.t1, letterSpacing: '-0.01em' }}>Co widzisz na dashboardzie</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '24px' }}>
              {[
                { icon: <LayoutDashboard size={18} />, title: 'Pulpit zgodności', desc: 'Aktualny status Art. 16: luka%, kwartyle, termin kolejnego raportu. Jeden widok — wszystko dla zarządu.' },
                { icon: <PieChart size={18} />, title: 'Linia Fair Pay', desc: 'Wykres regresji płac: każdy punkt to pracownik. Odchylenia od linii = kandydaci do korekty. Wizualny argument dla HR.' },
                { icon: <Users size={18} />, title: 'Grupy EVG', desc: 'Porównanie wynagrodzeń wewnątrz grup stanowisk o tej samej wartości pracy. Kluczowe dla Art. 4.' },
                { icon: <TrendingDown size={18} />, title: 'Trend rok do roku', desc: 'Czy luka maleje? Porównanie okresów raportowania — fundament dla strategii wyrównania.' },
              ].map((d, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ color: C.blue }}>{d.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: C.t1 }}>{d.title}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: C.tm, lineHeight: 1.6 }}>{d.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="reveal" style={{ marginTop: '28px', padding: '24px 28px', borderRadius: '12px', background: C.blueDim, border: `1px solid rgba(42,123,255,0.15)` }}>
            <p style={{ fontSize: '14px', color: C.t2, lineHeight: 1.75, fontStyle: 'italic' }}>„Transparentność wynagrodzeń zwiększa retencję talentów o 30% i zmniejsza lukę płacową w ciągu 3 lat o średnio 8 punktów procentowych."</p>
            <p style={{ fontSize: '12px', color: C.tm, marginTop: '8px' }}>Harvard Business Review, 2024 · Pay Transparency and Its Effects on Gender Equity</p>
          </div>
        </div>
      </section>

      {/* ══ JAWNOŚĆ PŁAC — Art. 7 ══ */}
      <section style={{ padding: '96px 32px', background: C.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '72px', alignItems: 'center' }}>
            <div>
              <div className="reveal" style={{ marginBottom: '14px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', border: `1px solid ${C.pinkDim}`, background: C.pinkDim, fontSize: '12px', fontWeight: 600, color: C.pink }}>
                  <FileText size={12} /> Art. 7 Dyrektywy
                </span>
              </div>
              <h2 className="reveal" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 900, letterSpacing: '-0.025em', color: C.t1, marginBottom: '16px' }}>
                Jawność płac jako standard.<br/>
                <span style={{ background: 'linear-gradient(90deg,#FF4FA3,#2A7BFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Nie jako zagrożenie.</span>
              </h2>
              <p className="reveal" style={{ fontSize: '16px', color: C.t2, lineHeight: 1.7, marginBottom: '28px' }}>
                Art. 7 Dyrektywy przyznaje każdemu pracownikowi prawo do informacji o wynagrodzeniu pracowników wykonujących pracę o równej wartości. Pracodawca ma <strong style={{ color: C.t1 }}>2 miesiące</strong> na odpowiedź. Bez odpowiedzi — naruszenie Dyrektywy.
              </p>
              <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { icon: <Users size={16} />, text: 'Każdy pracownik może złożyć wniosek o raport porównawczy' },
                  { icon: <Clock size={16} />, text: '2 miesiące na odpowiedź — Art. 7 ust. 4 Dyrektywy 2023/970' },
                  { icon: <Lock size={16} />, text: 'Zakaz klauzul poufności wynagrodzenia — Art. 7 ust. 5' },
                  { icon: <FileCheck size={16} />, text: 'GapRoll generuje raport Art. 7 automatycznie — jedno kliknięcie' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ flexShrink: 0, width: '30px', height: '30px', background: C.pinkDim, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.pink, marginTop: '1px' }}>{item.icon}</span>
                    <span style={{ fontSize: '14px', color: C.t2, lineHeight: 1.55 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Mock Art. 7 card */}
            <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '24px', borderRadius: '12px', background: C.navy, border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#FF4FA3,#9B7FEA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>A</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: C.t1 }}>Anna Wiśniewska</div>
                    <div style={{ fontSize: '11px', color: C.tm }}>Wniosek Art. 7 · 12 lut 2026</div>
                  </div>
                  {/* FIX #13: amber → pink */}
                  <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: '20px', background: C.pinkDim, color: C.pinkLight, fontSize: '11px', fontWeight: 600 }}>Oczekuje odpowiedzi</span>
                </div>
                <p style={{ fontSize: '13px', color: C.t2, lineHeight: 1.65, marginBottom: '16px' }}>„Proszę o informację o średnim wynagrodzeniu pracowników na stanowisku Senior Developer (Dział IT) w podziale na płeć, za rok 2025."</p>
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: C.blueDim, border: `1px solid rgba(42,123,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: C.blueLight }}>Termin odpowiedzi: 12 kwi 2026</span>
                  {/* FIX #13: amber → pink */}
                  <span style={{ fontSize: '12px', fontWeight: 600, color: C.pinkLight }}>58 dni pozostało</span>
                </div>
              </div>
              <div style={{ padding: '16px 20px', borderRadius: '10px', background: C.blueDim, border: `1px solid rgba(42,123,255,0.2)`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* FIX #13: blue check instead of green */}
                <CheckCircle2 size={20} color={C.blue} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: C.t1 }}>Raport Art. 7 — wygenerowany automatycznie</div>
                  <div style={{ fontSize: '12px', color: C.tm }}>GapRoll · 45 sekund · Senior Developer (IT) · 2025</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MAPOWANIE STANOWISK — NEW SECTION #14 ══ */}
      <section style={{ padding: '96px 32px', background: C.navy }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '72px', alignItems: 'center' }}>
            {/* Right (visual first) */}
            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Developer Senior', group: 'G4', score: 82, pinkBar: 55, blueBar: 80 },
                { label: 'Analityk Danych', group: 'G3', score: 71, pinkBar: 68, blueBar: 71 },
                { label: 'Specjalista HR', group: 'G2', score: 58, pinkBar: 58, blueBar: 62 },
                { label: 'Project Manager', group: 'G4', score: 79, pinkBar: 72, blueBar: 79 },
              ].map((item, i) => (
                <div key={i} style={{ padding: '16px', borderRadius: '10px', background: C.surface, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: C.t1, marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '20px', background: C.blueDim, color: C.blueLight, fontSize: '11px', fontWeight: 600, marginBottom: '10px' }}>{item.group}</div>
                  <div style={{ fontSize: '11px', color: C.tm, marginBottom: '4px' }}>EVG Score: {item.score}/100</div>
                  <div style={{ height: '4px', borderRadius: '2px', background: C.border, marginBottom: '4px' }}>
                    <div style={{ height: '100%', width: `${item.blueBar}%`, borderRadius: '2px', background: C.blue }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: C.tm }}>
                    <span style={{ color: C.pink }}>K: {item.pinkBar}%</span>
                    <span style={{ color: C.blue }}>M: {item.blueBar}%</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Left */}
            <div>
              <div className="reveal" style={{ marginBottom: '14px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', border: `1px solid rgba(42,123,255,0.3)`, background: C.blueDim, fontSize: '12px', fontWeight: 600, color: C.blueLight }}>
                  <MapPin size={12} /> Art. 4 Dyrektywy
                </span>
              </div>
              <h2 className="reveal" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 900, letterSpacing: '-0.025em', color: C.t1, marginBottom: '16px' }}>
                Mapowanie stanowisk i praca o równej wartości
              </h2>
              <p className="reveal" style={{ fontSize: '16px', color: C.t2, lineHeight: 1.7, marginBottom: '28px' }}>
                Zdefiniuj sprawiedliwą strukturę dzięki inteligentnemu kreatorowi mapowania. Przypisz stanowiska do grup zaszeregowania w oparciu o obiektywne kryteria.
              </p>
              <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { icon: <Zap size={16} />, text: 'Kreator grup zaszeregowania — prowadzi krok po kroku' },
                  { icon: <Scale size={16} />, text: 'Analiza porównawcza wartości pracy (Work Value Assessment)' },
                  { icon: <BellRing size={16} />, text: 'Automatyczne alerty o rozbieżnościach wewnątrz grupy' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ flexShrink: 0, width: '30px', height: '30px', background: C.blueDim, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue, marginTop: '1px' }}>{item.icon}</span>
                    <span style={{ fontSize: '14px', color: C.t2, lineHeight: 1.55 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ BEZPIECZEŃSTWO DANYCH ══ */}
      <section id="bezpieczenstwo" style={{ padding: '96px 32px', background: C.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
            {/* FIX #14: copy z briefu */}
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: C.blue, marginBottom: '14px' }}>Twoje dane kadrowo-płacowe nigdy nie opuszczają infrastruktury bez zgody.</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3vw,38px)', fontWeight: 900, letterSpacing: '-0.025em', color: C.t1 }}>Bezpieczeństwo danych i suwerenność cyfrowa</h2>
            <p style={{ fontSize: '16px', color: C.t2, marginTop: '14px', maxWidth: '540px', margin: '14px auto 0', lineHeight: 1.65 }}>
              Gwarantujemy pełną suwerenność danych. Lokalne przetwarzanie w chmurze UE, zgodność z RODO i standardami ISO 27001.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '40px' }}>
            {securityItems.map((item, i) => (
              <div key={i} className={`reveal delay-${i % 3}`} style={cardBase}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(42,123,255,0.4)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
                  <Image src={item.img} alt={item.title} width={48} height={48} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: C.t1, letterSpacing: '-0.01em', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: C.t2, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          {/* RODO compliance strip */}
          <div className="reveal" style={{ padding: '28px 32px', borderRadius: '12px', background: C.blueDim, border: `1px solid rgba(42,123,255,0.2)`, borderLeft: `4px solid ${C.blue}`, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '24px' }}>
            {[
              { label: 'Podstawa prawna', val: 'Art. 6 ust. 1 lit. c RODO', sub: 'Obowiązek prawny' },
              { label: 'Lokalizacja danych', val: 'Frankfurt, Niemcy', sub: 'Hetzner Cloud DE' },
              { label: 'Szyfrowanie', val: 'AES-256 + TLS 1.3', sub: 'End-to-end' },
              { label: 'Standard', val: 'ISO 27001 + RODO', sub: 'Retencja: 3 lata' },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.tm, marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: C.t1, marginBottom: '2px' }}>{item.val}</div>
                <div style={{ fontSize: '12px', color: C.tm }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CENNIK ══ */}
      <section id="cennik" style={{ padding: '96px 32px', background: C.navy }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: C.blue, marginBottom: '14px' }}>Transparentność to decyzja strategiczna.</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3vw,38px)', fontWeight: 900, letterSpacing: '-0.025em', color: C.t1, marginBottom: '12px' }}>Prosta, uczciwa wycena</h2>
            <p style={{ fontSize: '15px', color: C.t2 }}>Bez ukrytych opłat. Bez rocznych zobowiązań. Anuluj w każdej chwili.</p>
          </div>

          {/* FIX #8: Strategia first (left), then Compliance */}
          {/* Plan toggle */}
          <div className="reveal" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            {(['strategia','compliance'] as const).map(p => (
              <button key={p} onClick={() => setActivePlan(p)} style={{
                padding: '10px 28px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-body)',
                // FIX #7: Strategia button — pink gradient, Compliance — blue
                background: activePlan === p ? (p === 'strategia' ? 'linear-gradient(135deg,#FF4FA3,#9B7FEA)' : C.blue) : 'transparent',
                color: activePlan === p ? '#fff' : C.tm,
                border: activePlan === p ? 'none' : `1px solid ${C.border}`,
                transition: 'all 150ms',
              }}>
                {p === 'strategia' ? 'Strategia ★' : 'Compliance'}
              </button>
            ))}
          </div>

          {/* Size selector */}
          <div className="reveal" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
            {sizes.map(s => (
              <button key={s.key} onClick={() => setActiveSize(s.key as any)} style={{
                padding: '6px 18px', borderRadius: '20px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-body)',
                background: activeSize === s.key ? C.blueDim : 'transparent',
                color: activeSize === s.key ? C.blueLight : C.tm,
                border: activeSize === s.key ? `1px solid rgba(42,123,255,0.3)` : '1px solid transparent',
                transition: 'all 150ms',
              }}>{s.label}</button>
            ))}
          </div>

          {/* Card */}
          <div className="reveal" style={{
            padding: '44px 52px', borderRadius: '16px', background: C.surface,
            border: `1px solid ${activePlan === 'strategia' ? 'rgba(255,79,163,0.4)' : 'rgba(42,123,255,0.35)'}`,
            boxShadow: activePlan === 'strategia' ? '0 0 48px rgba(255,79,163,0.1)' : '0 0 48px rgba(42,123,255,0.08)',
            transition: 'border-color 200ms, box-shadow 200ms',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '52px', alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.02em', color: C.t1 }}>{plan.name}</h3>
                  <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: activePlan === 'strategia' ? C.pinkDim : C.blueDim, color: plan.badgeColor }}>{plan.badge}</span>
                </div>
                <p style={{ fontSize: '14px', color: C.tm, marginBottom: '28px' }}>{plan.tagline}</p>
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 900, letterSpacing: '-0.04em', color: C.t1 }}>{price}</span>
                    <span style={{ fontSize: '18px', color: C.tm, fontWeight: 600 }}>PLN</span>
                    <span style={{ fontSize: '14px', color: C.tm }}>/mies</span>
                  </div>
                  <p style={{ fontSize: '12px', color: C.tm, marginTop: '4px' }}>netto + VAT · bez zobowiązań</p>
                </div>
                {/* FIX #7: different style for Strategia CTA */}
                <a href="#" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', padding: '14px 0', borderRadius: '8px', ...plan.ctaStyle, color: '#fff', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all 150ms' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
                >{plan.cta} <ArrowRight size={15} /></a>
                <p style={{ fontSize: '11px', color: C.tm, textAlign: 'center', marginTop: '10px' }}>14 dni bezpłatnego trialu · bez karty kredytowej</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.tm, marginBottom: '18px' }}>Zawiera</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <CheckCircle2 size={16} color={activePlan === 'strategia' ? C.pink : C.blue} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px', flex: 1 }}>
                        <span style={{ fontSize: '14px', color: C.t2, lineHeight: 1.4 }}>{f.text}</span>
                        {f.cite && <span className="citation">{f.cite}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="reveal" style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: C.tm }}>Konkurencja: PayAnalytics ~€1 100/mies · Korn Ferry ~€800/mies · Mercer ~€1 250/mies</p>
            {/* FIX #13: pink instead of green */}
            <p style={{ fontSize: '14px', color: C.pinkLight, fontWeight: 600, marginTop: '4px' }}>GapRoll jest 98% tańszy — przy pełnej zgodności z Dyrektywą UE 2023/970.</p>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" style={{ padding: '96px 32px', background: C.surface }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: C.tm, marginBottom: '14px' }}>Podstawa prawna: Dyrektywa 2023/970/UE</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 900, letterSpacing: '-0.025em', color: C.t1 }}>Najczęstsze pytania</h2>
          </div>
          <div className="reveal">{faqData.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}</div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{ padding: '80px 32px', background: C.navy, borderTop: `1px solid ${C.border}` }}>
        <div className="reveal" style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg,#FF4FA3,#2A7BFF)', margin: '0 auto 24px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 900, letterSpacing: '-0.025em', color: C.t1, marginBottom: '16px' }}>Transparentność standardem jutra.</h2>
          <p style={{ fontSize: '16px', color: C.t2, lineHeight: 1.7, marginBottom: '36px' }}>7 czerwca 2026 — termin implementacji Dyrektywy UE 2023/970. 14 dni bezpłatnego trialu. Bez karty kredytowej.</p>
          <a href="#cennik" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '15px 36px', borderRadius: '8px', background: 'linear-gradient(135deg,#2A7BFF,#9B7FEA)', color: '#fff', fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-body)', boxShadow: '0 4px 20px rgba(42,123,255,0.32)', transition: 'all 150ms' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(42,123,255,0.44)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(42,123,255,0.32)' }}
          >Zapewnij zgodność już dziś <ArrowRight size={16} /></a>
          <p style={{ fontSize: '12px', color: C.tm, marginTop: '14px' }}>Art. 9 Dyrektywy Parlamentu Europejskiego i Rady (UE) 2023/970 z dnia 10 maja 2023 r.</p>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.surface, padding: '52px 32px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '52px', marginBottom: '48px' }}>
            <div>
              {/* FIX #11: Real logo */}
              <div style={{ marginBottom: '16px' }}>
                <Image src="/logo.png" alt="GapRoll" width={130} height={32} style={{ height: '36px', width: 'auto' }} />
              </div>
              <p style={{ fontSize: '13px', color: C.tm, lineHeight: 1.7, maxWidth: '260px', marginBottom: '16px' }}>Automatyczna analiza luki płacowej i zgodność z Dyrektywą UE 2023/970 dla polskich pracodawców.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color={C.blue} />
                <span style={{ fontSize: '12px', color: C.tm }}>Dane wyłącznie na serwerach UE</span>
              </div>
            </div>
            {[
              { title: 'Platforma', links: ['Jak działa','Funkcje','Cennik','Trial 14 dni'] },
              { title: 'Prawo', links: ['Dyrektywa 2023/970','Art. 16 — Raportowanie','Art. 7 — Jawność','Art. 4 — EVG'] },
              { title: 'Firma', links: ['O nas','RODO / DPA','Regulamin','Kontakt'] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.tm, marginBottom: '16px' }}>{col.title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ fontSize: '14px', color: C.tm, transition: 'color 150ms' }}
                      onMouseEnter={e => (e.currentTarget.style.color = C.t1)}
                      onMouseLeave={e => (e.currentTarget.style.color = C.tm)}
                    >{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ paddingTop: '24px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: C.tm }}>© 2026 GapRoll Sp. z o.o. · Wrocław, Polska</p>
            <p style={{ fontSize: '12px', color: C.tm, fontStyle: 'italic' }}>Wiarygodność. Precyzja. Spokój.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
