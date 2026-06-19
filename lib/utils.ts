export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const secs = Math.floor(diff / 1000)
  const mins = Math.floor(secs / 60)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (secs < 60) return `${secs}秒`
  if (mins < 60) return `${mins}分`
  if (hours < 24) return `${hours}時間`
  if (days < 7) return `${days}日`

  return new Date(dateStr).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export function formatJoinDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
  })
}
