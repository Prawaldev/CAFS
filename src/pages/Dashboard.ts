import { el } from '../utils/dom'
import { StatCard } from '../components/stats/StatCard'
import { TagCloud } from '../components/stats/TagCloud'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { siteTimestamp } from '../components/collection/CollectionTree'
import { pluralize, siteRecency } from '../utils/format'
import { basePath, navigate } from '../utils/router'
import type { Site, Category } from '../types'

export function DashboardPage(sites: Site[], categories: Category[], recentIds?: Set<string>): HTMLElement {
  const page = el('div', { class: 'wiki-page' })

  page.appendChild(Breadcrumbs([
    { label: 'Home', href: '/' },
    { label: 'Statistics' },
  ]))

  page.appendChild(el('h1', {}, 'Statistics'))
  page.appendChild(el('p', { class: 'wiki-lead' },
    'A quick look at the shape of the archive: how many entries live here, where they are, and what changed recently.'))

  const uniqueTags = new Set(sites.flatMap(s => s.tags)).size

  const stats = el('div', { class: 'stats-grid' })
  stats.appendChild(StatCard(sites.length, 'Total sites'))
  stats.appendChild(StatCard(categories.length, 'Pages'))
  stats.appendChild(StatCard(uniqueTags, 'Unique tags'))
  page.appendChild(stats)

  const catSection = el('section', { class: 'dashboard-section' })
  const catHeading = el('h2', { class: 'dashboard-section-title', id: 'sites-per-page' }, 'Sites per page')
  catSection.appendChild(catHeading)

  const catChart = el('div', { class: 'bar-chart' })
  const maxCat = Math.max(...categories.map(c => sites.filter(s => s.category === c.id).length), 1)
  categories.forEach(cat => {
    const count = sites.filter(s => s.category === cat.id).length
    const row = el('div', { class: 'bar-row' })
    row.appendChild(el('span', { class: 'bar-label' }, cat.name))
    const track = el('div', { class: 'bar-track' })
    const fill = el('div', { class: 'bar-fill', style: `width:${(count / maxCat) * 100}%;background:var(--accent);` })
    track.appendChild(fill)
    row.appendChild(track)
    row.appendChild(el('span', { class: 'bar-value' }, String(count)))
    catChart.appendChild(row)
  })
  catSection.appendChild(catChart)
  page.appendChild(catSection)

  const tagSection = el('section', { class: 'dashboard-section' })
  tagSection.appendChild(el('h2', { class: 'dashboard-section-title', id: 'tag-cloud' }, 'Tag cloud'))
  tagSection.appendChild(TagCloud(sites))
  page.appendChild(tagSection)

  const recentSection = el('section', { class: 'dashboard-section' })
  recentSection.appendChild(el('h2', { class: 'dashboard-section-title', id: 'recently-updated' }, 'Recently updated'))

  const recent = [...sites].sort((a, b) => {
    const aChanged = recentIds?.has(a.id) ?? false
    const bChanged = recentIds?.has(b.id) ?? false
    if (aChanged !== bChanged) return aChanged ? -1 : 1
    return siteRecency(b) - siteRecency(a)
  }).slice(0, 8)

  const recentList = el('ul', { class: 'wiki-link-list' })
  recent.forEach(site => {
    const item = el('li', { class: 'wiki-link-item' })
    const link = el('a', {
      class: 'wiki-link-name',
      href: site.url,
      target: '_blank',
      rel: 'noopener noreferrer',
      title: `Open ${site.name} in a new tab`,
      'aria-label': `Open ${site.name} in a new tab`,
    }, site.name)
    link.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('cafs-visit', { detail: site.id }))
    })
    item.appendChild(link)
    item.appendChild(el('span', { class: 'wiki-link-desc' }, ' – '))
    item.appendChild(siteTimestamp(site))
    recentList.appendChild(item)
  })
  recentSection.appendChild(recentList)
  page.appendChild(recentSection)

  page.appendChild(el('p', { class: 'wiki-meta' },
    `${pluralize(sites.length, 'entry', 'entries')} · ${pluralize(uniqueTags, 'tag')}`))

  return page
}
