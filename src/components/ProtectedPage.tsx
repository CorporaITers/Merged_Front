'use client';

import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // 認証状態をチェックして、未認証なら自動的にログインページにリダイレクト
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/po/login';
    }
  }, [isAuthenticated, isLoading]);

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 未認証の場合は何も表示しない（リダイレクト中）
  if (!isAuthenticated) {
    return null;
  }

  // 認証済みの場合はそのまま表示
  return <>{children}</>;
}