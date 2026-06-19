import { z } from 'zod'

// ─── Zod Schemas ───────────────────────────────────────────────────────────────

export const SignupSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'ユーザー名は3文字以上です' })
    .max(20, { message: 'ユーザー名は20文字以内です' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: '英数字とアンダースコアのみ使用できます' })
    .trim(),
  display_name: z
    .string()
    .min(1, { message: '表示名を入力してください' })
    .max(50, { message: '表示名は50文字以内です' })
    .trim(),
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }).trim(),
  password: z
    .string()
    .min(8, { message: 'パスワードは8文字以上です' })
    .trim(),
})

export const LoginSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }).trim(),
  password: z.string().min(1, { message: 'パスワードを入力してください' }).trim(),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }).trim(),
})

export const PostSchema = z.object({
  content: z
    .string()
    .min(1, { message: '内容を入力してください' })
    .max(280, { message: '280文字以内で入力してください' })
    .trim(),
})

export const ProfileUpdateSchema = z.object({
  display_name: z
    .string()
    .min(1, { message: '表示名を入力してください' })
    .max(50, { message: '表示名は50文字以内です' })
    .trim(),
  bio: z
    .string()
    .max(160, { message: '自己紹介は160文字以内です' })
    .trim()
    .optional(),
})

// ─── TypeScript Types ──────────────────────────────────────────────────────────

export type Profile = {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  provider: string
  created_at: string
  updated_at: string
}

export type Post = {
  id: string
  user_id: string
  content: string
  likes_count: number
  comments_count: number
  image_url: string | null
  created_at: string
  profile: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>
}

export type Comment = {
  id: string
  user_id: string
  post_id: string
  content: string
  created_at: string
  profile: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>
}

export type Like = {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export type Follow = {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  actor_id: string
  type: 'like' | 'follow'
  post_id: string | null
  read: boolean
  created_at: string
  actor: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>
  post: { content: string } | null
}

// ─── Server Action State ───────────────────────────────────────────────────────

export type ActionState =
  | {
      errors?: Record<string, string[]>
      message?: string
      success?: boolean
    }
  | undefined
