import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}`)
  }

  if (code) {
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

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      // Ensure a profiles row exists for OAuth (Google) users
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (!existing) {
          const emailPrefix = user.email?.split('@')[0] ?? 'user'
          const sanitized = emailPrefix.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 15)
          const suffix = Math.floor(Math.random() * 9000 + 1000).toString()
          const username = `${sanitized}_${suffix}`

          const displayName =
            (user.user_metadata?.full_name as string | undefined) ??
            (user.user_metadata?.name as string | undefined) ??
            sanitized

          await supabase.from('profiles').insert({
            id: user.id,
            username,
            display_name: displayName,
            avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
            provider: 'google',
          })
        }
      }

      return NextResponse.redirect(`${origin}/home`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
