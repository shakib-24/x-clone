'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ProfileUpdateSchema, type ActionState } from '@/lib/definitions'

export async function updateProfile(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = ProfileUpdateSchema.safeParse({
    display_name: formData.get('display_name'),
    bio: formData.get('bio') || undefined,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: validated.data.display_name,
      bio: validated.data.bio ?? null,
    })
    .eq('id', user.id)

  if (error) return { message: 'プロフィールの更新に失敗しました' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  revalidatePath('/home')
  if (profile) revalidatePath(`/profile/${profile.username}`)

  return { success: true }
}
