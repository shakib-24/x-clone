'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-x-surface"
      aria-label="戻る"
    >
      <ArrowLeft size={20} />
    </button>
  )
}
