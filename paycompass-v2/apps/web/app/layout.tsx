import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
