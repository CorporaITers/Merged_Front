'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname(); // ✅ Hookは絶対に条件の外
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [isDevLogin, setIsDevLogin] = useState(false);

  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkDevLoginStatus();

      const handleStorageChange = () => checkDevLoginStatus();
      window.addEventListener('storage', handleStorageChange);
      const interval = setInterval(checkDevLoginStatus, 2000);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, []);

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
    } else {
      setIsDevLogin(false);
    }
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = '/po/login'; // 強制遷移で再描画
  };

  // ✅ フックの後に return null を書く
  const hideOnPaths = ['/', '/po/login'];
  if (hideOnPaths.includes(pathname)) {
    return null;
  }

  return (
    <header className="bg-[#2f52db] text-white flex items-center justify-between px-4 h-[60px] shadow-md min-w-0">
      <div className="flex items-center min-w-0 flex-1">
        <div className="text-[20px] font-bold mr-8 flex-shrink-0">DigiTradeX</div>
        <nav className="flex min-w-0 flex-1">
          {[
            { path: '/po/upload', label: 'PO読取' },
            { path: '/po/list', label: '登録一覧' },
            { path: '/shipit', label: '船便検索' },
            { path: '/forecast', label: 'バンニング見込み' },
          ].map(({ path, label }) => (
            <Link
              key={path}
              href={path}
              className={`px-6 h-[60px] text-[16px] transition flex items-center whitespace-nowrap ${
                isActive(path)
                  ? 'bg-[#dce8ff] text-[rgba(0,0,0,0.8)] font-medium'
                  : 'hover:bg-white/10'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center flex-shrink-0">
        <button
          onClick={handleLogout}
          className="px-4 h-[60px] text-[16px] flex items-center hover:bg-white/10"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          ログアウト
        </button>

        {isDevelopment && isDevLogin && (
          <div className="relative">
            <button
              className={`px-4 h-[60px] text-[16px] transition-all duration-200 flex items-center group whitespace-nowrap ${
                showDevMenu ? 'bg-green-600 text-white font-medium' : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              onClick={() => setShowDevMenu(!showDevMenu)}
            >
              開発環境
            </button>

            {showDevMenu && (
              <div className="absolute top-[60px] right-0 bg-white text-gray-800 shadow-lg rounded-b-md w-48 z-50">
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  開発用ログアウト
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
