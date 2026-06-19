'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// router.refresh() でレイアウトを再取得し、未読バッジをクリアする
export function NotificationsRefresh() {
  const router = useRouter()
  useEffect(() => {
    router.refresh()
  }, [router])
  return null
}
