'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bell, User, LogOut, Feather } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import type { Profile } from '@/lib/definitions'

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
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-x-accent font-bold text-white select-none text-sm">
      {name.charAt(0).toUpperCase()}
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

  const navItems = [
    { href: '/home', icon: Home, label: 'ホーム', badge: 0 },
    { href: '/notifications', icon: Bell, label: '通知', badge: unreadCount },
  ]

  return (
    <div className="flex h-full flex-col px-2 py-3 xl:px-4">
      {/* X Logo */}
      <Link
        href="/home"
        className="mb-2 flex h-[52px] w-[52px] items-center justify-center rounded-full transition hover:bg-x-surface"
      >
        <XLogo />
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 rounded-full px-3 py-3 transition hover:bg-x-surface xl:pr-6 ${
                active ? 'font-bold' : 'font-normal'
              }`}
            >
              {/* Icon with optional badge */}
              <span className="relative flex-shrink-0">
                <Icon
                  size={26}
                  strokeWidth={active ? 2.5 : 1.75}
                />
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

        {/* Profile link */}
        <Link
          href={`/profile/${profile.username}`}
          className={`flex items-center gap-4 rounded-full px-3 py-3 transition hover:bg-x-surface xl:pr-6 ${
            pathname.startsWith('/profile') ? 'font-bold' : 'font-normal'
          }`}
        >
          <User
            size={26}
            strokeWidth={pathname.startsWith('/profile') ? 2.5 : 1.75}
            className="flex-shrink-0"
          />
          <span className="hidden xl:block text-xl">プロフィール</span>
        </Link>
      </nav>

      {/* Post button */}
      <div className="mt-4">
        <Link
          href="/home"
          className="flex items-center justify-center gap-2 rounded-full bg-x-accent px-4 py-3 font-bold text-white transition hover:bg-[#1a8cd8] xl:w-full"
        >
          <Feather size={20} className="xl:hidden" aria-hidden="true" />
          <span className="hidden xl:block">投稿する</span>
        </Link>
      </div>

      {/* User account + logout */}
      <div className="mt-auto">
        <div className="group relative">
          <div className="flex cursor-pointer items-center gap-3 rounded-full px-3 py-3 transition hover:bg-x-surface xl:pr-4">
            <Avatar url={profile.avatar_url} name={profile.display_name} />
            <div className="hidden xl:block min-w-0">
              <p className="truncate font-bold text-sm text-x-text">
                {profile.display_name}
              </p>
              <p className="truncate text-sm text-x-muted">
                @{profile.username}
              </p>
            </div>
          </div>

          {/* Logout dropdown */}
          <div className="absolute bottom-full left-0 mb-1 hidden w-max rounded-2xl border border-x-border bg-x-bg py-1 shadow-xl group-hover:block">
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-x-text transition hover:bg-x-surface"
              >
                <LogOut size={16} />
                <span>@{profile.username} からログアウト</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
