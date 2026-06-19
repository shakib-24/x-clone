'use client'

import { useState } from 'react'
import { EditProfileModal } from '@/app/ui/edit-profile-modal'
import type { Profile } from '@/lib/definitions'

export function ProfileEditButton({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-x-border px-4 py-1.5 font-bold text-sm text-x-text transition hover:bg-x-surface"
      >
        プロフィールを編集
      </button>
      {open && (
        <EditProfileModal profile={profile} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
