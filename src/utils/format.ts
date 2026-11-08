export function parseTimestamp(dateStr: string): number {
  const ts = Date.parse(dateStr)
  return Number.isNaN(ts) ? 0 : ts
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural || singular + 's'}`
}

export function shortDesc(desc: string, maxLen = 120): string {
  if (desc.length <= maxLen) return desc
  return desc.slice(0, maxLen).replace(/\s+\S*$/, '') + '…'
}

// The more recent of added/updated decides recency (they can differ when a
// resource was first listed earlier and overhauled later).
export function siteRecency(site: { addedAt: string; updatedAt: string }): number {
  return Math.max(parseTimestamp(site.addedAt), parseTimestamp(site.updatedAt))
}
