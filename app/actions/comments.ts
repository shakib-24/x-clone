'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createComment(postId: string, content: string) {
  if (!content.trim()) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('comments')
    .insert({ user_id: user.id, post_id: postId, content: content.trim() })

  revalidatePath('/home')
  revalidatePath('/profile', 'layout')
}

export async function getComments(postId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comments')
    .select('id, user_id, post_id, content, created_at, profile:profiles(username, display_name, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .limit(20)
  return data ?? []
}
