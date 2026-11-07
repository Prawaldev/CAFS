import { el } from '../../utils/dom'
import { basePath, navigate } from '../../utils/router'
import { icon, icons } from '../../utils/icons'
import type { Category, Site, FilterState, PageName } from '../../types'

interface SideLink {
  label: string
  path: string
  glyph: string
  active?: boolean
}

function sideLink(item: SideLink, onClose?: () => void): HTMLElement {
  const link = el('a', {
    class: `fmhy-side-link${item.active ? ' active' : ''}`,
    href: basePath(item.path),
    'aria-current': item.active ? 'page' : undefined,
  })
  link.innerHTML = `${item.glyph}<span>${item.label}</span>`
  link.addEventListener('click', (event) => {
    event.preventDefault()
    navigate(item.path)
    onClose?.()
  })
  return link
}

function sideGroup(title: string, open: boolean, children: HTMLElement[]): HTMLElement {
  const group = el('details', { class: 'fmhy-side-group' })
  if (open) group.setAttribute('open', '')

  const summary = el('summary', { class: 'fmhy-side-summary' })
  summary.innerHTML = `<span class="fmhy-side-group-title">${title}</span><span class="fmhy-side-group-caret">${icon('chevronRight')}</span>`
  group.appendChild(summary)

  const body = el('div', { class: 'fmhy-side-group-body' })
  children.forEach(child => body.appendChild(child))
  group.appendChild(body)
  return group
}

export function Sidebar(
  categories: Category[],
  sites: Site[],
  filters: FilterState,
  currentPage: PageName,
  onClose?: () => void,
): HTMLElement {
  const aside = el('aside', { class: 'sidebar app-sidebar', role: 'complementary', 'aria-label': 'Wiki navigation' })
  const scroll = el('div', { class: 'fmhy-side-scroll' })
  const nav = el('nav', { class: 'fmhy-side-nav' })

  const topLinks = el('div', { class: 'fmhy-side-top' })
  const topItems: SideLink[] = [
    { label: 'Home', path: '/', glyph: icon('home'), active: currentPage === 'home' },
    { label: 'Wiki Index', path: '/browse', glyph: icon('library'), active: currentPage === 'browse' && !filters.category },
    { label: 'Favorites', path: '/favorites', glyph: icon('star'), active: currentPage === 'favorites' },
  ]
  topItems.forEach(item => topLinks.appendChild(sideLink(item, onClose)))
  nav.appendChild(topLinks)

  const categoryLinks = categories.map(category => {
    const glyphName = (category.icon in icons ? category.icon : 'folder') as keyof typeof icons
    return sideLink({
      label: category.name,
      path: `/browse?category=${category.id}`,
      glyph: icon(glyphName),
      active: currentPage === 'browse' && filters.category === category.id,
    }, onClose)
  })
  nav.appendChild(sideGroup('Wiki', true, categoryLinks))

  const toolLinks: SideLink[] = [
    { label: 'Statistics', path: '/dashboard', glyph: icon('barChart3'), active: currentPage === 'dashboard' },
    { label: 'History', path: '/history', glyph: icon('history'), active: currentPage === 'history' },
    { label: 'Random site', path: '/random', glyph: icon('arrowRight') },
  ]
  nav.appendChild(sideGroup('Tools', true, toolLinks.map(item => {
    const link = el('a', {
      class: `fmhy-side-link${item.active ? ' active' : ''}`,
      href: basePath(item.path === '/random' ? '/browse' : item.path),
      'aria-current': item.active ? 'page' : undefined,
    })
    link.innerHTML = `${item.glyph}<span>${item.label}</span>`
    link.addEventListener('click', (event) => {
      event.preventDefault()
      if (item.path === '/random' && sites.length > 0) {
        const site = sites[Math.floor(Math.random() * sites.length)]
        window.dispatchEvent(new CustomEvent('cafs-visit', { detail: site.id }))
        window.open(site.url, '_blank', 'noopener,noreferrer')
      } else {
        navigate(item.path)
      }
      onClose?.()
    })
    return link
  })))

  const moreLinks: SideLink[] = [
    { label: 'About cafs', path: '/about', glyph: icon('info'), active: currentPage === 'about' },
    { label: 'GitHub', path: 'https://github.com/Prawaldev/CAFS', glyph: icon('github') },
  ]
  nav.appendChild(sideGroup('More', false, moreLinks.map(item => {
    const external = item.path.startsWith('http')
    const link = el('a', {
      class: `fmhy-side-link${item.active ? ' active' : ''}`,
      href: external ? item.path : basePath(item.path),
      target: external ? '_blank' : undefined,
      rel: external ? 'noopener' : undefined,
      'aria-current': item.active ? 'page' : undefined,
    })
    link.innerHTML = `${item.glyph}<span>${item.label}</span>`
    if (!external) {
      link.addEventListener('click', (event) => {
        event.preventDefault()
        navigate(item.path)
        onClose?.()
      })
    }
    return link
  })))

  scroll.appendChild(nav)
  aside.appendChild(scroll)
  return aside
}
