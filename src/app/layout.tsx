// 'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import { usePathname } from 'next/navigation';
import "./globals.css";
// 1. ナビゲーションバーとフッターのインポート追加
import NavbarWrapper from '@/components/ui/NavbarWrapper';
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
// const authPages = ['/', '/po/login'];

// 2. メタデータの更新
export const metadata: Metadata = {
  title: "DigiTradeX", // "Create Next App"から変更
  description: "貿易事務効率化アプリケーション", // より具体的な説明に変更
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 3. html要素の言語属性を日本語に変更
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 4. navbarコンポーネントを追加 */}
        <NavbarWrapper /> {/* ← 中で表示制御 */}
        {/* 5. childrenをmainタグで囲み、フッター用の下部余白を追加 */}
        <main className="pb-16">{children}</main>
        {/* 6. Footerコンポーネントを追加 */}
        <Footer /> {/* ← 中で表示制御 */}
      </body>
    </html>
  );
}