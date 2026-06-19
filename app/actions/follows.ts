'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function followUser(followingId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: followingId })

  revalidatePath('/profile', 'layout')
  revalidatePath('/notifications')
}

export async function unfollowUser(followingId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  revalidatePath('/profile', 'layout')
}
