import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayCompass V2",
  description: "EU Pay Transparency Platform",
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
