'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || '';

const LoginPage = () => {
  const router = useRouter();
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
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.valid) {
        router.push('/po/uoload');
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
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        router.push('/po/upload');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">DigiTradeX</h1>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">メールアドレス</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@company.com"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">パスワード</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4">
            <button
              onClick={handleDevLogin}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
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
