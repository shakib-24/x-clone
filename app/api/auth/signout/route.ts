import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

// Route Handlers can write cookies; Server Components cannot.
// The layout redirects here when no profile is found so the proxy
// doesn't see an authenticated session and loop /login ↔ /home.
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.signOut()

  // Belt-and-suspenders: delete every sb-* cookie directly on the redirect
  // response in case setAll didn't flush in time.
  const response = NextResponse.redirect(new URL('/login', request.url))
  cookieStore
    .getAll()
    .filter((c) => c.name.startsWith('sb-'))
    .forEach((c) => response.cookies.set(c.name, '', { maxAge: 0, path: '/' }))

  return response
}
