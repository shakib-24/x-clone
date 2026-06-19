'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import {
  Home, Bell, User, LogOut, Feather,
  Search, Mail, Bookmark, Settings, MoreHorizontal,
} from 'lucide-react'
import { logout } from '@/app/actions/auth'
import type { Profile } from '@/lib/definitions'

function Avatar({ url, name }: { url: string | null; name: string | null }) {
  if (url) {
    return (
      <img src={url} alt={name ?? 'User'} width={40} height={40}
        className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
    )
  }
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-x-accent font-bold text-white select-none text-sm">
      {(name ?? '?').charAt(0).toUpperCase()}
    </div>
  )
}

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className="h-7 w-7">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.736-8.853L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function Sidebar({
  profile,
  unreadCount = 0,
}: {
  profile: Profile
  unreadCount?: number
}) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const navItems = [
    { href: '/home',      icon: Home,     label: 'ホーム',    badge: 0 },
    { href: '/explore',   icon: Search,   label: '話題を検索', badge: 0 },
    { href: '/notifications', icon: Bell, label: '通知',      badge: unreadCount },
    { href: '/messages',  icon: Mail,     label: 'メッセージ', badge: 0 },
    { href: '/bookmarks', icon: Bookmark, label: 'ブックマーク', badge: 0 },
    { href: `/profile/${profile.username}`, icon: User, label: 'プロフィール', badge: 0 },
    { href: '/settings',  icon: Settings, label: '設定',       badge: 0 },
  ]

  return (
    <div className="flex h-screen flex-col px-2 py-3 xl:px-4">
      {/* X Logo */}
      <Link
        href="/home"
        className="mb-2 flex h-[52px] w-[52px] items-center justify-center rounded-full transition hover:bg-x-surface"
      >
        <XLogo />
      </Link>

      {/* Nav — scrollable, fills available space */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href || (href !== '/home' && pathname.startsWith(href) && href !== '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-4 rounded-full px-3 py-3 transition hover:bg-x-surface xl:pr-6 ${
                  active ? 'font-bold' : 'font-normal'
                }`}
              >
                <span className="relative flex-shrink-0">
                  <Icon size={26} strokeWidth={active ? 2.5 : 1.75} />
                  {badge > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-x-accent px-0.5 text-[10px] font-bold text-white leading-none">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </span>
                <span className="hidden xl:block text-xl">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Compose button */}
        <div className="mt-4">
          <Link
            href="/home"
            className="flex items-center justify-center gap-2 rounded-full bg-x-accent px-4 py-3 font-bold text-white transition hover:bg-[#1a8cd8] xl:w-full"
          >
            <Feather size={20} className="xl:hidden" aria-hidden="true" />
            <span className="hidden xl:block">投稿する</span>
          </Link>
        </div>
      </div>

      {/* User card — always visible at bottom */}
      <div className="relative mt-2 flex-shrink-0" ref={menuRef}>
        <button
          onClick={() => setShowMenu((v) => !v)}
          className="flex w-full items-center gap-3 rounded-full px-3 py-3 transition hover:bg-x-surface"
        >
          <Avatar url={profile.avatar_url} name={profile.display_name} />
          <div className="hidden xl:block min-w-0 flex-1 text-left">
            <p className="truncate font-bold text-sm text-x-text leading-tight">
              {profile.display_name}
            </p>
            <p className="truncate text-sm text-x-muted leading-tight">
              @{profile.username}
            </p>
          </div>
          <MoreHorizontal size={18} className="hidden xl:block flex-shrink-0 text-x-muted" />
        </button>

        {showMenu && (
          <div className="absolute bottom-full left-0 z-50 mb-1 w-max rounded-2xl border border-x-border bg-x-bg py-1 shadow-xl">
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 whitespace-nowrap px-4 py-3 text-sm font-bold text-x-text transition hover:bg-x-surface"
              >
                <LogOut size={16} />
                @{profile.username} からログアウト
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
