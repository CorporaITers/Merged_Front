'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from 'next/navigation';
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ヘッダー・フッターを非表示にするページ
const authPages = ['/', '/po/login'];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = authPages.includes(pathname);

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {!isAuthPage && <Navbar />}
        <main className={isAuthPage ? '' : 'pb-16'}>
          {children}
        </main>
        {!isAuthPage && <Footer />}
      </body>
    </html>
  );
}