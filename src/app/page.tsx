'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">ようこそ DigiTradeX へ</h1>
      <p className="text-gray-600 mb-6">このアプリは貿易業務を効率化するためのツールです。</p>

      <Link
        href="/po/login"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        ログイン画面へ
      </Link>
    </main>
  );
}
