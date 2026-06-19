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

  // Upload image if provided
  let imageUrl: string | null = null
  const imageFile = formData.get('image') as File | null
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filePath = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, imageFile, { contentType: imageFile.type, upsert: false })
    if (uploadError) return { message: '画像のアップロードに失敗しました' }
    const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(filePath)
    imageUrl = publicUrl
  }

  const { error } = await supabase
    .from('posts')
    .insert({ user_id: user.id, content: validated.data.content, image_url: imageUrl })

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
