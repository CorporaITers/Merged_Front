// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    // 基本的な検証
    if (!request?.nextUrl) {
      return NextResponse.next();
    }

    // 開発環境かどうかを確認（Azure環境対応）
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.AZURE_ENV === 'development';
    
    // 開発環境の場合は自動ログイントークンを設定
    if (isDevelopment) {
      const token = request.cookies.get('token')?.value;
      if (!token) {
        const response = NextResponse.next();
        response.cookies.set('token', 'dev-auto-login-token', { 
          path: '/',
          maxAge: 86400
        });
        return response;
      }
    }

    // トークンがあるかチェック
    const token = request.cookies.get('token')?.value || '';
    
    // パス名の取得
    const pathname = request.nextUrl.pathname;
    
    // ログインページへのアクセスかどうか
    const isLoginPage = pathname === '/po/login';
    
    // ログイン不要なパスの配列
    const publicPaths = ['/po/login'];
    const isPublicPath = publicPaths.includes(pathname);
    
    // ログインしていない場合かつ保護されたパスへアクセスしようとしている場合
    if (!token && !isPublicPath) {
      // 安全なURL構築
      const url = request.nextUrl.clone();
      url.pathname = '/po/login';
      return NextResponse.redirect(url);
    }
    
    // ログイン済みでログインページにアクセスしようとした場合
    if (token && isLoginPage) {
      // 安全なURL構築
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    
    return NextResponse.next();
    
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// より制限的なマッチャー設定
export const config = {
  matcher: ['/po/:path*'],
};