import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BackButton } from '@/app/ui/back-button'
import { ProfileEditButton } from '@/app/ui/profile-edit-button'
import { FollowButton } from '@/app/ui/follow-button'
import { ProfilePostFeed } from '@/app/ui/profile-post-feed'
import { PostFeedSkeleton } from '@/app/ui/post-skeleton'
import { formatJoinDate } from '@/lib/utils'
import type { Profile } from '@/lib/definitions'

function Avatar({ url, name, size }: { url: string | null; name: string; size: number }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover border-4 border-x-bg"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="flex items-center justify-center rounded-full border-4 border-x-bg bg-x-accent font-bold text-white select-none"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  // 並列でカウントを取得
  const [
    { count: postCount },
    { count: followerCount },
    { count: followingCount },
    { data: followRow },
  ] = await Promise.all([
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id),
    currentUser
      ? supabase
          .from('follows')
          .select('id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const isOwner = currentUser?.id === profile.id
  const isFollowing = !!followRow

  return (
    <div>
      {/* Sticky header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-x-border bg-black/80 backdrop-blur-md px-4 py-3">
        <BackButton />
        <div>
          <h1 className="font-bold text-xl text-x-text leading-tight">
            {profile.display_name}
          </h1>
          <p className="text-xs text-x-muted">{postCount ?? 0} 件のポスト</p>
        </div>
      </header>

      {/* Banner */}
      <div className="h-[150px] bg-x-surface" />

      {/* Avatar + action button */}
      <div className="flex items-end justify-between px-4 -mt-12 mb-3">
        <Avatar url={profile.avatar_url} name={profile.display_name} size={80} />
        {isOwner ? (
          <ProfileEditButton profile={profile as Profile} />
        ) : (
          currentUser && (
            <FollowButton userId={profile.id} isFollowing={isFollowing} />
          )
        )}
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4 space-y-3">
        <div>
          <h2 className="font-bold text-xl text-x-text leading-tight">
            {profile.display_name}
          </h2>
          <p className="text-x-muted">@{profile.username}</p>
        </div>

        {profile.bio && (
          <p className="text-x-text text-sm whitespace-pre-wrap break-words leading-normal">
            {profile.bio}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-x-muted text-sm">
          <CalendarDays size={16} className="flex-shrink-0" />
          <span>{formatJoinDate(profile.created_at)}に参加</span>
        </div>

        {/* フォロー / フォロワー数 */}
        <div className="flex gap-5 text-sm">
          <span>
            <strong className="text-x-text">{followingCount ?? 0}</strong>{' '}
            <span className="text-x-muted">フォロー中</span>
          </span>
          <span>
            <strong className="text-x-text">{followerCount ?? 0}</strong>{' '}
            <span className="text-x-muted">フォロワー</span>
          </span>
        </div>
      </div>

      {/* Posts tab */}
      <div className="border-b border-x-border">
        <div className="flex">
          <div className="flex-1 py-4 text-center font-bold text-sm text-x-text border-b-2 border-x-accent">
            ポスト
          </div>
        </div>
      </div>

      <Suspense fallback={<PostFeedSkeleton />}>
        <ProfilePostFeed
          profileId={profile.id}
          currentUserId={currentUser?.id ?? null}
        />
      </Suspense>
    </div>
  )
}
