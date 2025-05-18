import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. ナビゲーションバーとフッターのインポート追加
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

// 2. メタデータの更新
export const metadata: Metadata = {
  title: "DigiTradeX", // "Create Next App"から変更
  description: "貿易事務効率化アプリケーション", // より具体的な説明に変更
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 3. html要素の言語属性を日本語に変更
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 4. navbarコンポーネントを追加 */}
        <Navbar />
        {/* 5. childrenをmainタグで囲み、フッター用の下部余白を追加 */}
        <main className="pb-16">{children}</main>
        {/* 6. Footerコンポーネントを追加 */}
        <Footer />
      </body>
    </html>
  );
}