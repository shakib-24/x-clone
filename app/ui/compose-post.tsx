'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { ImageIcon, Smile } from 'lucide-react'
import { createPost } from '@/app/actions/posts'
import type { Profile } from '@/lib/definitions'

const MAX_CHARS = 280

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
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-x-accent font-bold text-white select-none">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function CharCounter({ remaining }: { remaining: number }) {
  const total = MAX_CHARS
  const used = total - remaining
  const pct = Math.min(used / total, 1)
  const r = 9
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - pct)
  const isOverLimit = remaining < 0
  const isNearLimit = remaining <= 20

  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      {/* track */}
      <circle cx="13" cy="13" r={r} fill="none" strokeWidth="2" className="stroke-x-border" />
      {/* fill */}
      <circle
        cx="13"
        cy="13"
        r={r}
        fill="none"
        strokeWidth="2"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        transform="rotate(-90 13 13)"
        className={
          isOverLimit
            ? 'stroke-x-danger'
            : isNearLimit
            ? 'stroke-yellow-400'
            : 'stroke-x-accent'
        }
      />
      {isNearLimit && (
        <text
          x="13"
          y="17"
          textAnchor="middle"
          fontSize="8"
          className={`font-bold ${isOverLimit ? 'fill-x-danger' : 'fill-x-muted'}`}
          fill="currentColor"
        >
          {remaining}
        </text>
      )}
    </svg>
  )
}

export function ComposePost({
  profile,
}: {
  profile: Pick<Profile, 'display_name' | 'avatar_url'>
}) {
  const [content, setContent] = useState('')
  const [formKey, setFormKey] = useState(0)
  const [state, formAction, pending] = useActionState(createPost, undefined)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (state?.success) {
      setContent('')
      setFormKey((k) => k + 1)
    }
  }, [state?.success])

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [content])

  const remaining = MAX_CHARS - content.length
  const isOverLimit = remaining < 0
  const isEmpty = content.trim().length === 0
  const showCounter = content.length > 0

  return (
    <div className="border-b border-x-border px-4 py-3">
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <Avatar url={profile.avatar_url} name={profile.display_name} />
        </div>

        <div className="flex-1 min-w-0">
          <form key={formKey} action={formAction}>
            <textarea
              ref={textareaRef}
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="いまどうしてる？"
              rows={1}
              maxLength={MAX_CHARS + 10}
              className="mt-2 w-full resize-none overflow-hidden bg-transparent text-xl text-x-text placeholder-x-muted outline-none leading-normal"
            />

            {state?.errors?.content && (
              <p className="mb-2 text-sm text-x-danger">
                {state.errors.content[0]}
              </p>
            )}
            {state?.message && !state.success && (
              <p className="mb-2 text-sm text-x-danger">{state.message}</p>
            )}

            <div className="mt-2 flex items-center justify-between border-t border-x-border pt-2">
              {/* Toolbar icons */}
              <div className="flex items-center gap-1 -ml-1">
                <button
                  type="button"
                  aria-label="画像を追加"
                  className="rounded-full p-2 text-x-accent transition hover:bg-x-accent/10"
                >
                  <ImageIcon size={18} />
                </button>
                <button
                  type="button"
                  aria-label="絵文字を追加"
                  className="rounded-full p-2 text-x-accent transition hover:bg-x-accent/10"
                >
                  <Smile size={18} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {showCounter && (
                  <CharCounter remaining={remaining} />
                )}
                <button
                  type="submit"
                  disabled={pending || isEmpty || isOverLimit}
                  className="rounded-full bg-x-accent px-5 py-1.5 font-bold text-sm text-white transition hover:bg-[#1a8cd8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? '投稿中...' : '投稿する'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
