import { el } from '../utils/dom'
import { icon } from '../utils/icons'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { basePath, navigate } from '../utils/router'
import type { Site, HistoryEntry } from '../types'

export function HistoryPage(
  sites: Site[],
  history: HistoryEntry[],
  onClear: () => void,
): HTMLElement {
  const page = el('div', { class: 'wiki-page' })

  page.appendChild(Breadcrumbs([
    { label: 'Home', href: '/' },
    { label: 'History' },
  ]))

  const header = el('div', { class: 'page-header' })
  header.appendChild(el('h1', {}, 'History'))
  if (history.length > 0) {
    const clearBtn = el('button', { class: 'btn btn-secondary', type: 'button' }, 'Clear all')
    clearBtn.addEventListener('click', onClear)
    header.appendChild(clearBtn)
  }
  page.appendChild(header)

  if (history.length === 0) {
    const empty = el('div', { class: 'empty-state' })
    empty.appendChild(el('div', { class: 'empty-state-title' }, 'No browsing history'))
    empty.appendChild(el('div', { class: 'empty-state-desc' }, 'Sites you open will appear here. History stays on this device.'))
    page.appendChild(empty)
    return page
  }

  page.appendChild(el('p', { class: 'wiki-lead' }, 'Recently opened sites, grouped by when you last visited them.'))

  const sorted = [...history].sort((a, b) => b.visitedAt - a.visitedAt)

  const now = Date.now()
  const groups: Record<string, HistoryEntry[]> = { Today: [], Yesterday: [], 'This week': [], Earlier: [] }

  sorted.forEach(entry => {
    const diff = now - entry.visitedAt
    if (diff < 86400000) groups['Today'].push(entry)
    else if (diff < 172800000) groups['Yesterday'].push(entry)
    else if (diff < 604800000) groups['This week'].push(entry)
    else groups['Earlier'].push(entry)
  })

  Object.entries(groups).forEach(([label, entries]) => {
    if (entries.length === 0) return
    const section = el('section', { class: 'wiki-section' })
    const heading = el('h2', {
      class: 'wiki-section-title',
      id: `history-${label.toLowerCase().replace(/\s+/g, '-')}`,
    })
    heading.appendChild(document.createTextNode(label))
    heading.appendChild(el('span', { class: 'wiki-section-count' }, `${entries.length}`))
    section.appendChild(heading)

    const list = el('ul', { class: 'wiki-link-list' })
    entries.forEach(entry => {
      const site = sites.find(item => item.id === entry.siteId)
      if (!site) return

      const item = el('li', { class: 'wiki-link-item' })
      const nameLink = el('a', {
        class: 'wiki-link-name',
        href: site.url,
        target: '_blank',
        rel: 'noopener noreferrer',
        title: `Open ${site.name} in a new tab`,
        'aria-label': `Open ${site.name} in a new tab`,
      }, site.name)
      nameLink.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('cafs-visit', { detail: site.id }))
      })
      item.appendChild(nameLink)

      item.appendChild(el('span', { class: 'wiki-link-desc' },
        ` – ${formatTimeAgo(entry.visitedAt)} · ${entry.count} ${entry.count === 1 ? 'visit' : 'visits'}`))

      const ext = el('a', {
        class: 'wiki-link-ext',
        href: site.url,
        target: '_blank',
        rel: 'noopener noreferrer',
        title: `Open ${site.name} in a new tab`,
        'aria-label': `Open ${site.name} in a new tab`,
      })
      ext.innerHTML = icon('externalLink')
      ext.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('cafs-visit', { detail: site.id }))
      })
      item.appendChild(ext)
      list.appendChild(item)
    })

    section.appendChild(list)
    page.appendChild(section)
  })

  return page
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
