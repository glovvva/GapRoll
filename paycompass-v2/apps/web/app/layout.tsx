import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-lora",
  display: "swap",
  weight: ["400", "600", "700"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GapRoll",
  description: "GapRoll — platforma do raportowania luk płacowych i zgodności z Dyrektywą UE 2023/970.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${lora.variable} ${inter.variable}`}>
      <body className="font-body bg-forest-deep text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
