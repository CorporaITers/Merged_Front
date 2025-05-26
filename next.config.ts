/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // ビルド時の環境変数
  env: {
    NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  },
  // ランタイム時の環境変数（App Service で動的に設定可能）
  publicRuntimeConfig: {
    API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  }
};

module.exports = nextConfig;
