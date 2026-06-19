'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Bell, Mail } from 'lucide-react'

export function MobileNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname()

  const items = [
    { href: '/home',          icon: Home,   badge: 0 },
    { href: '/explore',       icon: Search, badge: 0 },
    { href: '/notifications', icon: Bell,   badge: unreadCount },
    { href: '/messages',      icon: Mail,   badge: 0 },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-x-border bg-x-bg">
      {items.map(({ href, icon: Icon, badge }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 items-center justify-center py-3 transition hover:bg-x-surface"
          >
            <span className="relative">
              <Icon size={24} strokeWidth={active ? 2.5 : 1.75} className={active ? 'text-x-text' : 'text-x-muted'} />
              {badge > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-x-accent px-0.5 text-[10px] font-bold text-white leading-none">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
