'use client'

import { useActionState, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { updateProfile } from '@/app/actions/profile'
import type { Profile } from '@/lib/definitions'

const BIO_MAX = 160
const NAME_MAX = 50

export function EditProfileModal({
  profile,
  onClose,
}: {
  profile: Profile
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [displayName, setDisplayName] = useState(profile.display_name)

  useEffect(() => {
    if (state?.success) onClose()
  }, [state?.success, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[598px] mx-4 rounded-2xl border border-x-border bg-x-bg shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center gap-6 px-4 py-3 border-b border-x-border">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-x-surface"
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
          <h2 className="flex-1 font-bold text-xl text-x-text">プロフィールを編集</h2>
          <button
            type="submit"
            form="edit-profile-form"
            disabled={pending || displayName.trim().length === 0}
            className="rounded-full bg-x-text px-5 py-1.5 font-bold text-sm text-x-bg transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pending ? '保存中...' : '保存'}
          </button>
        </div>

        {/* Banner + Avatar preview */}
        <div className="relative">
          <div className="h-[120px] bg-x-surface" />
          <div className="absolute bottom-0 left-4 translate-y-1/2">
            <div className="h-20 w-20 rounded-full border-4 border-x-bg bg-x-accent flex items-center justify-center text-white font-bold text-2xl select-none">
              {displayName.trim().charAt(0).toUpperCase() || profile.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Form */}
        <form id="edit-profile-form" action={formAction} className="px-4 pt-14 pb-4 space-y-4">
          {state?.message && (
            <p className="text-sm text-x-danger">{state.message}</p>
          )}

          {/* Display name */}
          <div className="relative rounded-md border border-x-border focus-within:border-x-accent transition">
            <label className="absolute left-3 top-2 text-xs text-x-muted">
              表示名
              <span className="ml-1 text-x-danger">*</span>
            </label>
            <input
              name="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={NAME_MAX}
              className="w-full bg-transparent px-3 pb-2 pt-7 text-x-text outline-none"
            />
            <span className="absolute right-3 bottom-2 text-xs text-x-muted">
              {NAME_MAX - displayName.length}
            </span>
          </div>
          {state?.errors?.display_name && (
            <p className="text-sm text-x-danger">{state.errors.display_name[0]}</p>
          )}

          {/* Bio */}
          <div className="relative rounded-md border border-x-border focus-within:border-x-accent transition">
            <label className="absolute left-3 top-2 text-xs text-x-muted">自己紹介</label>
            <textarea
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={BIO_MAX + 10}
              className="w-full resize-none bg-transparent px-3 pb-2 pt-7 text-x-text outline-none"
              placeholder="自己紹介を入力してください"
            />
            <span
              className={`absolute right-3 bottom-2 text-xs ${
                bio.length > BIO_MAX ? 'text-x-danger' : 'text-x-muted'
              }`}
            >
              {BIO_MAX - bio.length}
            </span>
          </div>
          {state?.errors?.bio && (
            <p className="text-sm text-x-danger">{state.errors.bio[0]}</p>
          )}
        </form>
      </div>
    </div>
  )
}
