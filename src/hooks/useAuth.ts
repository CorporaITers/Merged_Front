'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDevLogin: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    isDevLogin: false,
  });
  
  const router = useRouter();
  const isBrowser = typeof window !== 'undefined';

  const loadAuthData = useCallback(() => {
    // サーバーサイドでは実行しない
    if (!isBrowser) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (userStr && token) {
        const user = JSON.parse(userStr);
        
        // 開発者判定ロジック
        const isDevToken = token === 'dummy-dev-token';
        const isDevEmail = user.email === 'dev@example.com';
        const isAdminRole = user.role === 'admin';
        const isDevLogin = isDevToken || isDevEmail || isAdminRole;

        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isDevLogin,
        });
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isDevLogin: false,
        });
      }
    } catch (error) {
      console.error('Auth data parsing error:', error);
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isDevLogin: false,
      });
    }
  }, [isBrowser]);

  const login = useCallback((token: string, user?: User) => {
    if (!isBrowser) return;

    try {
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // カスタムイベントを発火してNavbarに変更を通知
      window.dispatchEvent(new Event('localStorageChange'));
      
      // 状態を更新
      loadAuthData();
      
      // ページ遷移
      router.push('/po/upload');
    } catch (error) {
      console.error('Login error:', error);
    }
  }, [isBrowser, loadAuthData, router]);

  const logout = useCallback(() => {
    if (!isBrowser) return;

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // カスタムイベントを発火
      window.dispatchEvent(new Event('localStorageChange'));
      
      // 状態をリセット
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isDevLogin: false,
      });
      
      // ページ遷移
      router.push('/po/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/po/login');
    }
  }, [isBrowser, router]);

  // 初期化とイベント監視
  useEffect(() => {
    if (!isBrowser) return;

    // 初回ロード
    loadAuthData();

    // ストレージ変更の監視
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        loadAuthData();
      }
    };

    const handleCustomStorageChange = () => {
      loadAuthData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, [isBrowser, loadAuthData]);

  return {
    ...authState,
    login,
    logout,
    refresh: loadAuthData,
  };
}