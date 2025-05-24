'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth'; // ← 追加

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || '';

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth(); // ← 追加
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) verifyToken(token);
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await axios.get<{ valid: boolean }>(`${API_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.valid) {
        router.push('/po/upload');
      } else {
        localStorage.removeItem('token');
      }
    } catch {
      localStorage.removeItem('token');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (!email || !password) {
      setErrorMessage('メールアドレスとパスワードを入力してください');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post<{
        token: string;
        user?: {
          id: number;
          name: string;
          email: string;
          role: string;
        };
      }>(`${API_URL}/api/auth/login`, { email, password });

      if (response.data.token) {
        // ← ここを修正：useAuthのlogin関数を使用
        login(response.data.token, response.data.user);
      } else {
        throw new Error('トークンが見つかりません');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrorMessage('メールアドレスとパスワードを確認してください');
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.request) {
        setErrorMessage('サーバーに接続できません。ネットワーク接続を確認してください');
      } else {
        setErrorMessage(error.message || 'ログイン処理中にエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = () => {
    if (process.env.NODE_ENV === 'development') {
      // ← ここを修正：useAuthのlogin関数を使用
      login('dummy-dev-token', {
        id: 1,
        name: 'テストユーザー',
        email: 'test@example.com',
        role: 'admin',
      });
    }
  };

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
