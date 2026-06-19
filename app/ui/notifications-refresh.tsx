'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { markAllNotificationsRead } from '@/app/actions/notifications'

export function NotificationsRefresh() {
  const router = useRouter()
  useEffect(() => {
    markAllNotificationsRead().then(() => router.refresh())
  }, [router])
  return null
}
