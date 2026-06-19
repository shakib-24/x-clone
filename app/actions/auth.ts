'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  SignupSchema,
  LoginSchema,
  ForgotPasswordSchema,
  type ActionState,
} from '@/lib/definitions'

export async function signup(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = SignupSchema.safeParse({
    username: formData.get('username'),
    display_name: formData.get('display_name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { username, display_name, email, password } = validated.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, display_name } },
  })

  if (error) {
    return { message: error.message }
  }

  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      username,
      display_name,
      provider: 'email',
    })
    if (profileError) {
      return { message: 'プロフィールの作成に失敗しました: ' + profileError.message }
    }
  }

  if (data.session) {
    redirect('/home')
  }

  return { message: '確認メールをお送りしました。メールをご確認ください。' }
}

export async function login(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password } = validated.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { message: 'メールアドレスまたはパスワードが正しくありません' }
  }

  redirect('/home')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPassword(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = ForgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email } = validated.data
  const supabase = await createClient()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback`,
  })

  if (error) {
    return { message: error.message }
  }

  return { message: 'パスワードリセットメールを送信しました。メールをご確認ください。' }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${siteUrl}/auth/callback` },
  })

  if (error || !data.url) {
    return
  }

  redirect(data.url)
}
