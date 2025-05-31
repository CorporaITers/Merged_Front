// next.config.ts (Azure最適化版)
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // 環境変数を明示的に公開
  env: {
    NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
    // 開発者モード制御用の環境変数を追加
    NEXT_PUBLIC_ALLOW_DEV_MODE: process.env.NEXT_PUBLIC_ALLOW_DEV_MODE,
  },
  
  // ランタイム設定（App Service での動的な値取得用）
  publicRuntimeConfig: {
    API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
    ALLOW_DEV_MODE: process.env.NEXT_PUBLIC_ALLOW_DEV_MODE,
  },

  // Azure App Service最適化
  experimental: {
    // アプリディレクトリを使用している場合
    appDir: true,
  },

  // 画像最適化設定
  images: {
    domains: [],
    unoptimized: true, // Azure App Serviceでの画像最適化を無効化
  },

  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // リダイレクト設定
  async redirects() {
    return [
      {
        source: '/',
        destination: '/po/login',
        permanent: false, // 一時的なリダイレクト
      },
    ];
  },

  // webpack設定の調整
  webpack: (config, { dev, isServer }) => {
    // Azure App Serviceでのビルド最適化
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;