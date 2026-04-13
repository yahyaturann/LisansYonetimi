import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import "./globals.css";

const govdeYazisi = Manrope({
  subsets: ["latin"],
  variable: "--font-govde"
});

const baslikYazisi = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-baslik"
});

export const metadata: Metadata = {
  title: "Lisans Yönetim Sistemi",
  description: "Türkçe lisans yönetim paneli"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${govdeYazisi.variable} ${baslikYazisi.variable}`}>
      <body className="font-[var(--font-govde)] antialiased">{children}</body>
    </html>
  );
}
