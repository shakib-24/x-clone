export function PostSkeleton() {
  return (
    <div className="flex gap-3 border-b border-x-border px-4 py-3 animate-pulse">
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-x-surface" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="flex gap-2">
          <div className="h-4 w-24 rounded bg-x-surface" />
          <div className="h-4 w-16 rounded bg-x-surface" />
        </div>
        <div className="h-4 w-full rounded bg-x-surface" />
        <div className="h-4 w-3/4 rounded bg-x-surface" />
        <div className="flex gap-6 pt-1">
          <div className="h-4 w-8 rounded bg-x-surface" />
          <div className="h-4 w-8 rounded bg-x-surface" />
        </div>
      </div>
    </div>
  )
}

export function PostFeedSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  )
}
