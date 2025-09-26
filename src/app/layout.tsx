import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/ui/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Katakanizer - ネイティブ発音カタカナ変換ツール",
  description: "英語などの外国語をネイティブスピーカーの発音に近いカタカナに変換。カタカナ英語から脱却し、自然な発音を身につける学習支援ツール",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon-192.svg',
  },
  openGraph: {
    title: "Katakanizer - ネイティブ発音カタカナ変換ツール",
    description: "英語などの外国語をネイティブスピーカーの発音に近いカタカナに変換",
    images: ['/og-image.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
