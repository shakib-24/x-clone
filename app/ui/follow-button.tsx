'use client'

import { useOptimistic, useTransition } from 'react'
import { followUser, unfollowUser } from '@/app/actions/follows'

export function FollowButton({
  userId,
  isFollowing: initial,
}: {
  userId: string
  isFollowing: boolean
}) {
  const [, startTransition] = useTransition()
  const [following, setFollowing] = useOptimistic(
    initial,
    (_, next: boolean) => next
  )

  const handleClick = () => {
    startTransition(async () => {
      setFollowing(!following)
      if (following) {
        await unfollowUser(userId)
      } else {
        await followUser(userId)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      className={`rounded-full px-4 py-1.5 font-bold text-sm transition ${
        following
          ? 'border border-x-border text-x-text hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'
          : 'bg-x-text text-x-bg hover:opacity-85'
      }`}
    >
      {following ? 'フォロー中' : 'フォロー'}
    </button>
  )
}
