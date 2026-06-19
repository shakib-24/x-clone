'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { forgotPassword } from '@/app/actions/auth'

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className="h-8 w-8">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.736-8.853L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPassword, undefined)

  if (state?.message && !state.errors) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="flex justify-center">
            <XLogo />
          </div>
          <div className="rounded-lg border border-x-accent/30 bg-x-accent/10 px-6 py-8">
            <p className="text-base text-x-text">{state.message}</p>
          </div>
          <p className="text-sm text-x-muted">
            <Link href="/login" className="text-x-accent hover:underline">
              ログインページへ戻る
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <XLogo />
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-x-text">
            パスワードをお忘れですか？
          </h1>
          <p className="text-sm text-x-muted">
            登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
          </p>
        </div>

        {state?.message && (
          <p className="rounded-lg border border-x-danger/30 bg-x-danger/10 px-4 py-3 text-sm text-x-danger">
            {state.message}
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

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-x-accent py-3 font-bold text-white transition hover:bg-[#1a8cd8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? '送信中...' : 'リセットメールを送信'}
          </button>
        </form>

        <p className="text-center text-sm text-x-muted">
          <Link href="/login" className="text-x-accent hover:underline">
            ログインページへ戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
