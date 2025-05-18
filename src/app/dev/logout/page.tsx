'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DevLogout() {
  const router = useRouter();
  
  useEffect(() => {
    // Cookieからトークンを削除
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // LocalStorageからもクリア
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 少し待ってからログインページへリダイレクト
    setTimeout(() => {
      router.push('/po/login');
    }, 1000);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-4">開発用ログアウト</h1>
        <p>ログアウト処理中...</p>
        <p className="mt-4 text-sm text-gray-500">自動的にログインページにリダイレクトします</p>
      </div>
    </div>
  );
}