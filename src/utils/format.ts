export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = Date.now()
  const diff = now - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural || singular + 's'}`
}

export function shortDesc(desc: string, maxLen = 120): string {
  if (desc.length <= maxLen) return desc
  return desc.slice(0, maxLen).replace(/\s+\S*$/, '') + '…'
}

