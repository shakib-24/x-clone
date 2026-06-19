'use client'

import { useOptimistic, useTransition, useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { likePost, unlikePost } from '@/app/actions/posts'
import { createComment, getComments } from '@/app/actions/comments'
import { formatTimeAgo } from '@/lib/utils'
import type { Post, Comment } from '@/lib/definitions'

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

function CommentList({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getComments(postId).then((data) => {
      setComments(data as unknown as Comment[])
      setLoading(false)
    })
  }, [postId])

  if (loading) {
    return <p className="py-2 text-xs text-x-muted">読み込み中...</p>
  }
  if (comments.length === 0) {
    return <p className="py-2 text-xs text-x-muted">まだコメントはありません</p>
  }
  return (
    <div className="mt-2 space-y-2">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2">
          <Avatar url={c.profile.avatar_url} name={c.profile.display_name} size={24} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-x-text truncate">
                {c.profile.display_name}
              </span>
              <span className="text-xs text-x-muted flex-shrink-0">
                {formatTimeAgo(c.created_at)}
              </span>
            </div>
            <p className="text-xs text-x-text whitespace-pre-wrap break-words leading-snug">
              {c.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PostCard({ post }: { post: PostWithLike }) {
  const [, startTransition] = useTransition()

  // Like state
  const [optimisticLike, addOptimisticLike] = useOptimistic(
    { liked: post.user_has_liked, count: post.likes_count },
    (state, action: 'like' | 'unlike') =>
      action === 'like'
        ? { liked: true, count: state.count + 1 }
        : { liked: false, count: state.count - 1 }
  )

  // Comment state
  const [optimisticCommentCount, addOptimisticCommentCount] = useOptimistic(
    post.comments_count,
    (state, _: 'add') => state + 1
  )
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentPending, setCommentPending] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  const handleLike = () => {
    startTransition(async () => {
      addOptimisticLike(optimisticLike.liked ? 'unlike' : 'like')
      if (optimisticLike.liked) {
        await unlikePost(post.id)
      } else {
        await likePost(post.id)
      }
    })
  }

  const handleToggleComments = () => {
    setShowComments((v) => !v)
    if (!showComments) {
      setTimeout(() => commentInputRef.current?.focus(), 50)
    }
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = commentText.trim()
    if (!text || commentPending) return
    setCommentPending(true)
    startTransition(async () => {
      addOptimisticCommentCount('add')
      setCommentText('')
      await createComment(post.id, text)
      setCommentPending(false)
    })
  }

  return (
    <article className="border-b border-x-border px-4 py-3 transition hover:bg-white/[0.03]">
      <div className="flex gap-3">
        <Avatar url={post.profile.avatar_url} name={post.profile.display_name} />
        <div className="min-w-0 flex-1">
          {/* Header */}
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

          {/* Content */}
          <p className="mt-1 whitespace-pre-wrap break-words text-x-text leading-normal">
            {post.content}
          </p>

          {/* Image */}
          {post.image_url && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-x-border">
              <img
                src={post.image_url}
                alt="投稿画像"
                className="w-full max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex items-center gap-6">
            <button
              onClick={handleToggleComments}
              className={`flex items-center gap-1.5 transition group ${
                showComments ? 'text-x-accent' : 'text-x-muted hover:text-x-accent'
              }`}
              aria-label="コメントを表示"
            >
              <MessageCircle
                size={18}
                className="transition"
                fill={showComments ? 'currentColor' : 'none'}
              />
              <span className="text-sm">
                {optimisticCommentCount > 0 ? optimisticCommentCount : ''}
              </span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition group ${
                optimisticLike.liked
                  ? 'text-x-like'
                  : 'text-x-muted hover:text-x-like'
              }`}
              aria-label={optimisticLike.liked ? 'いいねを取り消す' : 'いいねする'}
            >
              <Heart
                size={18}
                className="transition"
                fill={optimisticLike.liked ? 'currentColor' : 'none'}
              />
              <span className="text-sm">
                {optimisticLike.count > 0 ? optimisticLike.count : ''}
              </span>
            </button>
          </div>

          {/* Comment section */}
          {showComments && (
            <div className="mt-3 border-t border-x-border pt-3">
              <CommentList postId={post.id} />

              <form onSubmit={handleCommentSubmit} className="mt-3 flex gap-2">
                <textarea
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="コメントを追加..."
                  rows={1}
                  maxLength={280}
                  className="flex-1 resize-none rounded-lg border border-x-border bg-transparent px-3 py-2 text-sm text-x-text placeholder-x-muted outline-none transition focus:border-x-accent leading-normal"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleCommentSubmit(e as unknown as React.FormEvent)
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || commentPending}
                  className="self-end rounded-full bg-x-accent px-4 py-1.5 text-sm font-bold text-white transition hover:bg-[#1a8cd8] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commentPending ? '...' : '返信'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
