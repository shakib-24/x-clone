import { PostFeedSkeleton } from '@/app/ui/post-skeleton'

export default function ProfileLoading() {
  return (
    <div className="animate-pulse">
      {/* Banner */}
      <div className="h-[150px] bg-x-surface" />

      {/* Avatar + button row */}
      <div className="flex items-end justify-between px-4 -mt-12 mb-3">
        <div className="h-20 w-20 rounded-full border-4 border-x-bg bg-x-border" />
        <div className="h-9 w-36 rounded-full bg-x-surface" />
      </div>

      {/* Name / username */}
      <div className="px-4 pb-4 space-y-2">
        <div className="h-5 w-40 rounded bg-x-surface" />
        <div className="h-4 w-24 rounded bg-x-surface" />
        <div className="h-4 w-full rounded bg-x-surface" />
        <div className="h-4 w-3/4 rounded bg-x-surface" />
        <div className="h-4 w-32 rounded bg-x-surface" />
      </div>

      {/* Tab */}
      <div className="border-b border-x-border h-[49px]" />

      <PostFeedSkeleton />
    </div>
  )
}
