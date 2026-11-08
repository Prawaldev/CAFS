import { el } from '../../utils/dom'
import { navigate, basePath } from '../../utils/router'
import { icon } from '../../utils/icons'
import type { PageName, Category } from '../../types'
import type { DisplayMode } from '../../utils/theme'
import { MobileNavScreen } from './MobileNavScreen'

export interface NavbarCallbacks {
  onSearchOpen: () => void
  onThemeChange: (theme: DisplayMode) => void
  onColorChange: (color: string) => void
  onPresetChange: (preset: string | null) => void
  onSettingsOpen?: () => void
}

let mobileScreenEl: HTMLElement | null = null
let isMobileScreenOpen = false

export function closeMobileNav() {
  if (mobileScreenEl) {
    mobileScreenEl.remove()
    mobileScreenEl = null
  }
  isMobileScreenOpen = false
  document.body.classList.remove('nav-screen-open')
  const hamburger = document.querySelector('.VPNavBarHamburger')
  if (hamburger) {
    hamburger.classList.remove('active')
    hamburger.setAttribute('aria-expanded', 'false')
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

  // Left: Logo only (left-side burger menu is removed as requested)
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

  // Mobile Hamburger button with exact animation from https://github.com/fmhy/edit
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

  const toggleMobileNav = () => {
    isMobileScreenOpen = !isMobileScreenOpen
    hamburgerBtn.classList.toggle('active', isMobileScreenOpen)
    hamburgerBtn.setAttribute('aria-expanded', isMobileScreenOpen ? 'true' : 'false')

    if (isMobileScreenOpen) {
      if (mobileScreenEl) mobileScreenEl.remove()
      mobileScreenEl = MobileNavScreen(
        currentPage,
        theme,
        accentColor,
        themePreset,
        categories,
        {
          onClose: closeMobileNav,
          onChangeMode: (m) => callbacks.onThemeChange(m),
          onChangeColor: (c) => callbacks.onColorChange(c),
          onChangePreset: (p) => callbacks.onPresetChange(p),
        },
      )
      document.body.appendChild(mobileScreenEl)
      document.body.classList.add('nav-screen-open')
    } else {
      closeMobileNav()
    }
  }

  hamburgerBtn.addEventListener('click', toggleMobileNav)
  actions.appendChild(hamburgerBtn)

  inner.appendChild(actions)
  header.appendChild(inner)
  return header
}
