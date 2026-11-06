import { el } from '../../utils/dom'
import { basePath } from '../../utils/router'
import { pluralize } from '../../utils/format'
import type { Category, Site, SortOption } from '../../types'

function latestDate(sites: Site[], key: 'addedAt' | 'updatedAt'): string {
  return sites.reduce((latest, site) => (site[key] > latest ? site[key] : latest), '')
}

export function CollectionIndex(
  categories: Category[],
  sites: Site[],
  _compact: boolean,
  sort: SortOption,
): HTMLElement {
  const list = el('div', { class: 'wiki-sections wiki-index' })
  const sitesFor = (categoryId: string) => sites.filter(site => site.category === categoryId)

  const sorted = [...categories].sort((a, b) => {
    switch (sort) {
      case 'name-desc':
        return b.name.localeCompare(a.name)
      case 'added':
        return latestDate(sitesFor(b.id), 'addedAt').localeCompare(latestDate(sitesFor(a.id), 'addedAt'))
      case 'updated':
        return latestDate(sitesFor(b.id), 'updatedAt').localeCompare(latestDate(sitesFor(a.id), 'updatedAt'))
      default:
        return a.name.localeCompare(b.name)
    }
  })

  sorted.forEach(category => {
    const categorySites = sitesFor(category.id)
    const populatedSections = category.subcategories.filter(sub =>
      categorySites.some(site => site.subcategory === sub.id),
    )

    const section = el('section', { class: 'wiki-section' })
    const heading = el('h2', { class: 'wiki-section-title', id: `index-${category.id}` })

    const link = el('a', { href: basePath(`/browse?category=${category.id}`) }, category.name)
    heading.appendChild(link)
    heading.appendChild(el('span', { class: 'wiki-section-count' }, pluralize(categorySites.length, 'site')))
    section.appendChild(heading)

    section.appendChild(el('p', { class: 'wiki-section-desc' }, category.description))

    if (populatedSections.length > 0) {
      const links = el('p', { class: 'wiki-subcat-links' })
      populatedSections.forEach((sub, index) => {
        if (index > 0) links.appendChild(el('span', { class: 'wiki-subcat-sep', 'aria-hidden': 'true' }, ' · '))
        const count = categorySites.filter(site => site.subcategory === sub.id).length
        links.appendChild(el('a', { href: basePath(`/browse?category=${category.id}&subcategory=${sub.id}`) }, sub.name))
        links.appendChild(el('span', { class: 'wiki-subcat-count' }, ` (${count})`))
      })
      section.appendChild(links)
    }

    list.appendChild(section)
  })

  return list
}
