import { el } from '../../utils/dom'
import { navigate, basePath } from '../../utils/router'
import { icon } from '../../utils/icons'
import type { PageName } from '../../types'

export interface NavbarCallbacks {
  onSearchOpen: () => void
  onThemeToggle: () => void
  onSettingsOpen?: () => void
  onSidebarToggle?: () => void
}

export function Navbar(currentPage: PageName, theme: 'dark' | 'light', callbacks: NavbarCallbacks): HTMLElement {
  const header = el('header', { class: 'navbar', role: 'banner' })
  const inner = el('div', { class: 'navbar-inner' })

  if (callbacks.onSidebarToggle) {
    const menuBtn = el('button', {
      class: 'navbar-menu-btn',
      type: 'button',
      'aria-label': 'Open navigation menu',
      title: 'Menu',
    })
    menuBtn.innerHTML = `<span class="navbar-menu-icon">${icon('menu')}</span><span class="navbar-menu-text">Menu</span>`
    menuBtn.addEventListener('click', () => callbacks.onSidebarToggle!())
    inner.appendChild(menuBtn)
  }

  const logo = el('a', {
    class: 'navbar-logo',
    href: basePath('/'),
    'aria-label': 'cafs home',
  })
  logo.innerHTML = `<img src="${basePath('/favicon/favicon.svg')}" class="navbar-favicon" alt="" width="24" height="24"><span class="navbar-logo-text">cafs</span>`
  logo.addEventListener('click', (e) => {
    e.preventDefault()
    navigate('/')
  })
  inner.appendChild(logo)

  const searchBtn = el('button', {
    class: 'navbar-search',
    type: 'button',
    'aria-label': 'Search the wiki',
    title: 'Search (Ctrl+K)',
  })
  searchBtn.innerHTML = `${icon('search')}<span class="navbar-search-label">Search</span><kbd>Ctrl K</kbd>`
  searchBtn.addEventListener('click', () => callbacks.onSearchOpen())
  inner.appendChild(searchBtn)

  inner.appendChild(el('div', { class: 'navbar-spacer' }))

  const links = el('nav', { class: 'navbar-links', 'aria-label': 'Primary navigation' })
  const navPages: Array<{ id: PageName; label: string; path: string }> = [
    { id: 'browse', label: 'Wiki', path: '/browse' },
    { id: 'favorites', label: 'Favorites', path: '/favorites' },
    { id: 'dashboard', label: 'Stats', path: '/dashboard' },
    { id: 'about', label: 'About', path: '/about' },
  ]
  const isActive = (id: PageName) => {
    if (id === 'browse') return currentPage === 'browse'
    return currentPage === id
  }
  navPages.forEach(p => {
    const a = el('a', {
      class: `navbar-link${isActive(p.id) ? ' active' : ''}`,
      href: basePath(p.path),
    }, p.label)
    a.addEventListener('click', (e) => {
      e.preventDefault()
      navigate(p.path)
    })
    links.appendChild(a)
  })
  inner.appendChild(links)

  const actions = el('div', { class: 'navbar-actions' })

  const themeBtn = el('button', {
    class: 'navbar-btn-icon',
    type: 'button',
    title: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
    'aria-label': `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
  })
  themeBtn.innerHTML = theme === 'dark' ? icon('sun') : icon('moon')
  themeBtn.addEventListener('click', () => callbacks.onThemeToggle())
  actions.appendChild(themeBtn)

  const settingsBtn = el('button', {
    class: 'navbar-btn-icon',
    type: 'button',
    title: 'Appearance',
    'aria-label': 'Appearance settings',
  })
  settingsBtn.innerHTML = icon('settings')
  settingsBtn.addEventListener('click', () => callbacks.onSettingsOpen?.())
  actions.appendChild(settingsBtn)

  const githubBtn = el('a', {
    class: 'navbar-btn-icon navbar-github',
    href: 'https://github.com/Prawaldev/CAFS',
    target: '_blank',
    rel: 'noopener',
    title: 'GitHub',
    'aria-label': 'GitHub repository',
  })
  githubBtn.innerHTML = icon('github')
  actions.appendChild(githubBtn)

  inner.appendChild(actions)
  header.appendChild(inner)
  return header
}
