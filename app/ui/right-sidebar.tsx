import Link from 'next/link'
import { Search, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const TRENDING = [
  { tag: '#Tokyo',       category: 'トレンド',    posts: '42.3K' },
  { tag: '#NextJS',      category: 'テクノロジー', posts: '18.1K' },
  { tag: '#Japan',       category: 'トレンド',    posts: '95.7K' },
  { tag: '#Programming', category: 'テクノロジー', posts: '31.4K' },
  { tag: '#Supabase',    category: 'テクノロジー', posts: '7.2K'  },
]

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return <img src={url} alt={name} width={40} height={40} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
  }
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-x-accent font-bold text-white text-sm select-none">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export async function RightSidebar({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: suggestions } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .neq('id', userId)
    .limit(3)

  return (
    <div className="w-[350px] flex-shrink-0 px-6 py-2 hidden lg:block">
      <div className="sticky top-0 pt-2 space-y-4">

        {/* Search bar */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-x-muted" />
          <Link
            href="/explore"
            className="block w-full rounded-full bg-x-surface py-3 pl-10 pr-4 text-sm text-x-muted border border-transparent hover:border-x-accent transition"
          >
            検索
          </Link>
        </div>

        {/* Trending */}
        <div className="rounded-2xl bg-x-surface overflow-hidden">
          <h2 className="px-4 pt-4 pb-2 text-xl font-bold text-x-text">いまどうしてる？</h2>
          {TRENDING.map((t) => (
            <Link
              key={t.tag}
              href={`/explore?q=${encodeURIComponent(t.tag)}`}
              className="flex items-start justify-between px-4 py-3 hover:bg-x-border/20 transition"
            >
              <div>
                <p className="text-xs text-x-muted">{t.category} · トレンド</p>
                <p className="font-bold text-sm text-x-text">{t.tag}</p>
                <p className="text-xs text-x-muted">{t.posts} 件のポスト</p>
              </div>
              <TrendingUp size={16} className="text-x-muted mt-1 flex-shrink-0" />
            </Link>
          ))}
          <Link href="/explore" className="block px-4 py-3 text-sm text-x-accent hover:bg-x-border/20 transition">
            もっと見る
          </Link>
        </div>

        {/* Who to follow */}
        {suggestions && suggestions.length > 0 && (
          <div className="rounded-2xl bg-x-surface overflow-hidden">
            <h2 className="px-4 pt-4 pb-2 text-xl font-bold text-x-text">おすすめユーザー</h2>
            {suggestions.map((p) => (
              <Link
                key={p.id}
                href={`/profile/${p.username}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-x-border/20 transition"
              >
                <Avatar url={p.avatar_url} name={p.display_name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-sm text-x-text leading-tight">{p.display_name}</p>
                  <p className="truncate text-sm text-x-muted">@{p.username}</p>
                </div>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="flex-shrink-0 rounded-full border border-x-text px-4 py-1 text-sm font-bold text-x-text transition hover:bg-x-text hover:text-x-bg"
                >
                  フォロー
                </button>
              </Link>
            ))}
            <Link href="/explore" className="block px-4 py-3 text-sm text-x-accent hover:bg-x-border/20 transition">
              もっと見る
            </Link>
          </div>
        )}

        {/* Footer links */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-1">
          {['利用規約', 'プライバシーポリシー', 'Cookieポリシー', 'アクセシビリティ'].map((l) => (
            <span key={l} className="text-xs text-x-muted hover:underline cursor-pointer">{l}</span>
          ))}
          <span className="text-xs text-x-muted">© 2025 X Clone</span>
        </div>
      </div>
    </div>
  )
}
