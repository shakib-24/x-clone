import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/app/ui/sidebar'
import { RightSidebar } from '@/app/ui/right-sidebar'
import { MobileNav } from '@/app/ui/mobile-nav'
import type { Profile } from '@/lib/definitions'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { count: unreadCount }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false),
  ])

  if (!profile) redirect('/api/auth/signout')

  return (
    <div className="flex min-h-screen justify-center">
      {/* Left sidebar */}
      <aside className="hidden md:block sticky top-0 h-screen w-[72px] xl:w-[275px] flex-shrink-0 border-r border-x-border overflow-hidden">
        <Sidebar profile={profile as Profile} unreadCount={unreadCount ?? 0} />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 max-w-[600px] min-h-screen border-r border-x-border pb-16 md:pb-0">
        {children}
      </main>

      {/* Right sidebar */}
      <RightSidebar userId={user.id} />

      {/* Mobile bottom nav */}
      <MobileNav unreadCount={unreadCount ?? 0} />
    </div>
  )
}
