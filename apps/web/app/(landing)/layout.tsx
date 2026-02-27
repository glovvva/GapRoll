import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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
