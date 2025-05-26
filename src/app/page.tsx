'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // 認証済みユーザーを自動的にPOアップロードページにリダイレクト
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // 少し遅延を入れてスムーズなリダイレクトにする（オプション）
      const timer = setTimeout(() => {
        router.push('/po/upload');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router]);

  // ローディング中の表示
  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">認証状態を確認中...</p>
      </main>
    );
  }

  // 認証済みでリダイレクト準備中（オプション）
  if (isAuthenticated) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">アプリケーションを準備中...</p>
      </main>
    );
  }

  // 未認証ユーザー向けのウェルカムページ
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div>
          <div className="flex flex-col items-center mb-4">
            <Image
              src="/dorimochan.png"
              alt="Dorimochan"
              width={200}
              height={200}
              className="mb-4"
              priority
            />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">DigiTradeX</h1>
          </div>
          <p className="text-gray-600 mb-8">貿易業務を効率化するためのデジタルプラットフォーム</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">主な機能</h2>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• PO（購買発注書）の自動読取・登録</li>
              <li>• 登録済みPOの管理・検索</li>
              <li>• 船便スケジュール検索</li>
              <li>• バンニング見込み予測</li>
            </ul>
          </div>

          <Link
            href="/po/login"
            className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            ログインして開始
          </Link>
        </div>

        <div className="text-xs text-gray-500">
          <p>初回利用の方は管理者にお問い合わせください</p>
        </div>
      </div>
    </main>
  );
}