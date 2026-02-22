import type { Metadata } from "next";
import { Inter, Lato } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GapRoll — Zgodność z Dyrektywą UE 2023/970",
  description: "Automatyczna analiza luki płacowej. Raport Art. 16 w 15 minut.",
  keywords: ["luka płacowa", "dyrektywa EU 2023/970", "transparentność wynagrodzeń"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning className={`${inter.variable} ${lato.variable}`}>
      <body className={inter.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          storageKey="gaproll-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
