import { el } from '../utils/dom'
import { icon, icons } from '../utils/icons'
import { pluralize } from '../utils/format'
import { renderInlineMarkdown } from '../utils/markdown'
import { navigate, basePath } from '../utils/router'
import type { Site, Category } from '../types'

const featureColors: Record<string, string> = {
  anime: '#d05a6e',
  manga: '#3ccd93',
  novels: '#a8d8b9',
  tokusatsu: '#fb9966',
  comics: '#bec23f',
  software: '#7aa2f7',
  music: '#7c82fe',
  tools: '#49d3e9',
  misc: '#ddd23b',
  art: '#f17c67',
  games: '#dac9a6',
  nsfw: '#c4b5fd',
  graveyard: '#9aa3b2',
}

const featureIcons: Record<string, keyof typeof icons> = {
  anime: 'star',
  manga: 'bookmark',
  novels: 'bookmark',
  tokusatsu: 'star',
  comics: 'bookmark',
  software: 'grid3x3',
  music: 'heart',
  tools: 'settings',
  misc: 'folder',
  art: 'heart',
  games: 'grid3x3',
  nsfw: 'star',
  graveyard: 'history',
}

export function HomePage(sites: Site[], categories: Category[], favIds: string[], _recentIds?: Set<string>): HTMLElement {
  const page = el('div', { class: 'home-page vp-home' })

  const hero = el('section', { class: 'vp-hero' })
  const heroInner = el('div', { class: 'vp-hero-inner' })
  const main = el('div', { class: 'vp-hero-main' })

  const name = el('h1', { class: 'vp-hero-name' })
  name.innerHTML = '<span class="vp-hero-name-clip">CAFS</span>'
  main.appendChild(name)
  main.appendChild(el('p', { class: 'vp-hero-tagline' },
    'The curated collection of anime, manga, reading, gaming and tool resources on the internet.'))

  const actions = el('div', { class: 'vp-hero-actions' })

  const browseBtn = el('a', { class: 'vp-button brand', href: basePath('/browse') }, 'Browse the wiki')
  browseBtn.addEventListener('click', (e) => { e.preventDefault(); navigate('/browse') })
  actions.appendChild(browseBtn)

  const randomBtn = el('button', { class: 'vp-button alt', type: 'button' }, 'Random site')
  randomBtn.addEventListener('click', () => {
    const site = sites[Math.floor(Math.random() * sites.length)]
    if (site) window.open(site.url, '_blank', 'noopener,noreferrer')
  })
  actions.appendChild(randomBtn)

  const dashBtn = el('a', { class: 'vp-button alt', href: basePath('/dashboard') }, 'Statistics')
  dashBtn.addEventListener('click', (e) => { e.preventDefault(); navigate('/dashboard') })
  actions.appendChild(dashBtn)

  main.appendChild(actions)

  const meta = el('p', { class: 'vp-hero-meta' })
  meta.textContent = `${pluralize(sites.length, 'site')} across ${pluralize(categories.length, 'page')} · hand-picked and updated regularly`
  main.appendChild(meta)
  heroInner.appendChild(main)

  hero.appendChild(heroInner)
  page.appendChild(hero)

  const features = el('section', { class: 'vp-features' })
  features.appendChild(el('p', { class: 'vp-features-intro' }, 'Or browse these pages'))

  const grid = el('div', { class: 'vp-features-grid' })
  categories.forEach(category => {
    const count = sites.filter(site => site.category === category.id).length
    if (count === 0) return

    const card = el('a', {
      class: 'vp-feature',
      href: basePath(`/browse?category=${category.id}`),
      'aria-label': `Open the ${category.name} page`,
    })

    const box = el('div', { class: 'vp-feature-box' })
    const glyph = el('div', {
      class: 'vp-feature-icon',
      style: `color:${featureColors[category.id] || 'var(--accent)'}`,
      'aria-hidden': 'true',
    })
    glyph.innerHTML = icon(featureIcons[category.id] || 'folder', 24)
    box.appendChild(glyph)
    box.appendChild(el('h2', { class: 'vp-feature-title' }, category.name))
    const details = el('p', { class: 'vp-feature-details' })
    details.innerHTML = renderInlineMarkdown(category.description)
    box.appendChild(details)
    box.appendChild(el('span', { class: 'vp-feature-link' }, `${pluralize(count, 'site')} →`))
    card.appendChild(box)

    card.addEventListener('click', (event) => {
      event.preventDefault()
      navigate(`/browse?category=${category.id}`)
    })
    grid.appendChild(card)
  })
  features.appendChild(grid)
  page.appendChild(features)

  return page
}
