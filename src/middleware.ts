// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    // リクエストオブジェクトの基本的な検証
    if (!request || !request.nextUrl) {
      console.error('Invalid request object in middleware');
      return NextResponse.next();
    }

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
    
    // パス名の安全な取得
    const pathname = request.nextUrl.pathname || '';
    
    // ログインページへのアクセスかどうか
    const isLoginPage = pathname === '/po/login';
    
    // ログイン不要なパスの配列
    const publicPaths = ['/po/login'];
    const isPublicPath = publicPaths.includes(pathname);
    
    // ログインしていない場合かつ保護されたパスへアクセスしようとしている場合
    if (!token && !isPublicPath) {
      // より安全なURL構築
      try {
        const baseUrl = request.url || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
        const loginUrl = new URL('/po/login', baseUrl);
        return NextResponse.redirect(loginUrl);
      } catch (urlError) {
        console.error('Error creating login URL:', urlError);
        // フォールバック: 相対パスでリダイレクト
        return NextResponse.redirect('/po/login');
      }
    }
    
    // ログイン済みでログインページにアクセスしようとした場合
    if (token && isLoginPage) {
      // より安全なURL構築
      try {
        const baseUrl = request.url || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
        const homeUrl = new URL('/', baseUrl);
        return NextResponse.redirect(homeUrl);
      } catch (urlError) {
        console.error('Error creating home URL:', urlError);
        // フォールバック: 相対パスでリダイレクト
        return NextResponse.redirect('/');
      }
    }
    
    // それ以外の場合は通常通り進める
    return NextResponse.next();
    
  } catch (error) {
    // 予期しないエラーをキャッチしてログ出力
    console.error('Middleware error:', error);
    // エラーが発生してもアプリケーションを止めないようにする
    return NextResponse.next();
  }
}

// 特定のパスにのみミドルウェアを適用する設定
export const config = {
  matcher: [
    // より具体的なマッチャー設定
    '/po/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};