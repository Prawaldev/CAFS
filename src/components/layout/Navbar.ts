import { el } from '../../utils/dom'
import { navigate, basePath } from '../../utils/router'
import { icon } from '../../utils/icons'
import type { PageName, Category, Site, FilterState } from '../../types'
import type { DisplayMode } from '../../utils/theme'
import { MobileNavScreen } from './MobileNavScreen'
import { MobileSidebarScreen } from './MobileSidebarScreen'

export interface NavbarCallbacks {
  onSearchOpen: () => void
  onThemeChange: (theme: DisplayMode) => void
  onColorChange: (color: string) => void
  onPresetChange: (preset: string | null) => void
  onSettingsOpen?: () => void
}

let mobileScreenEl: HTMLElement | null = null
let mobileBackdropEl: HTMLElement | null = null
let isMobileScreenOpen = false

export function closeMobileNav() {
  if (mobileScreenEl) {
    mobileScreenEl.remove()
    mobileScreenEl = null
  }
  if (mobileBackdropEl) {
    mobileBackdropEl.remove()
    mobileBackdropEl = null
  }
  isMobileScreenOpen = false
  document.body.classList.remove('nav-screen-open')
  const hamburger = document.querySelector('.VPNavBarHamburger')
  if (hamburger) {
    hamburger.classList.remove('active')
    hamburger.setAttribute('aria-expanded', 'false')
  }
}

export function isMobileNavOpen() {
  return isMobileScreenOpen
}

// Original burger behaviour (kept for the home screen and every non-wiki page):
// the full-height nav screen opens under the navbar, no backdrop.
function openNavScreen(
  open: boolean,
  currentPage: PageName,
  theme: DisplayMode,
  accentColor: string,
  themePreset: string | null,
  categories: Category[],
  callbacks: NavbarCallbacks,
) {
  if (open === isMobileScreenOpen) return
  isMobileScreenOpen = open

  if (open) {
    mobileScreenEl?.remove()
    mobileScreenEl = MobileNavScreen(currentPage, theme, accentColor, themePreset, categories, {
      onClose: closeMobileNav,
      onChangeMode: (m) => callbacks.onThemeChange(m),
      onChangeColor: (c) => callbacks.onColorChange(c),
      onChangePreset: (p) => callbacks.onPresetChange(p),
    })
    document.body.appendChild(mobileScreenEl)
    document.body.classList.add('nav-screen-open')
  } else {
    closeMobileNav()
  }
}

// Local-nav burger (wiki pages): opens the LEFT drawer that carries the same
// content the desktop sidebar stores, over a dimmed backdrop.
export function toggleMobileSidebar(
  currentPage: PageName,
  categories: Category[],
  sites: Site[],
  filters: FilterState,
) {
  const open = !isMobileScreenOpen
  isMobileScreenOpen = open

  if (open) {
    mobileScreenEl?.remove()
    mobileScreenEl = MobileSidebarScreen(currentPage, categories, sites, filters, closeMobileNav)
    document.body.appendChild(mobileScreenEl)
    mobileBackdropEl = el('div', { class: 'nav-screen-backdrop' })
    mobileBackdropEl.addEventListener('click', closeMobileNav)
    document.body.appendChild(mobileBackdropEl)
    document.body.classList.add('nav-screen-open')
  } else {
    closeMobileNav()
  }
}

export function Navbar(
  currentPage: PageName,
  theme: DisplayMode,
  accentColor: string,
  themePreset: string | null,
  categories: Category[],
  callbacks: NavbarCallbacks,
): HTMLElement {
  const header = el('header', { class: 'navbar', role: 'banner' })
  const inner = el('div', { class: 'navbar-inner' })

  // Left: Logo only (on wiki pages the burger lives in the local nav instead)
  const logo = el('a', {
    class: 'navbar-logo',
    href: basePath('/'),
    'aria-label': 'cafs home',
  })
  logo.innerHTML = `<img src="${basePath('/favicon/favicon.svg')}" class="navbar-favicon" alt="" width="24" height="24"><span class="navbar-logo-text">cafs</span>`
  logo.addEventListener('click', (e) => {
    e.preventDefault()
    closeMobileNav()
    navigate('/')
  })
  inner.appendChild(logo)

  // Spacer between left and right elements
  inner.appendChild(el('div', { class: 'navbar-spacer' }))

  // Desktop primary navigation links
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
      'aria-current': isActive(p.id) ? 'page' : undefined,
    }, p.label)
    a.addEventListener('click', (e) => {
      e.preventDefault()
      closeMobileNav()
      navigate(p.path)
    })
    links.appendChild(a)
  })
  inner.appendChild(links)

  // Right-side actions: Search button + Desktop buttons + Mobile Animated Hamburger button
  const actions = el('div', { class: 'navbar-actions' })

  // Search button: On desktop shows icon + label + kbd; on mobile scaled to clean search icon button on right side!
  const searchBtn = el('button', {
    class: 'navbar-search',
    type: 'button',
    'aria-label': 'Search the wiki (Ctrl+K)',
    title: 'Search (Ctrl+K)',
  })
  searchBtn.innerHTML = `
    <span class="navbar-search-icon" aria-hidden="true">${icon('search', 18)}</span>
    <span class="navbar-search-label">Search</span>
    <kbd>Ctrl K</kbd>
  `
  searchBtn.addEventListener('click', () => {
    closeMobileNav()
    callbacks.onSearchOpen()
  })
  actions.appendChild(searchBtn)

  // Desktop theme toggle button
  const themeBtn = el('button', {
    class: 'navbar-btn-icon navbar-theme-btn',
    type: 'button',
    title: `Switch to ${theme === 'dark' || theme === 'amoled' ? 'light' : 'dark'} mode`,
    'aria-label': `Switch to ${theme === 'dark' || theme === 'amoled' ? 'light' : 'dark'} mode`,
  })
  themeBtn.innerHTML = theme === 'light' ? icon('moon') : icon('sun')
  themeBtn.addEventListener('click', () => {
    const nextMode: DisplayMode = theme === 'light' ? 'dark' : 'light'
    callbacks.onThemeChange(nextMode)
  })
  actions.appendChild(themeBtn)

  // Desktop settings/appearance button
  const settingsBtn = el('button', {
    class: 'navbar-btn-icon navbar-settings-btn',
    type: 'button',
    title: 'Appearance',
    'aria-label': 'Appearance settings',
  })
  settingsBtn.innerHTML = icon('palette')
  settingsBtn.addEventListener('click', () => callbacks.onSettingsOpen?.())
  actions.appendChild(settingsBtn)

  // Desktop GitHub button
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

  // On wiki (browse) pages the mobile burger is provided by the sticky local
  // nav below the navbar, so only non-wiki pages get the actions burger back.
  if (currentPage !== 'browse') {
    const hamburgerBtn = el('button', {
      type: 'button',
      class: `VPNavBarHamburger${isMobileScreenOpen ? ' active' : ''}`,
      'aria-label': 'Open mobile navigation menu',
      'aria-expanded': isMobileScreenOpen ? 'true' : 'false',
      title: 'Menu',
    })
    hamburgerBtn.innerHTML = `
      <span class="container" aria-hidden="true">
        <span class="top"></span>
        <span class="middle"></span>
        <span class="bottom"></span>
      </span>
    `
    hamburgerBtn.addEventListener('click', () => {
      const open = !isMobileScreenOpen
      openNavScreen(open, currentPage, theme, accentColor, themePreset, categories, callbacks)
      hamburgerBtn.classList.toggle('active', open)
      hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false')
    })
    actions.appendChild(hamburgerBtn)
  }

  inner.appendChild(actions)
  header.appendChild(inner)
  return header
}
