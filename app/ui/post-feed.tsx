import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/app/ui/post-card'
import type { Post } from '@/lib/definitions'

type PostWithLike = Post & { user_has_liked: boolean }

export async function PostFeed({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: rawPosts } = await supabase
    .from('posts')
    .select(
      'id, user_id, content, likes_count, comments_count, image_url, created_at, profile:profiles(username, display_name, avatar_url)'
    )
    .order('created_at', { ascending: false })
    .limit(20)

  const posts = (rawPosts ?? []) as unknown as Post[]

  const postIds = posts.map((p) => p.id)
  const { data: userLikes } = postIds.length
    ? await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds)
    : { data: [] }

  const likedSet = new Set((userLikes ?? []).map((l) => l.post_id))

  const postsWithLikes: PostWithLike[] = posts.map((p) => ({
    ...p,
    user_has_liked: likedSet.has(p.id),
  }))

  if (postsWithLikes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-x-muted">
        <p className="text-lg font-bold text-x-text">まだ投稿がありません</p>
        <p className="mt-1 text-sm">最初の投稿をしてみましょう！</p>
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
