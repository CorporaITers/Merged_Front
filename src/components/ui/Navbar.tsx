'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

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
          className={`px-6 h-[60px] text-[18px] hover:bg-white/10 transition flex items-center ${
            isActive('/po/read') ? 'bg-[#dce8ff] text-[rgba(0,0,0,0.8)] font-medium' : ''
          }`}
        >
          PO読取
        </Link>
        <Link
          href="/po/list"
          className={`px-6 h-[60px] text-[18px] hover:bg-white/10 transition flex items-center ${
            isActive('/po/list') ? 'bg-[#dce8ff] text-[rgba(0,0,0,0.8)] font-medium' : ''
          }`}
        >
          一覧
        </Link>
        <Link
          href="/"
          className={`px-6 h-[60px] text-[18px] hover:bg-white/10 transition flex items-center ${
            isActive('/') ? 'bg-[#dce8ff] text-[rgba(0,0,0,0.8)] font-medium' : ''
          }`}
        >
          船ブッキング
        </Link>
        <Link
          href="/forecast"
          className={`px-6 h-[60px] text-[18px] hover:bg-white/10 transition flex items-center ${
            isActive('/forecast') ? 'bg-[#dce8ff] text-[rgba(0,0,0,0.8)] font-medium' : ''
          }`}
        >
          バンニング見込み
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;