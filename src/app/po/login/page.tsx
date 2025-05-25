'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth'; // ← 追加

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || '';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LoginResponse {
  token: string;
  user?: User;
}

// interface VerifyResponse {
//   valid: boolean;
// }

const LoginPage = () => {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
  if (authLoading) return;

  setIsInitializing(false); // ← どちらでも一旦初期化解除

  if (isAuthenticated) {
    router.push('/po/upload');
  } else {
    setShowLoginForm(true);
  }
}, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    // 入力値のトリム処理
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('メールアドレスとパスワードを入力してください');
      setIsLoading(false);
      return;
    }

    // 基本的なメールバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('有効なメールアドレスを入力してください');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/api/auth/login`, 
        { 
          email: trimmedEmail, 
          password: trimmedPassword 
        }
      );

      if (response.data.token) {
        login(response.data.token, response.data.user);
      } else {
        throw new Error('トークンが見つかりません');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setErrorMessage('メールアドレスまたはパスワードが正しくありません');
        } else if (error.response?.status === 429) {
          setErrorMessage('ログイン試行回数が上限に達しました。しばらく時間をおいて再度お試しください');
        } else if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.request) {
          setErrorMessage('サーバーに接続できません。ネットワーク接続を確認してください');
        } else {
          setErrorMessage('ログイン処理中にエラーが発生しました');
        }
      } else {
        if (error instanceof Error) {
          setErrorMessage(error.message || 'ログイン処理中にエラーが発生しました');
        } else {
          setErrorMessage('不明なエラーが発生しました');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 開発用ログイン関数を追加
  const handleDevLogin = () => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('token', 'dummy-dev-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'テストユーザー',
        email: 'test@example.com',
        role: 'admin',
      }));
      router.push('/po/upload');
    }
  };

  // 認証中の表示
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // ログインフォームを表示しない場合（認証済みでリダイレクト中）
  if (!showLoginForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">リダイレクト中...</p>
          </div>
        </div>
      </div>
    );
  }

  // ログインフォーム表示
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-sm">
        <h1 className="text-xl font-bold text-center mb-8 text-black">DigiTradeX</h1>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2 text-sm">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@company.com"
              required
              autoComplete="email"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2 text-sm">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        {/* 開発用自動ログインボタンを追加 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4">
            <button
              onClick={handleDevLogin}
              className="w-full bg-green-600 text-white py-2.5 rounded text-sm font-medium hover:bg-green-700 transition-colors"
            >
              開発用自動ログイン
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
