'use client'

import { useOptimistic, useTransition } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { likePost, unlikePost } from '@/app/actions/posts'
import { formatTimeAgo } from '@/lib/utils'
import type { Post } from '@/lib/definitions'

type PostWithLike = Post & { user_has_liked: boolean }

function Avatar({
  url,
  name,
  size = 40,
}: {
  url: string | null
  name: string
  size?: number
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full bg-x-accent font-bold text-white select-none"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export function PostCard({ post }: { post: PostWithLike }) {
  const [, startTransition] = useTransition()
  const [optimistic, addOptimistic] = useOptimistic(
    { liked: post.user_has_liked, count: post.likes_count },
    (state, action: 'like' | 'unlike') =>
      action === 'like'
        ? { liked: true, count: state.count + 1 }
        : { liked: false, count: state.count - 1 }
  )

  const handleLike = () => {
    startTransition(async () => {
      addOptimistic(optimistic.liked ? 'unlike' : 'like')
      if (optimistic.liked) {
        await unlikePost(post.id)
      } else {
        await likePost(post.id)
      }
    })
  }

  return (
    <article className="flex gap-3 border-b border-x-border px-4 py-3 transition hover:bg-white/[0.03]">
      <Avatar
        url={post.profile.avatar_url}
        name={post.profile.display_name}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0">
          <span className="font-bold text-x-text truncate">
            {post.profile.display_name}
          </span>
          <span className="text-x-muted text-sm truncate">
            @{post.profile.username}
          </span>
          <span className="text-x-muted text-sm">·</span>
          <span className="text-x-muted text-sm flex-shrink-0">
            {formatTimeAgo(post.created_at)}
          </span>
        </div>

        <p className="mt-1 whitespace-pre-wrap break-words text-x-text leading-normal">
          {post.content}
        </p>

        <div className="mt-3 flex items-center gap-6">
          <button className="flex items-center gap-1.5 text-x-muted transition hover:text-x-accent group">
            <MessageCircle
              size={18}
              className="group-hover:stroke-x-accent transition"
            />
            <span className="text-sm">0</span>
          </button>

          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition group ${
              optimistic.liked
                ? 'text-x-like'
                : 'text-x-muted hover:text-x-like'
            }`}
            aria-label={optimistic.liked ? 'いいねを取り消す' : 'いいねする'}
          >
            <Heart
              size={18}
              className="transition"
              fill={optimistic.liked ? 'currentColor' : 'none'}
            />
            <span className="text-sm">{optimistic.count > 0 ? optimistic.count : ''}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
