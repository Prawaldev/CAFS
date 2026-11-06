import { el } from '../utils/dom'
import { icon } from '../utils/icons'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { CollectionIndex } from '../components/collection/CollectionIndex'
import { CollectionSiteRow, CollectionTree } from '../components/collection/CollectionTree'
import { pluralize } from '../utils/format'
import { basePath, navigate } from '../utils/router'
import type { Site, Category, FilterState } from '../types'

function filterSites(sites: Site[], filters: FilterState): Site[] {
  let filtered = [...sites]

  if (filters.query) {
    const query = filters.query.toLowerCase()
    filtered = filtered.filter(site =>
      site.name.toLowerCase().includes(query) ||
      site.description.toLowerCase().includes(query) ||
      site.tags.some(tag => tag.toLowerCase().includes(query)) ||
      site.category.includes(query) ||
      site.subcategory.includes(query),
    )
  }

  if (filters.category) filtered = filtered.filter(site => site.category === filters.category)
  if (filters.subcategory) filtered = filtered.filter(site => site.subcategory === filters.subcategory)

  switch (filters.sort) {
    case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break
    case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break
    case 'added': filtered.sort((a, b) => b.addedAt.localeCompare(a.addedAt)); break
    case 'updated': filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); break
  }

  return filtered
}

function emptyState(
  title: string,
  description: string,
  actionLabel: string,
  action: () => void,
): HTMLElement {
  const empty = el('div', { class: 'empty-state' })
  const glyph = el('div', { class: 'icon' })
  glyph.innerHTML = icon('search', 28)
  empty.appendChild(glyph)
  empty.appendChild(el('div', { class: 'empty-state-title' }, title))
  empty.appendChild(el('div', { class: 'empty-state-desc' }, description))
  const button = el('button', { class: 'btn btn-secondary', type: 'button' }, actionLabel)
  button.addEventListener('click', action)
  empty.appendChild(button)
  return empty
}

function wikiHeader(title: string, description: string, meta?: string): HTMLElement {
  const header = el('header', { class: 'wiki-header' })
  header.appendChild(el('h1', {}, title))
  header.appendChild(el('p', { class: 'wiki-lead' }, description))
  if (meta) header.appendChild(el('p', { class: 'wiki-meta' }, meta))
  return header
}

function searchResults(categories: Category[], sites: Site[], favIds: string[]): HTMLElement {
  const results = el('div', { class: 'wiki-sections' })

  categories.forEach(category => {
    const categorySites = sites.filter(site => site.category === category.id)
    if (categorySites.length === 0) return

    const section = el('section', { class: 'wiki-section' })
    const heading = el('h2', { class: 'wiki-section-title', id: `search-${category.id}` })
    heading.appendChild(el('a', { href: basePath(`/browse?category=${category.id}`) }, category.name))
    heading.appendChild(el('span', { class: 'wiki-section-count' }, pluralize(categorySites.length, 'site')))
    section.appendChild(heading)

    const list = el('ul', { class: 'wiki-link-list' })
    categorySites.forEach(site => {
      list.appendChild(CollectionSiteRow(site, favIds.includes(site.id)))
    })
    section.appendChild(list)
    results.appendChild(section)
  })

  return results
}

export function BrowsePage(
  sites: Site[],
  categories: Category[],
  filters: FilterState,
  favIds: string[],
  onFilterChange?: (filters: FilterState) => void,
): HTMLElement {
  const page = el('div', { class: 'collection-page wiki-page' })
  const category = filters.category ? categories.find(item => item.id === filters.category) : undefined
  const subcategory = category && filters.subcategory
    ? category.subcategories.find(item => item.id === filters.subcategory)
    : undefined

  const crumbs: Array<{ label: string; href?: string }> = [{ label: 'Home', href: '/' }]
  if (category) {
    crumbs.push({ label: 'Wiki', href: '/browse' })
    crumbs.push({
      label: category.name,
      href: subcategory ? `/browse?category=${category.id}` : undefined,
    })
    if (subcategory) crumbs.push({ label: subcategory.name })
  } else {
    crumbs.push({ label: 'Wiki' })
  }
  page.appendChild(Breadcrumbs(crumbs))

  if (filters.category && !category) {
    page.appendChild(el('h1', {}, 'Wiki not found'))
    page.appendChild(emptyState(
      'That page does not exist',
      'The collection you are looking for is not part of this wiki.',
      'Back to the wiki',
      () => navigate('/browse'),
    ))
    return page
  }

  const visibleSites = filterSites(sites, filters)

  if (filters.query) {
    page.appendChild(wikiHeader(
      'Search results',
      `Sites matching “${filters.query}” across the wiki.`,
      `${pluralize(visibleSites.length, 'site')} found`,
    ))

    if (visibleSites.length === 0) {
      page.appendChild(emptyState(
        'No sites match your search',
        'Try a shorter term, a different spelling, or clear the search.',
        'Clear search',
        () => onFilterChange?.({
          ...filters,
          query: '',
          category: null,
          subcategory: null,
          tags: [],
        }),
      ))
    } else {
      page.appendChild(searchResults(categories, visibleSites, favIds))
    }
    return page
  }

  if (!category) {
    page.appendChild(wikiHeader(
      'Wiki',
      'A hand-picked directory of anime, manga, reading, gaming and tool resources. Pick a page to see every entry in that section.',
      `${pluralize(sites.length, 'site')} across ${pluralize(categories.length, 'page')}`,
    ))
    page.appendChild(CollectionIndex(categories, sites, false, filters.sort))
    return page
  }

  const categorySites = sites.filter(site => site.category === category.id)
  const populatedSections = category.subcategories.filter(sub =>
    categorySites.some(site => site.subcategory === sub.id),
  ).length
  const pageTitle = subcategory ? subcategory.name : category.name
  const countText = subcategory
    ? `${pluralize(visibleSites.length, 'site')} in ${subcategory.name}`
    : `${pluralize(visibleSites.length, 'site')} across ${pluralize(populatedSections, 'section')}`

  page.appendChild(wikiHeader(pageTitle, category.description, countText))

  if (visibleSites.length === 0) {
    page.appendChild(emptyState(
      'Nothing here yet',
      'This page does not have any entries right now.',
      'Back to the wiki',
      () => navigate('/browse'),
    ))
    return page
  }

  if (subcategory) {
    const list = el('ul', { class: 'wiki-link-list' })
    visibleSites.forEach(site => {
      list.appendChild(CollectionSiteRow(site, favIds.includes(site.id)))
    })
    page.appendChild(list)
    return page
  }

  page.appendChild(CollectionTree(
    visibleSites,
    category,
    favIds,
    false,
    sub => navigate(`/browse?category=${category.id}&subcategory=${sub.id}`),
  ))

  return page
}
