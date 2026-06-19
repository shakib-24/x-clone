import { redirect } from 'next/navigation'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NotificationItem } from '@/app/ui/notification-item'
import { NotificationsRefresh } from '@/app/ui/notifications-refresh'
import type { Notification } from '@/lib/definitions'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: raw } = await supabase
    .from('notifications')
    .select(
      `id, user_id, actor_id, type, post_id, read, created_at,
       actor:profiles!actor_id(username, display_name, avatar_url),
       post:posts!post_id(content)`
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const notifications = (raw ?? []) as unknown as Notification[]

  return (
    <div>
      {/* router.refresh() で layout の未読バッジをクリア */}
      <NotificationsRefresh />

      <header className="sticky top-0 z-10 border-b border-x-border bg-black/80 backdrop-blur-md px-4 py-3">
        <h1 className="text-xl font-bold text-x-text">通知</h1>
      </header>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <Bell size={40} className="mb-4 text-x-muted" />
          <p className="text-xl font-bold text-x-text">通知はありません</p>
          <p className="mt-1 text-sm text-x-muted">
            いいねやフォローがあるとここに表示されます
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((n) => (
            <NotificationItem key={n.id} n={n} />
          ))}
        </div>
      )}
    </div>
  )
}
