'use client';

import React, { useState } from 'react'; // <-- useState を追加
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();
  
  // <-- 以下を追加: 開発メニューの表示状態とチェックを行う変数 -->
  const [showDevMenu, setShowDevMenu] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // パスに基づいてアクティブなリンクを判断する関数
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <header className="bg-[#2f52db] text-white flex items-center px-4 h-[60px] shadow-md">
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
        
        {/* <-- ここから追加: 開発環境でのみ表示する開発メニュー --> */}
        {isDevelopment && (
          <div className="relative ml-4">
            <button 
              className="px-6 h-[60px] text-[18px] bg-amber-500 text-white flex items-center"
              onClick={() => setShowDevMenu(!showDevMenu)}
            >
              開発環境
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
        {/* <-- ここまで追加 --> */}
        
      </nav>
    </header>
  );
};

export default Navbar;