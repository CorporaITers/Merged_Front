'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();
  
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [isDevLogin, setIsDevLogin] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // パスに基づいてアクティブなリンクを判断する関数
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // 開発ログイン状態をチェックする関数
  const checkDevLoginStatus = () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        setIsDevLogin(
          token === 'dummy-dev-token' || 
          (user.email && user.email === 'test@example.com')
        );
      } catch (error) {
        setIsDevLogin(false);
      }
    } else {
      setIsDevLogin(false);
    }
  };

  // マウント時と状態変更時に開発ログイン状態をチェック
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      // 初回チェック
      checkDevLoginStatus();
      
      // ローカルストレージの変更を監視
      const handleStorageChange = () => {
        checkDevLoginStatus();
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // ログイン状態の定期確認
      const interval = setInterval(checkDevLoginStatus, 2000);
      
      // クリーンアップ関数
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, []);

  return (
    <header className="bg-[#2f52db] text-white flex items-center justify-between px-4 h-[60px] shadow-md">
      <div className="flex items-center">
        <div className="text-[22px] font-bold mr-32">DigiTradeX</div>
        <nav className="flex">
          <Link
            href="/po/upload"
            className={`px-6 h-[60px] text-[18px] transition flex items-center ${
              isActive('/po/upload') 
                ? 'bg-[#dce8ff] text-[rgba(0,0,0,0.8)] font-medium' 
                : 'hover:bg-white/10'
            }`}
          >
            PO読取
          </Link>
          <Link
            href="/po/list"
            className={`px-6 h-[60px] text-[18px] transition flex items-center ${
              isActive('/po/list') 
                ? 'bg-[#dce8ff] text-[rgba(0,0,0,0.8)] font-medium' 
                : 'hover:bg-white/10'
            }`}
          >
            一覧
          </Link>
          <Link
            href="/"
            className={`px-6 h-[60px] text-[18px] transition flex items-center ${
              isActive('/') && !isActive('/po') && !isActive('/forecast') 
                ? 'bg-[#dce8ff] text-[rgba(0,0,0,0.8)] font-medium' 
                : 'hover:bg-white/10'
            }`}
          >
            船ブッキング
          </Link>
          <Link
            href="/forecast"
            className={`px-6 h-[60px] text-[18px] transition flex items-center ${
              isActive('/forecast') 
                ? 'bg-[#dce8ff] text-[rgba(0,0,0,0.8)] font-medium' 
                : 'hover:bg-white/10'
            }`}
          >
            バンニング見込み
          </Link>
        </nav>
      </div>

      {/* 開発環境かつ開発ログイン時のみ表示する開発メニュー */}
      {isDevelopment && isDevLogin && (
        <div className="relative">
          <button 
            className={`px-6 h-[60px] text-[18px] transition-all duration-200 flex items-center relative group ${
              showDevMenu 
                ? 'bg-green-600 text-white font-medium hover:bg-green-700' 
                : 'bg-green-600 text-white hover:bg-green-700' 
            }`}
            onClick={() => {
              setShowDevMenu(!showDevMenu);
            }}
          >
            {/* シンプルな歯車アイコン */}
            <svg 
              className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-45" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
            開発環境

            {/* ホバー時に表示されるバックグラウンド */}
            <span className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></span>
          </button>
          
          {showDevMenu && (
            <div className="absolute top-[60px] right-0 bg-white text-gray-800 shadow-lg rounded-b-md w-48 z-50">
              <Link 
                href="/dev/logout" 
                className="block px-4 py-2 hover:bg-gray-100"
              >
                ログアウト
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;