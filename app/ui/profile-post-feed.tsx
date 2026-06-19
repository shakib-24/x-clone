import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/app/ui/post-card'
import type { Post } from '@/lib/definitions'

type PostWithLike = Post & { user_has_liked: boolean }

export async function ProfilePostFeed({
  profileId,
  currentUserId,
}: {
  profileId: string
  currentUserId: string | null
}) {
  const supabase = await createClient()

  const { data: rawPosts } = await supabase
    .from('posts')
    .select(
      'id, user_id, content, likes_count, created_at, profile:profiles(username, display_name, avatar_url)'
    )
    .eq('user_id', profileId)
    .order('created_at', { ascending: false })
    .limit(20)

  const posts = (rawPosts ?? []) as unknown as Post[]

  let likedSet = new Set<string>()
  if (currentUserId && posts.length > 0) {
    const { data: userLikes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', currentUserId)
      .in('post_id', posts.map((p) => p.id))
    likedSet = new Set((userLikes ?? []).map((l) => l.post_id))
  }

  const postsWithLikes: PostWithLike[] = posts.map((p) => ({
    ...p,
    user_has_liked: likedSet.has(p.id),
  }))

  if (postsWithLikes.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <p className="text-lg font-bold text-x-text">まだ投稿がありません</p>
        <p className="mt-1 text-sm text-x-muted">投稿すると、ここに表示されます。</p>
      </div>
    )
  }

  return (
    <div>
      {postsWithLikes.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
