// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 開発環境かどうかを確認
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // 開発環境の場合は自動ログイントークンを設定
  if (isDevelopment) {
    // 既存のトークンがなければ自動ログイン用のトークンを設定
    const token = request.cookies.get('token')?.value;
    if (!token) {
      // 次のレスポンスに自動ログイン用のトークンを設定
      const response = NextResponse.next();
      response.cookies.set('token', 'dev-auto-login-token', { 
        path: '/',
        maxAge: 86400 // 24時間
      });
      return response;
    }
  }

  // 以下は既存のコード
  // トークンがあるかチェック
  const token = request.cookies.get('token')?.value || '';
  
  // ログインページへのアクセスかどうか
  const isLoginPage = request.nextUrl.pathname === '/po/login';
  
  // ログイン不要なパスの配列
  const publicPaths = ['/po/login'];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);
  
  // ログインしていない場合かつ保護されたパスへアクセスしようとしている場合
  if (!token && !isPublicPath) {
    // ログインページにリダイレクト
    const loginUrl = new URL('/po/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // ログイン済みでログインページにアクセスしようとした場合
  if (token && isLoginPage) {
    // ホームページにリダイレクト
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }
  
  // それ以外の場合は通常通り進める
  return NextResponse.next();
}

// 特定のパスにのみミドルウェアを適用する設定
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};