import { el } from '../utils/dom'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { CollectionSiteRow } from '../components/collection/CollectionTree'
import { pluralize } from '../utils/format'
import { basePath, navigate } from '../utils/router'
import type { Site, Category } from '../types'

export function FavoritesPage(
  favSites: Site[],
  categories: Category[],
  exportFavs: () => void,
): HTMLElement {
  const page = el('div', { class: 'wiki-page' })

  page.appendChild(Breadcrumbs([
    { label: 'Home', href: '/' },
    { label: 'Favorites' },
  ]))

  const header = el('div', { class: 'page-header' })
  header.appendChild(el('h1', {}, 'Favorites'))
  if (favSites.length > 0) {
    const exportBtn = el('button', { class: 'btn btn-secondary', type: 'button' }, 'Export JSON')
    exportBtn.addEventListener('click', exportFavs)
    header.appendChild(exportBtn)
  }
  page.appendChild(header)

  if (favSites.length === 0) {
    const empty = el('div', { class: 'empty-state' })
    empty.appendChild(el('div', { class: 'empty-state-title' }, 'No favorites yet'))
    empty.appendChild(el('div', { class: 'empty-state-desc' }, 'Save sites from any wiki page and they will show up here.'))
    const browseBtn = el('button', { class: 'btn btn-secondary', type: 'button' }, 'Browse the wiki')
    browseBtn.addEventListener('click', () => navigate('/browse'))
    empty.appendChild(browseBtn)
    page.appendChild(empty)
    return page
  }

  page.appendChild(el('p', { class: 'wiki-lead' },
    `${pluralize(favSites.length, 'site')} saved on this device.`))

  const rendered = new Set<string>()

  categories.forEach(category => {
    const categorySites = favSites.filter(site => site.category === category.id)
    if (categorySites.length === 0) return
    rendered.add(category.id)

    const section = el('section', { class: 'wiki-section' })
    const heading = el('h2', { class: 'wiki-section-title', id: `favorites-${category.id}` })
    heading.appendChild(el('a', { href: basePath(`/browse?category=${category.id}`) }, category.name))
    heading.appendChild(el('span', { class: 'wiki-section-count' }, pluralize(categorySites.length, 'site')))
    section.appendChild(heading)

    const list = el('ul', { class: 'wiki-link-list' })
    categorySites.forEach(site => list.appendChild(CollectionSiteRow(site, true)))
    section.appendChild(list)
    page.appendChild(section)
  })

  const otherSites = favSites.filter(site => !rendered.has(site.category))
  if (otherSites.length > 0) {
    const section = el('section', { class: 'wiki-section' })
    const heading = el('h2', { class: 'wiki-section-title', id: 'favorites-other' })
    heading.appendChild(document.createTextNode('Other'))
    heading.appendChild(el('span', { class: 'wiki-section-count' }, pluralize(otherSites.length, 'site')))
    section.appendChild(heading)

    const list = el('ul', { class: 'wiki-link-list' })
    otherSites.forEach(site => list.appendChild(CollectionSiteRow(site, true)))
    section.appendChild(list)
    page.appendChild(section)
  }

  return page
}
