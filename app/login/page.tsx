'use client'

import Link from 'next/link'
import { useActionState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { login, signInWithGoogle } from '@/app/actions/auth'

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className="h-8 w-8">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.736-8.853L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <XLogo />
        </div>

        <h1 className="text-center text-3xl font-bold tracking-tight text-x-text">
          X にログイン
        </h1>

        {(urlError || state?.message) && (
          <p className="rounded-lg border border-x-danger/30 bg-x-danger/10 px-4 py-3 text-sm text-x-danger">
            {urlError === 'access_denied'
              ? 'アクセスが拒否されました。もう一度お試しください。'
              : state?.message ?? urlError}
          </p>
        )}

        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-x-muted">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-x-border bg-transparent px-4 py-3 text-x-text placeholder-x-muted transition focus:border-x-accent focus:outline-none"
              placeholder="メールアドレスを入力"
            />
            {state?.errors?.email && (
              <p className="text-sm text-x-danger">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-x-muted">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-x-border bg-transparent px-4 py-3 text-x-text placeholder-x-muted transition focus:border-x-accent focus:outline-none"
              placeholder="パスワードを入力"
            />
            {state?.errors?.password && (
              <p className="text-sm text-x-danger">{state.errors.password[0]}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-x-accent hover:underline"
            >
              パスワードをお忘れですか？
            </Link>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-x-accent py-3 font-bold text-white transition hover:bg-[#1a8cd8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="relative flex items-center">
          <div className="flex-1 border-t border-x-border" />
          <span className="mx-4 text-sm text-x-muted">または</span>
          <div className="flex-1 border-t border-x-border" />
        </div>

        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-x-border bg-transparent py-3 font-bold text-x-text transition hover:bg-x-surface"
          >
            <GoogleIcon />
            Google でサインイン
          </button>
        </form>

        <p className="text-center text-sm text-x-muted">
          アカウントをお持ちでない方は{' '}
          <Link href="/signup" className="text-x-accent hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
