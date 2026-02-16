import Hero from "./components/Hero";
import ComplianceBadges from "./components/ComplianceBadges";
import ProblemSection from "./components/ProblemSection";
import FeaturesGrid from "./components/FeaturesGrid";
import HowItWorks from "./components/HowItWorks";
import PricingSection from "./components/PricingSection";
import FAQ from "./components/FAQ";
import CTAFinal from "./components/CTAFinal";

export const metadata = {
  title: "GapRoll — Raport zgodności płacowej Art. 16 w 15 minut",
  description:
    "Platforma do analizy luki płacowej i wartościowania stanowisk (EVG) zgodnie z Dyrektywą UE 2023/970. Raport Art. 16 gotowy w 15 minut. Od 99 PLN/mies.",
  keywords: [
    "luka płacowa",
    "dyrektywa ue 2023/970",
    "raport art. 16",
    "wartościowanie stanowisk",
    "pay transparency",
    "EVG",
    "RODO",
  ],
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ComplianceBadges />
      <ProblemSection />
      <FeaturesGrid />
      <HowItWorks />
      <PricingSection />
      <FAQ />
      <CTAFinal />
    </>
  );
}
