import Link from 'next/link'
import { Heart, UserPlus } from 'lucide-react'
import { formatTimeAgo } from '@/lib/utils'
import type { Notification } from '@/lib/definitions'

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
      />
    )
  }
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-x-accent font-bold text-white select-none text-sm">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export function NotificationItem({ n }: { n: Notification }) {
  const isLike = n.type === 'like'

  return (
    <Link
      href={`/profile/${n.actor.username}`}
      className={`flex gap-4 border-b border-x-border px-4 py-4 transition hover:bg-white/[0.03] ${
        !n.read ? 'bg-x-accent/5' : ''
      }`}
    >
      {/* Type icon */}
      <div className="flex-shrink-0 pt-0.5">
        {isLike ? (
          <Heart size={28} className="text-x-like" fill="currentColor" />
        ) : (
          <UserPlus size={28} className="text-x-accent" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <Avatar url={n.actor.avatar_url} name={n.actor.display_name} />

        <p className="mt-2 text-x-text text-sm">
          <span className="font-bold">{n.actor.display_name}</span>
          {' '}
          {isLike ? 'があなたの投稿にいいねしました' : 'があなたをフォローしました'}
        </p>

        {isLike && n.post && (
          <p className="mt-1 text-x-muted text-sm line-clamp-2">
            {n.post.content}
          </p>
        )}

        <p className="mt-1 text-xs text-x-muted">
          {formatTimeAgo(n.created_at)}
        </p>
      </div>
    </Link>
  )
}
