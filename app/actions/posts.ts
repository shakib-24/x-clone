'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { PostSchema, type ActionState } from '@/lib/definitions'

export async function createPost(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = PostSchema.safeParse({ content: formData.get('content') })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('posts')
    .insert({ user_id: user.id, content: validated.data.content })

  if (error) return { message: '投稿に失敗しました' }

  revalidatePath('/home')
  revalidatePath('/profile', 'layout')
  return { success: true }
}

export async function likePost(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('likes')
    .insert({ user_id: user.id, post_id: postId })

  if (!error) {
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
    await supabase
      .from('posts')
      .update({ likes_count: count ?? 0 })
      .eq('id', postId)
  }

  revalidatePath('/home')
  revalidatePath('/profile', 'layout')
}

export async function unlikePost(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('likes')
    .delete()
    .eq('user_id', user.id)
    .eq('post_id', postId)

  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
  await supabase
    .from('posts')
    .update({ likes_count: count ?? 0 })
    .eq('id', postId)

  revalidatePath('/home')
  revalidatePath('/profile', 'layout')
}
