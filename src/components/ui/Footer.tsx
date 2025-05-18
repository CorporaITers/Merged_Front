'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#2f52db] text-white text-sm px-6 py-5 z-30 flex items-center">
      <div className="flex gap-6">
        <Link href="#" className="hover:underline">
          こんな時は？
        </Link>
        <Link href="#" className="hover:underline">
          お問い合わせ
        </Link>
      </div>
    </footer>
  );
};

export default Footer;