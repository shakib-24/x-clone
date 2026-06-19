import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ComposePost } from '@/app/ui/compose-post'
import { PostFeed } from '@/app/ui/post-feed'
import { PostFeedSkeleton } from '@/app/ui/post-skeleton'
import type { Profile } from '@/lib/definitions'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/api/auth/signout')

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-x-border bg-black/80 backdrop-blur-md px-4 py-3">
        <h1 className="text-xl font-bold text-x-text">ホーム</h1>
      </header>

      <ComposePost
        profile={profile as Pick<Profile, 'display_name' | 'avatar_url'>}
      />

      <Suspense fallback={<PostFeedSkeleton />}>
        <PostFeed userId={user.id} />
      </Suspense>
    </div>
  )
}
