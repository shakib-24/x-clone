'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function markAllNotificationsRead(userId: string) {
  const supabase = await createClient()

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  revalidatePath('/', 'layout')
}
