import { el } from '../../utils/dom'
import { icon } from '../../utils/icons'
import { Tag } from '../ui/Tag'
import type { Site } from '../../types'

export function SiteListItem(site: Site, isFav: boolean): HTMLElement {
  const item = el('div', { class: 'site-list-item', tabindex: '0', role: 'button' })

  const info = el('div', { class: 'site-list-info' })
  const nameLine = el('div', { class: 'site-list-name' })
  nameLine.textContent = site.name
  if (isFav) {
    const starEl = el('span', { style: 'color:var(--accent);margin-left:var(--space-1);display:inline-flex;' })
    starEl.innerHTML = icon('starFilled')
    nameLine.appendChild(starEl)
  }
  info.appendChild(nameLine)
  info.appendChild(el('div', { class: 'site-list-desc' }, site.shortDescription))
  item.appendChild(info)

  const tags = el('div', { class: 'site-list-tags' })
  site.tags.slice(0, 3).forEach(t => tags.appendChild(Tag(t)))
  item.appendChild(tags)

  item.addEventListener('click', () => window.open(site.url, '_blank', 'noopener,noreferrer'))
  item.addEventListener('keydown', (e) => { if (e.key === 'Enter') window.open(site.url, '_blank', 'noopener,noreferrer') })

  return item
}
