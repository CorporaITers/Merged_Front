'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isBrowser = typeof window !== 'undefined';

  useEffect(() => {
    if (!isBrowser) return;

    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, [isBrowser]);

  const login = (token: string, user?: unknown) => {
    if (!isBrowser) return;

    localStorage.setItem('token', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    setIsAuthenticated(true);
    
    // カスタムイベントを発火してNavbarに変更を通知
    window.dispatchEvent(new Event('localStorageChange'));
    
    router.push('/po/upload');
  };

  const logout = () => {
    if (!isBrowser) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    
    // カスタムイベントを発火
    window.dispatchEvent(new Event('localStorageChange'));
    
    router.push('/po/login');
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}