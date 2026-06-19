import { Mail, Search } from 'lucide-react'

const DUMMY_DMS = [
  { id: 1, name: 'Taro Yamamoto', handle: 'taro_y', avatar: null, preview: 'よろしくお願いします！', time: '2h', unread: true },
  { id: 2, name: 'Hanako Suzuki', handle: 'hanako_s', avatar: null, preview: 'ありがとうございました 😊', time: '5h', unread: false },
  { id: 3, name: 'Next.js Japan', handle: 'nextjs_jp', avatar: null, preview: 'イベントの詳細をお知らせします', time: '1d', unread: true },
  { id: 4, name: 'Dev Community', handle: 'dev_com', avatar: null, preview: '新しい記事が公開されました', time: '2d', unread: false },
]

function AvatarPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-x-accent font-bold text-white select-none">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function MessagesPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-x-border bg-x-bg/80 backdrop-blur-md px-4 py-3">
        <h1 className="text-xl font-bold text-x-text">メッセージ</h1>
      </header>

      {/* Search */}
      <div className="px-4 py-3 border-b border-x-border">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-x-muted" />
          <input
            placeholder="ダイレクトメッセージを検索"
            className="w-full rounded-full bg-x-surface py-2.5 pl-10 pr-4 text-sm text-x-text placeholder-x-muted outline-none"
          />
        </div>
      </div>

      {/* DM list */}
      <div>
        {DUMMY_DMS.map((dm) => (
          <div
            key={dm.id}
            className="flex items-start gap-3 px-4 py-4 cursor-pointer hover:bg-x-surface transition border-b border-x-border"
          >
            <AvatarPlaceholder name={dm.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-1 min-w-0">
                  <span className="font-bold text-sm text-x-text truncate">{dm.name}</span>
                  <span className="text-sm text-x-muted truncate">@{dm.handle}</span>
                </div>
                <span className="text-xs text-x-muted flex-shrink-0">{dm.time}</span>
              </div>
              <p className={`text-sm mt-0.5 truncate ${dm.unread ? 'text-x-text font-medium' : 'text-x-muted'}`}>
                {dm.preview}
              </p>
            </div>
            {dm.unread && (
              <div className="flex-shrink-0 h-2 w-2 rounded-full bg-x-accent mt-2" />
            )}
          </div>
        ))}
      </div>

      {/* Empty state hint */}
      <div className="flex flex-col items-center py-16 px-8 text-center">
        <Mail size={40} className="mb-4 text-x-muted" />
        <p className="text-xl font-bold text-x-text">新しいメッセージを送る</p>
        <p className="mt-1 text-sm text-x-muted">
          フォローしているユーザーにプライベートメッセージを送ることができます
        </p>
        <button className="mt-4 rounded-full bg-x-accent px-5 py-2 font-bold text-sm text-white transition hover:bg-[#1a8cd8]">
          新しいメッセージ
        </button>
      </div>
    </div>
  )
}
