import type { Metadata } from 'next';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: 'Gaproll — Zgodność z Dyrektywą UE 2023/970 dla polskich firm',
  description: 'Pierwsza platforma zgodności płacowej dedykowana na polski rynek. Raport Art. 16 gotowy w 15 minut. Od 99 zł miesięcznie. Dane wyłącznie na serwerach w UE.',
  keywords: 'dyrektywa płacowa, luka płacowa, EU 2023/970, raport art 16, zgodność płacowa, HR compliance, transparentność wynagrodzeń',
  openGraph: {
    title: 'Gaproll — Zgodność z Dyrektywą UE 2023/970',
    description: 'Pierwsza platforma zgodności płacowej dedykowana na polski rynek. Raport Art. 16 w 15 minut.',
    url: 'https://gaproll.eu',
    siteName: 'Gaproll',
    locale: 'pl_PL',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://gaproll.eu',
  },
};
import NoiseOverlay from "@/components/marketing/NoiseOverlay";
import GodRays from "@/components/marketing/GodRays";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background" suppressHydrationWarning>
      {/* Cienki pasek gradientu u góry strony */}
      <div className="absolute top-0 left-0 right-0 h-1 brand-gradient z-50" aria-hidden />
      <NoiseOverlay />
      <GodRays />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
