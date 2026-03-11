'use client';
import React from 'react';
import Image from 'next/image';

export default function Footer() {
  const [email, setEmail] = React.useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = React.useState(false);

  return (
    <footer id="kontakt" style={{
      background: '#080F1E',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '4rem 2rem 2rem',
      color: '#94A3B8',
      fontSize: '0.875rem'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Top grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '3rem',
          marginBottom: '3.5rem'
        }}>

          {/* Col 1 — Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Image src="/logo.png" alt="Gaproll" width={120} height={36}
              style={{ objectFit: 'contain', marginBottom: '1rem', mixBlendMode: 'screen' }} />
            <p style={{ lineHeight: 1.7, fontSize: '0.825rem', color: '#64748B', maxWidth: '200px' }}>
              Pierwsza platforma zgodności płacowej dedykowana na polski rynek.
            </p>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#475569' }}>
              © {new Date().getFullYear()} Gaproll. Wszelkie prawa zastrzeżone.
            </p>
          </div>

          {/* Col 2 — Platforma */}
          <div>
            <p style={{ color: '#E2E8F0', fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem' }}>Platforma</p>
            {[
              { label: 'Dyrektywa UE', href: '#dyrektywa' },
              { label: 'Funkcje', href: '#funkcje' },
              { label: 'Jak to działa', href: '#jak-dziala' },
              { label: 'Bezpieczeństwo', href: '#bezpieczenstwo' },
              { label: 'Cennik', href: '#cennik' },
              { label: 'FAQ', href: '#faq' },
            ].map(l => (
              <a key={l.href} href={l.href} style={{ display: 'block', color: '#64748B', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Col 3 — Zasoby */}
          <div>
            <p style={{ color: '#E2E8F0', fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem' }}>Zasoby</p>
            {[
              { label: 'Baza wiedzy', href: '/baza-wiedzy' },
              { label: 'Blog', href: '/blog' },
              { label: 'Dokumentacja API', href: '/docs' },
              { label: 'Status systemu', href: '/status' },
            ].map(l => (
              <a key={l.href} href={l.href} style={{ display: 'block', color: '#64748B', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Col 4 — Prawne */}
          <div>
            <p style={{ color: '#E2E8F0', fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem' }}>Informacje prawne</p>
            {[
              { label: 'Polityka prywatności', href: '/polityka-prywatnosci' },
              { label: 'Regulamin', href: '/regulamin' },
              { label: 'Polityka cookies', href: '/cookies' },
              { label: 'RODO / DPA', href: '/rodo' },
            ].map(l => (
              <a key={l.href} href={l.href} style={{ display: 'block', color: '#64748B', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Col 5 — Kontakt */}
          <div>
            <p style={{ color: '#E2E8F0', fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem' }}>Kontakt</p>
            <a href="mailto:kontakt@gaproll.eu" style={{ display: 'block', color: '#64748B', textDecoration: 'none', marginBottom: '0.5rem' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>
              kontakt@gaproll.eu
            </a>
            <a href="https://linkedin.com/company/gaproll" target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', color: '#64748B', textDecoration: 'none', marginBottom: '0.5rem' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>
              LinkedIn
            </a>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
              Headframe sp. z o.o.<br />
              NIP: 8971969073 | KRS: 0001227801<br />
              ul. Leszczyńskiego 4/77<br />
              50-078 Wrocław
            </p>
          </div>

        </div>

        {/* Newsletter strip */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '2.5rem 0',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <p style={{ color: '#E2E8F0', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
              Newsletter Gaproll
            </p>
            <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
              Aktualności o dyrektywie, kody rabatowe i praktyczne wskazówki HR. Bez spamu.
            </p>
          </div>
          {!newsletterSubmitted ? (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Służbowy adres e-mail"
                style={{
                  padding: '0.65rem 1rem',
                  background: '#0F172A',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.875rem',
                  outline: 'none',
                  width: '260px'
                }}
              />
              <button
                onClick={() => { if (email) setNewsletterSubmitted(true); }}
                style={{
                  padding: '0.65rem 1.5rem',
                  background: 'linear-gradient(135deg, #FF4FA3, #2A7BFF)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Zapisz się →
              </button>
            </div>
          ) : (
            <p style={{ color: '#10B981', fontWeight: 600 }}>✓ Zapisano! Sprawdź skrzynkę e-mail.</p>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: '#334155' }}>
          <span>Dane przetwarzane wyłącznie na serwerach w UE · AES-256 · RODO Art. 28</span>
          <span>Dyrektywa (UE) 2023/970 · Termin: 7 czerwca 2026</span>
        </div>

      </div>
    </footer>
  );
}
