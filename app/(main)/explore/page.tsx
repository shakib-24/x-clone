import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/app/ui/post-card'
import type { Post } from '@/lib/definitions'

const TRENDING = [
  { tag: '#Tokyo',       category: 'トレンド',    posts: '42.3K' },
  { tag: '#NextJS',      category: 'テクノロジー', posts: '18.1K' },
  { tag: '#Japan',       category: 'トレンド',    posts: '95.7K' },
  { tag: '#Programming', category: 'テクノロジー', posts: '31.4K' },
  { tag: '#Supabase',    category: 'テクノロジー', posts: '7.2K'  },
  { tag: '#React',       category: 'テクノロジー', posts: '24.8K' },
  { tag: '#TypeScript',  category: 'テクノロジー', posts: '15.6K' },
  { tag: '#Anime',       category: 'エンタメ',    posts: '88.2K' },
]

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let posts: (Post & { user_has_liked: boolean })[] = []

  if (q) {
    const { data: rawPosts } = await supabase
      .from('posts')
      .select('id, user_id, content, likes_count, comments_count, image_url, created_at, profile:profiles(username, display_name, avatar_url)')
      .ilike('content', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    const rawList = (rawPosts ?? []) as unknown as Post[]

    let likedSet = new Set<string>()
    if (user && rawList.length > 0) {
      const { data: likes } = await supabase
        .from('likes').select('post_id').eq('user_id', user.id)
        .in('post_id', rawList.map(p => p.id))
      likedSet = new Set((likes ?? []).map(l => l.post_id))
    }

    posts = rawList.map(p => ({ ...p, user_has_liked: likedSet.has(p.id) }))
  }

  return (
    <div>
      {/* Sticky search header */}
      <div className="sticky top-0 z-10 bg-x-bg/80 backdrop-blur-md px-4 py-3 border-b border-x-border">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-x-muted" />
          <form method="GET" action="/explore">
            <input
              name="q"
              defaultValue={q ?? ''}
              placeholder="検索"
              className="w-full rounded-full bg-x-surface py-3 pl-10 pr-4 text-sm text-x-text placeholder-x-muted border border-transparent focus:border-x-accent focus:bg-x-bg outline-none transition"
            />
          </form>
        </div>
      </div>

      {q ? (
        /* Search results */
        <div>
          <div className="px-4 py-3 border-b border-x-border">
            <h2 className="font-bold text-x-text">「{q}」の検索結果</h2>
          </div>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-center px-8">
              <Search size={40} className="mb-4 text-x-muted" />
              <p className="text-xl font-bold text-x-text">「{q}」に一致する結果がありません</p>
              <p className="mt-1 text-sm text-x-muted">スペルを確認するか、別のキーワードで試してください</p>
            </div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>
      ) : (
        /* Trending grid */
        <div>
          <div className="px-4 py-4 border-b border-x-border">
            <h2 className="text-xl font-bold text-x-text">いまどうしてる？</h2>
          </div>

          <div className="grid grid-cols-2">
            {TRENDING.map((t, i) => (
              <a
                key={t.tag}
                href={`/explore?q=${encodeURIComponent(t.tag)}`}
                className={`p-4 hover:bg-x-surface transition border-b border-x-border ${i % 2 === 0 ? 'border-r' : ''}`}
              >
                <p className="text-xs text-x-muted">{t.category} · トレンド</p>
                <p className="font-bold text-x-text mt-0.5">{t.tag}</p>
                <p className="text-xs text-x-muted mt-0.5">{t.posts} 件のポスト</p>
              </a>
            ))}
          </div>

          <div className="px-4 py-4 border-b border-x-border">
            <h2 className="text-xl font-bold text-x-text">テクノロジー</h2>
          </div>
          <div className="px-4 py-3 text-sm text-x-muted">
            <p>テクノロジーに関するトレンドトピックを検索してみましょう。</p>
          </div>
        </div>
      )}
    </div>
  )
}
