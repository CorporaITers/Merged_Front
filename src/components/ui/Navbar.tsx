'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const pathname = usePathname();
  const { logout, isAuthenticated } = useAuth();
  
  // ✅ 全てのstateを最初に配置
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [isDevLogin, setIsDevLogin] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // ✅ 全てのuseEffectを無条件で配置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkDevLoginStatus();
      
      const handleStorageChange = () => {
        checkDevLoginStatus();
      };
      
      window.addEventListener('storage', handleStorageChange);
      const interval = setInterval(checkDevLoginStatus, 2000);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, []);

  // ✅ 関数定義をHooksの後に配置
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
      } catch {
        setIsDevLogin(false);
      }
    } 
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    setShowDevMenu(false);
  };

  // ✅ 条件チェックをHooksの後に配置
  const hideOnPaths = ['/', '/po/login'];
  if (hideOnPaths.includes(pathname)) {
    return null;
  }

  return (
    <>
      {!isAuthenticated ? null : (
        <header className="bg-[#2f52db] text-white flex items-center justify-between px-4 h-[60px] shadow-md min-w-0">
          {/* 左側：ロゴとナビゲーション */}
          <div className="flex items-center min-w-0 flex-1">
            <div className="text-[20px] font-bold mr-8 flex-shrink-0">DigiTradeX</div>
            <nav className="flex min-w-0 flex-1">
              <Link
                href="/po/upload"
                className={`px-6 h-[60px] text-[16px] transition flex items-center whitespace-nowrap ${
                  isActive('/po/upload') 
                    ? 'bg-[#dce8ff] text-[rgba(0,0,0,0.8)] font-medium' 
                    : 'hover:bg-white/10'
                }`}
              >
                PO読取
              </Link>
              <Link
                href="/po/list"
                className={`px-6 h-[60px] text-[16px] transition flex items-center whitespace-nowrap ${
                  isActive('/po/list') 
                    ? 'bg-[#dce8ff] text-[rgba(0,0,0,0.8)] font-medium' 
                    : 'hover:bg-white/10'
                }`}
              >
                登録一覧
              </Link>
              <Link
                href="/shipit"
                className={`px-6 h-[60px] text-[16px] transition flex items-center whitespace-nowrap ${
                  isActive('/shipit')
                    ? 'bg-[#dce8ff] text-[rgba(0,0,0,0.8)] font-medium' 
                    : 'hover:bg-white/10'
                }`}
              >
                船便検索
              </Link>
              <Link
                href="/forecast"
                className={`px-6 h-[60px] text-[16px] transition flex items-center whitespace-nowrap ${
                  isActive('/forecast') 
                    ? 'bg-[#dce8ff] text-[rgba(0,0,0,0.8)] font-medium' 
                    : 'hover:bg-white/10'
                }`}
              >
                バンニング見込み
              </Link>
            </nav>
          </div>

          {/* 右側：ログアウトと開発メニュー */}
          <div className="flex items-center flex-shrink-0">
            {/* 通常のログアウトボタン */}
            <button
              onClick={handleLogout}
              className="px-4 h-[60px] text-[16px] transition flex items-center hover:bg-white/10 whitespace-nowrap"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              ログアウト
            </button>

            {/* 開発環境メニュー */}
            {isDevelopment && isDevLogin && (
              <div className="relative">
                <button 
                  className={`px-4 h-[60px] text-[16px] transition-all duration-200 flex items-center relative group whitespace-nowrap ${
                    showDevMenu 
                      ? 'bg-green-600 text-white font-medium hover:bg-green-700' 
                      : 'bg-green-600 text-white hover:bg-green-700' 
                  }`}
                  onClick={() => setShowDevMenu(!showDevMenu)}
                >
                  <svg 
                    className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-45" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
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
                </button>
            
                {showDevMenu && (
                  <div className="absolute top-[60px] right-0 bg-white text-gray-800 shadow-lg rounded-b-md w-48 z-50">
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      開発用ログアウト
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
      )}
    </>
  );
};

export default Navbar;