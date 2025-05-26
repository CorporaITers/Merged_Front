'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://tech0-gen8-step4-pos-app-30.azurewebsites.net';

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

const LoginPage = () => {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);

  // デバッグ情報を追加
  useEffect(() => {
    // 環境変数デバッグ情報を表示
    console.log('=== API接続デバッグ情報 ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('NEXT_PUBLIC_API_ENDPOINT:', process.env.NEXT_PUBLIC_API_ENDPOINT);
    console.log('API_URL:', API_URL);
    if (typeof window !== 'undefined') {
      console.log('Current URL:', window.location.href);
      console.log('Current host:', window.location.host);
      console.log('Protocol:', window.location.protocol);
    }
    console.log('========================');
  }, []);

  useEffect(() => {
    if (authLoading) return;

    setIsInitializing(false);

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

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('メールアドレスとパスワードを入力してください');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('有効なメールアドレスを入力してください');
      setIsLoading(false);
      return;
    }

    try {
      const loginUrl = `${API_URL}/api/auth/login`;
      console.log('=== ログイン試行 ===');
      console.log('Login URL:', loginUrl);
      console.log('Email:', trimmedEmail);
      console.log('API_URL variable:', API_URL);
      
      const response = await axios.post<LoginResponse>(
        loginUrl,
        { 
          email: trimmedEmail, 
          password: trimmedPassword 
        },
        {
          timeout: 30000, // 30秒タイムアウト
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Login response:', response.status, response.data);

      if (response.data.token) {
        const userInfo = response.data.user || {
          id: 1,
          name: trimmedEmail.split('@')[0],
          email: trimmedEmail,
          role: 'user'
        };
        
        login(response.data.token, userInfo);
      } else {
        throw new Error('トークンが見つかりません');
      }
    } catch (error) {
      console.error('=== ログインエラー詳細 ===');
      console.error('Error type:', typeof error);
      console.error('Error object:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:');
        console.error('- Status:', error.response?.status);
        console.error('- Status text:', error.response?.statusText);
        console.error('- Response data:', error.response?.data);
        console.error('- Request URL:', error.config?.url);
        console.error('- Request method:', error.config?.method);
        console.error('- Request headers:', error.config?.headers);
        console.error('- Network error:', !error.response);
        console.error('- Timeout:', error.code === 'ECONNABORTED');
        
        if (error.response?.status === 401) {
          setErrorMessage('メールアドレスまたはパスワードが正しくありません');
        } else if (error.response?.status === 429) {
          setErrorMessage('ログイン試行回数が上限に達しました。しばらく時間をおいて再度お試しください');
        } else if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.code === 'ECONNABORTED') {
          setErrorMessage('接続がタイムアウトしました。しばらく時間をおいて再度お試しください');
        } else if (!error.response) {
          setErrorMessage(`サーバーに接続できません。API URL: ${API_URL}`);
        } else {
          setErrorMessage('ログイン処理中にエラーが発生しました');
        }
      } else {
        console.error('Non-axios error:', error);
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

  // API接続テスト関数
  const testApiConnection = async () => {
    if (!API_URL) {
      console.error('API_URL が設定されていません');
      return;
    }

    try {
      console.log('=== API接続テスト ===');
      const testUrl = `${API_URL}/api/test/connection`;
      console.log('Test URL:', testUrl);
      
      const response = await fetch(testUrl);
      console.log('Test response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Test response data:', data);
      } else {
        console.error('Test failed:', response.statusText);
      }
    } catch (error) {
      console.error('Test error:', error);
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

        {/* デバッグ情報表示（一時的） */}
        <div className="mb-4 p-3 bg-gray-100 border rounded text-xs">
          <div><strong>Debug Info:</strong></div>
          <div>API URL: {API_URL || 'undefined'}</div>
          <div>Environment: {process.env.NODE_ENV}</div>
          <div>Host: {typeof window !== 'undefined' ? window.location.host : 'unknown'}</div>
          <button 
            onClick={testApiConnection}
            className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            API接続テスト
          </button>
        </div>

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
      </div>
    </div>
  );
};

export default LoginPage;