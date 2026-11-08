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

// ---------------------------------------------------------------------------
// Timestamps — the year is always part of the rendered date, and entries with
// a time component show it too ("8 Nov 2026, 14:32").
// ---------------------------------------------------------------------------

const DATE_FMT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const TIME_FMT = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

export function formatStamp(dateStr: string): string {
  const ts = parseTimestamp(dateStr)
  if (!ts) return dateStr
  const date = new Date(ts)
  // Date-only strings (length 10) carry no time, so don't invent one.
  return dateStr.length > 10
    ? `${DATE_FMT.format(date)}, ${TIME_FMT.format(date)}`
    : DATE_FMT.format(date)
}

function labelFor(ts: number, now: number): string {
  const mins = Math.floor((now - ts) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`
  // Older than a day → real date, time and year.
  return formatStamp(new Date(ts).toISOString())
}

export function stampLabel(dateStr: string): string {
  const ts = parseTimestamp(dateStr)
  return ts ? labelFor(ts, Date.now()) : dateStr
}

// The more recent of added/updated decides recency (they can differ when a
// resource was first listed earlier and overhauled later).
export function siteRecency(site: { addedAt: string; updatedAt: string }): number {
  return Math.max(parseTimestamp(site.addedAt), parseTimestamp(site.updatedAt))
}

// Live ticker: every element marked with data-live-ts gets its relative label
// refreshed every 30 seconds, so "updated 3m ago" ages forward in real time.
let liveTimer: ReturnType<typeof setInterval> | null = null

export function refreshLiveStamps(): void {
  const now = Date.now()
  document.querySelectorAll<HTMLElement>('[data-live-ts]').forEach(node => {
    const ts = parseTimestamp(node.dataset.liveTs || '')
    if (!ts) return
    const verb = node.dataset.liveVerb || 'updated'
    node.textContent = `${verb} ${labelFor(ts, now)}`
  })
}

export function startLiveStamps(): void {
  if (liveTimer) return
  liveTimer = setInterval(() => {
    if (!document.hidden) refreshLiveStamps()
  }, 30_000)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshLiveStamps()
  })
}
