import { el } from '../../utils/dom'
import { Tag } from '../ui/Tag'
import type { Site } from '../../types'

export function SiteCompact(site: Site): HTMLElement {
  const row = el('div', { class: 'site-compact', tabindex: '0', role: 'button', style: 'cursor:pointer' })

  row.appendChild(el('span', { class: 'site-compact-name' }, site.name))

  const tags = el('span', { class: 'site-compact-tags' })
  site.tags.slice(0, 5).forEach(t => tags.appendChild(Tag(t)))
  row.appendChild(tags)

  row.addEventListener('click', () => window.open(site.url, '_blank', 'noopener,noreferrer'))
  row.addEventListener('keydown', (e) => { if (e.key === 'Enter') window.open(site.url, '_blank', 'noopener,noreferrer') })

  return row
}
