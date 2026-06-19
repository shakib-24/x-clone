'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor, ChevronRight, Bell, Shield, User, Palette, Globe } from 'lucide-react'

type Theme = 'dark' | 'light' | 'system'

function ThemeOption({
  value,
  current,
  icon: Icon,
  label,
  description,
  onSelect,
}: {
  value: Theme
  current: Theme
  icon: React.ElementType
  label: string
  description: string
  onSelect: (t: Theme) => void
}) {
  const active = value === current
  return (
    <button
      onClick={() => onSelect(value)}
      className={`flex w-full items-center gap-4 px-4 py-4 transition hover:bg-x-surface text-left ${active ? 'bg-x-surface' : ''}`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? 'bg-x-accent text-white' : 'bg-x-border text-x-muted'}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-x-text">{label}</p>
        <p className="text-xs text-x-muted">{description}</p>
      </div>
      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-x-accent' : 'border-x-muted'}`}>
        {active && <div className="h-2.5 w-2.5 rounded-full bg-x-accent" />}
      </div>
    </button>
  )
}

const SETTING_SECTIONS = [
  { icon: User,    label: 'アカウント',             description: 'アカウント情報の確認と変更' },
  { icon: Bell,    label: '通知',                  description: '通知の設定' },
  { icon: Shield,  label: 'プライバシーとセキュリティ', description: 'プライバシーとデータの管理' },
  { icon: Globe,   label: 'アクセシビリティ',        description: 'ディスプレイとアクセシビリティの設定' },
]

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('x-theme') as Theme | null
    if (saved) setTheme(saved)
    else setTheme('dark')
  }, [])

  const applyTheme = (t: Theme) => {
    setTheme(t)
    localStorage.setItem('x-theme', t)
    const root = document.documentElement
    if (t === 'light') {
      root.setAttribute('data-theme', 'light')
    } else if (t === 'dark') {
      root.removeAttribute('data-theme')
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) root.removeAttribute('data-theme')
      else root.setAttribute('data-theme', 'light')
    }
  }

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-x-border bg-x-bg/80 backdrop-blur-md px-4 py-3">
        <h1 className="text-xl font-bold text-x-text">設定</h1>
      </header>

      {/* Appearance / Theme */}
      <section className="border-b border-x-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <Palette size={20} className="text-x-muted" />
          <div>
            <h2 className="font-bold text-x-text">表示</h2>
            <p className="text-xs text-x-muted">テーマカラーと背景</p>
          </div>
        </div>

        <div className="border-t border-x-border">
          <ThemeOption
            value="dark"
            current={theme}
            icon={Moon}
            label="ダークモード"
            description="暗い背景でコンテンツを表示します"
            onSelect={applyTheme}
          />
          <ThemeOption
            value="light"
            current={theme}
            icon={Sun}
            label="ライトモード"
            description="明るい背景でコンテンツを表示します"
            onSelect={applyTheme}
          />
          <ThemeOption
            value="system"
            current={theme}
            icon={Monitor}
            label="システム設定に合わせる"
            description="端末の設定に自動で合わせます"
            onSelect={applyTheme}
          />
        </div>
      </section>

      {/* Other settings (UI only) */}
      <section>
        {SETTING_SECTIONS.map(({ icon: Icon, label, description }) => (
          <button
            key={label}
            className="flex w-full items-center gap-4 px-4 py-4 transition hover:bg-x-surface border-b border-x-border"
          >
            <Icon size={20} className="text-x-text flex-shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-sm text-x-text">{label}</p>
              <p className="text-xs text-x-muted">{description}</p>
            </div>
            <ChevronRight size={16} className="text-x-muted flex-shrink-0" />
          </button>
        ))}
      </section>
    </div>
  )
}
