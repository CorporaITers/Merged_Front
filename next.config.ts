import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // 環境変数を明示的に公開
  env: {
    NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  },
  
  // ランタイム設定（App Service での動的な値取得用）
  publicRuntimeConfig: {
    API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  },
  
  // デバッグ用：ビルド時の環境変数確認
  webpack: (config, { isServer }) => {
    if (isServer) {
      console.log('🔧 Build time NEXT_PUBLIC_API_ENDPOINT:', process.env.NEXT_PUBLIC_API_ENDPOINT);
      console.log('🔧 All NEXT_PUBLIC_ vars:', 
        Object.keys(process.env)
          .filter(key => key.startsWith('NEXT_PUBLIC_'))
          .reduce((obj: Record<string, string | undefined>, key) => {
            obj[key] = process.env[key];
            return obj;
          }, {})
      );
    }
    return config;
  },
};

export default nextConfig;