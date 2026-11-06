import { el, headingIcon } from '../../utils/dom'
import { icon } from '../../utils/icons'
import { basePath } from '../../utils/router'
import { shortDesc } from '../../utils/format'
import type { Category, Site, Subcategory } from '../../types'

interface SiteGroup {
  id: string
  name: string
  sites: Site[]
}

function groupSites(sites: Site[], category: Category): SiteGroup[] {
  const names = new Map(category.subcategories.map(sub => [sub.id, sub.name]))
  const order = new Map(category.subcategories.map((sub, index) => [sub.id, index]))
  const groups = new Map<string, SiteGroup>()

  for (const site of sites) {
    const id = site.subcategory || 'uncategorized'
    let group = groups.get(id)
    if (!group) {
      group = {
        id,
        name: names.get(id) || (id === 'uncategorized' ? 'Uncategorized' : id),
        sites: [],
      }
      groups.set(id, group)
    }
    group.sites.push(site)
  }

  return [...groups.values()].sort((a, b) => {
    const aOrder = order.get(a.id)
    const bOrder = order.get(b.id)
    if (aOrder !== undefined || bOrder !== undefined) {
      return (aOrder ?? Number.MAX_SAFE_INTEGER) - (bOrder ?? Number.MAX_SAFE_INTEGER)
    }
    return a.name.localeCompare(b.name)
  })
}

function emitVisit(siteId: string) {
  window.dispatchEvent(new CustomEvent('cafs-visit', { detail: siteId }))
}

export function CollectionSiteRow(site: Site, isFav: boolean): HTMLElement {
  const item = el('li', {
    class: 'wiki-link-item',
  })

  const nameLink = el('a', {
    class: 'wiki-link-name',
    href: site.url,
    target: '_blank',
    rel: 'noopener noreferrer',
    title: `Open ${site.name} in a new tab`,
    'aria-label': `Open ${site.name} in a new tab`,
  }, site.name)
  nameLink.addEventListener('click', () => emitVisit(site.id))
  item.appendChild(nameLink)

  const fav = el('button', {
    class: `wiki-link-fav${isFav ? ' active' : ''}`,
    type: 'button',
    title: isFav ? `Remove ${site.name} from favorites` : `Save ${site.name} to favorites`,
    'aria-label': isFav ? `Remove ${site.name} from favorites` : `Save ${site.name} to favorites`,
    'aria-pressed': isFav ? 'true' : 'false',
  })
  fav.innerHTML = icon(isFav ? 'starFilled' : 'star')
  fav.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('cafs-fav', { detail: site.id }))
  })
  item.appendChild(fav)

  item.appendChild(el('span', { class: 'wiki-link-desc' }, ` – ${shortDesc(site.description, 180)}`))

  const ext = el('a', {
    class: 'wiki-link-ext',
    href: site.url,
    target: '_blank',
    rel: 'noopener noreferrer',
    title: `Open ${site.name} in a new tab`,
    'aria-label': `Open ${site.name} in a new tab`,
  })
  ext.innerHTML = icon('externalLink')
  ext.addEventListener('click', () => emitVisit(site.id))
  item.appendChild(ext)

  return item
}

export function CollectionTree(
  sites: Site[],
  category: Category,
  favIds: string[],
  _compact?: boolean,
  onSelectSubcategory?: (subcategory: Subcategory) => void,
): HTMLElement {
  const tree = el('div', { class: 'wiki-sections' })
  const groups = groupSites(sites, category)

  groups.forEach(group => {
    const section = el('section', { class: 'wiki-section' })
    const heading = el('h2', {
      class: 'wiki-section-title',
      id: `section-${group.id}`,
    })
    heading.appendChild(headingIcon('folder'))

    if (onSelectSubcategory) {
      const link = el('a', {
        href: basePath(`/browse?category=${category.id}&subcategory=${group.id}`),
      }, group.name)
      link.addEventListener('click', (event) => {
        event.preventDefault()
        onSelectSubcategory({ id: group.id, name: group.name })
      })
      heading.appendChild(link)
    } else {
      heading.appendChild(document.createTextNode(group.name))
    }

    heading.appendChild(el('span', { class: 'wiki-section-count' }, String(group.sites.length)))
    section.appendChild(heading)

    const list = el('ul', { class: 'wiki-link-list' })
    group.sites.forEach(site => {
      list.appendChild(CollectionSiteRow(site, favIds.includes(site.id)))
    })
    section.appendChild(list)
    tree.appendChild(section)
  })

  return tree
}
