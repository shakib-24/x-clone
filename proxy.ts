import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 認証が必要なルート
const protectedRoutes = ['/home', '/profile']
// 未認証のみアクセス可能なルート（認証済みなら /home へ）
const authRoutes = ['/login', '/signup', '/forgot-password']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッションをリフレッシュ（期限切れトークンを自動更新）
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = protectedRoutes.some((r) => path.startsWith(r))
  const isAuthPage = authRoutes.includes(path)

  // 未認証ユーザーが保護ルートへ → /login にリダイレクト
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 認証済みユーザーが認証ページへ → /home にリダイレクト
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // ルート / へのアクセス
  if (path === '/') {
    return NextResponse.redirect(
      new URL(user ? '/home' : '/login', request.url)
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.png$).*)'],
}
