import { Bookmark } from 'lucide-react'

export default function BookmarksPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-x-border bg-x-bg/80 backdrop-blur-md px-4 py-3">
        <h1 className="text-xl font-bold text-x-text">ブックマーク</h1>
        <p className="text-xs text-x-muted">@ユーザー</p>
      </header>

      <div className="flex flex-col items-center py-24 px-8 text-center">
        <Bookmark size={40} className="mb-4 text-x-muted" />
        <p className="text-2xl font-bold text-x-text">ポストを保存する</p>
        <p className="mt-2 text-sm text-x-muted max-w-[300px]">
          あとで見返したいポストはブックマークに保存できます。自分だけに表示されます。
        </p>
        <button className="mt-5 rounded-full bg-x-accent px-5 py-2.5 font-bold text-sm text-white transition hover:bg-[#1a8cd8]">
          ポストを探す
        </button>
      </div>
    </div>
  )
}
