import type { Metadata } from 'next'
import { Inter, Lato } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
})

const lato = Lato({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700', '900'],
  display: 'swap',
  variable: '--font-lato',
})

export const metadata: Metadata = {
  title: 'GapRoll — Raport Art. 16 w 15 minut | Dyrektywa UE 2023/970',
  description: 'Automatyczna analiza luki płacowej i raport Art. 16 dla polskich pracodawców. Pełna zgodność z Dyrektywą UE 2023/970 za 99 PLN/mies. Dane na serwerach UE.',
  keywords: 'luka płacowa, Dyrektywa UE 2023/970, raport Art. 16, EVG, wartościowanie stanowisk, compliance HR',
  openGraph: {
    title: 'GapRoll — Pełna zgodność z Dyrektywą UE 2023/970',
    description: 'Raport Art. 16 gotowy w 15 minut. Od 99 PLN/mies. Dane wyłącznie na serwerach UE.',
    locale: 'pl_PL',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${inter.variable} ${lato.variable}`}>
      <body>{children}</body>
    </html>
  )
}
