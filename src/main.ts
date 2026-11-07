import './styles/fonts.css'
import './styles/tokens.css'
import './styles/reset.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'
import './styles/utilities.css'
import './styles/fmhy.css'

import type { Site, Category, AppState, PageName } from './types'
import { loadState, saveTheme, saveFavorites, saveHistory, saveRecentSearches, saveSidebarOpen, saveAccentColor, saveThemePreset, detectSiteChanges, DEFAULT_STATE } from './utils/storage'
import { initSearch } from './utils/search'
import { initRouter, registerRoute, navigate, basePath, stripBase, getCurrentPage, setCurrentPage, getParams } from './utils/router'
import { initKeyboard, onKey } from './utils/keyboard'
import { el, render } from './utils/dom'
import { Navbar, closeMobileNav } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Sidebar } from './components/layout/Sidebar'
import { SearchOverlay } from './components/search/SearchOverlay'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { HomePage } from './pages/Home'
import { BrowsePage } from './pages/Browse'
import { FavoritesPage } from './pages/Favorites'
import { HistoryPage } from './pages/History'
import { DashboardPage } from './pages/Dashboard'
import { AboutPage } from './pages/About'
import { loadCatalog } from './content/catalog'
import { applyTheme, type DisplayMode } from './utils/theme'

const MOBILE_BREAKPOINT = 960

let sites: Site[] = []
let categories: Category[] = []
let state: AppState
let recentSiteIds: Set<string> | undefined

async function init() {
  state = loadState()

  // The sidebar is an overlay on small screens, so it should never open by default there.
  if (window.innerWidth < MOBILE_BREAKPOINT) state.sidebarOpen = false

  const catalog = loadCatalog()
  sites = catalog.sites
  categories = catalog.categories

  const root = document.querySelector('#app-slot') as HTMLElement
  if (!root) return

  const navbarSlot = document.querySelector('#navbar-slot') as HTMLElement | null
  if (navbarSlot) render(navbarSlot, el('div', {}))

  recentSiteIds = detectSiteChanges(sites)
  initSearch(sites)
  initKeyboard()

  document.documentElement.setAttribute('data-theme', state.theme)
  applySettings()

  registerRoute(/^\/$/, () => {
    setCurrentPage('home')
    state.filters = { ...DEFAULT_STATE.filters }
    renderPage()
  })
  registerRoute(/^\/browse(?:\?.*)?$/, (params) => {
    setCurrentPage('browse')
    state.filters.category = params.category || null
    state.filters.subcategory = params.category ? (params.subcategory || null) : null
    state.filters.query = params.q || ''
    renderPage()
  })
  registerRoute(/^\/favorites\/?$/, () => {
    setCurrentPage('favorites')
    state.filters = { ...DEFAULT_STATE.filters }
    renderPage()
  })
  registerRoute(/^\/history\/?$/, () => {
    setCurrentPage('history')
    state.filters = { ...DEFAULT_STATE.filters }
    renderPage()
  })
  registerRoute(/^\/dashboard\/?$/, () => {
    setCurrentPage('dashboard')
    state.filters = { ...DEFAULT_STATE.filters }
    renderPage()
  })
  registerRoute(/^\/about\/?$/, () => {
    setCurrentPage('about')
    state.filters = { ...DEFAULT_STATE.filters }
    renderPage()
  })

  onKey('Ctrl+k', (e) => { e.preventDefault(); openSearch() })
  onKey('Escape', () => { closeSearchIfOpen(); closeMobileNav() })

  document.addEventListener('click', handleInternalLink)
  initRouter()
}

let searchOverlay: HTMLElement | null = null
let settingsOverlay: HTMLElement | null = null
let outlineCleanup: (() => void) | null = null

function teardownOutline() {
  outlineCleanup?.()
  outlineCleanup = null
}

function openSearch() {
  if (searchOverlay) return
  searchOverlay = SearchOverlay(sites, state.recentSearches, closeSearch, (query) => {
    state.recentSearches = [query, ...state.recentSearches.filter(s => s !== query)].slice(0, 10)
    saveRecentSearches(state.recentSearches)
  })
  document.body.appendChild(searchOverlay)
  document.body.classList.add('search-open')
}

function closeSearch() {
  if (searchOverlay) {
    searchOverlay.remove()
    searchOverlay = null
    document.body.classList.remove('search-open')
  }
}

function closeSearchIfOpen() {
  if (searchOverlay) closeSearch()
}

function openSettings() {
  if (settingsOverlay) return
  settingsOverlay = SettingsPanel(state, {
    onChangeMode: handleThemeChange,
    onChangeColor: handleColorChange,
    onChangePreset: handlePresetChange,
    onClose: closeSettings,
  })
  document.body.appendChild(settingsOverlay)
}

function closeSettings() {
  if (settingsOverlay) {
    settingsOverlay.remove()
    settingsOverlay = null
  }
}

function handleThemeChange(mode: DisplayMode) {
  state.theme = mode
  saveTheme(mode)
  applySettings()
  renderPage()
}

function handleColorChange(color: string) {
  state.accentColor = color
  state.themePreset = null
  saveAccentColor(color)
  saveThemePreset(null)
  applySettings()
  renderPage()
}

function handlePresetChange(preset: string | null) {
  state.themePreset = preset
  saveThemePreset(preset)
  applySettings()
  renderPage()
}

function applySettings() {
  applyTheme(state.theme, state.accentColor, state.themePreset)
}

function trackVisit(id: string) {
  const existing = state.history.find(h => h.siteId === id)
  if (existing) {
    existing.visitedAt = Date.now()
    existing.count++
  } else {
    state.history.unshift({ siteId: id, visitedAt: Date.now(), count: 1 })
  }
  saveHistory(state.history.slice(0, 200))
}

function toggleFav(id: string) {
  const idx = state.favorites.indexOf(id)
  if (idx >= 0) state.favorites.splice(idx, 1)
  else state.favorites.push(id)
  saveFavorites(state.favorites)
  renderPage()
}

// Wiki rows and sidebar links announce their own actions so any page can
// record visits / favorite toggles without threading callbacks through.
window.addEventListener('cafs-visit', (e) => {
  const id = (e as CustomEvent<string>).detail
  trackVisit(id)
})
window.addEventListener('cafs-fav', (e) => {
  const id = (e as CustomEvent<string>).detail
  toggleFav(id)
})

function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen
  saveSidebarOpen(state.sidebarOpen)
  updateSidebar()
}

function exportFavorites() {
  const favSites = sites.filter(s => state.favorites.includes(s.id))
  const blob = new Blob([JSON.stringify(favSites, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'cafs-favorites.json'
  a.click()
  URL.revokeObjectURL(url)
}

function clearHistory() {
  state.history = []
  saveHistory([])
  renderPage()
}

function updateSidebar() {
  const sidebarEl = document.querySelector('.app-sidebar') as HTMLElement | null
  if (!sidebarEl) {
    state.sidebarOpen = false
    document.querySelector('.app-sidebar-backdrop')?.remove()
    return
  }

  const isMobile = window.innerWidth < MOBILE_BREAKPOINT
  if (!isMobile) {
    sidebarEl.style.display = ''
    sidebarEl.classList.remove('open')
  } else {
    sidebarEl.style.display = ''
    sidebarEl.classList.toggle('open', state.sidebarOpen)
  }

  let backdrop = document.querySelector('.app-sidebar-backdrop') as HTMLElement | null
  if (state.sidebarOpen && isMobile) {
    if (!backdrop) {
      backdrop = el('div', { class: 'app-sidebar-backdrop' })
      backdrop.addEventListener('click', toggleSidebar)
      document.body.appendChild(backdrop)
    }
  } else if (backdrop) {
    backdrop.remove()
  }
}

interface PagerTarget {
  label: string
  path: string
}

function pagerLink(target: PagerTarget, direction: 'prev' | 'next'): HTMLElement {
  const a = el('a', {
    class: `doc-pager-link ${direction}`,
    href: basePath(target.path),
  })
  a.appendChild(el('span', { class: 'doc-pager-label' }, direction === 'prev' ? 'Previous' : 'Next'))
  a.appendChild(el('span', { class: 'doc-pager-title' },
    direction === 'prev' ? `← ${target.label}` : `${target.label} →`))
  a.addEventListener('click', (event) => {
    event.preventDefault()
    navigate(target.path)
  })
  return a
}

function buildPager(page: PageName): HTMLElement | null {
  let prev: PagerTarget | undefined
  let next: PagerTarget | undefined
  const categoryIndex = state.filters.category
    ? categories.findIndex(category => category.id === state.filters.category)
    : -1

  switch (page) {
    case 'browse':
      if (categoryIndex >= 0) {
        const category = categories[categoryIndex]
        if (state.filters.subcategory) {
          prev = { label: category.name, path: `/browse?category=${category.id}` }
          next = { label: 'Wiki', path: '/browse' }
        } else {
          prev = categoryIndex > 0
            ? { label: categories[categoryIndex - 1].name, path: `/browse?category=${categories[categoryIndex - 1].id}` }
            : { label: 'Wiki', path: '/browse' }
          next = categoryIndex < categories.length - 1
            ? { label: categories[categoryIndex + 1].name, path: `/browse?category=${categories[categoryIndex + 1].id}` }
            : { label: 'Home', path: '/' }
        }
      } else {
        prev = { label: 'Home', path: '/' }
        next = categories[0]
          ? { label: categories[0].name, path: `/browse?category=${categories[0].id}` }
          : undefined
      }
      break
    case 'favorites':
      prev = { label: 'Wiki', path: '/browse' }
      next = { label: 'History', path: '/history' }
      break
    case 'history':
      prev = { label: 'Favorites', path: '/favorites' }
      next = { label: 'Statistics', path: '/dashboard' }
      break
    case 'dashboard':
      prev = { label: 'History', path: '/history' }
      next = { label: 'About', path: '/about' }
      break
    case 'about':
      prev = { label: 'Statistics', path: '/dashboard' }
      next = { label: 'Home', path: '/' }
      break
    default:
      return null
  }

  const nav = el('nav', { class: 'doc-footer', 'aria-label': 'Page navigation' })
  if (prev) nav.appendChild(pagerLink(prev, 'prev'))
  if (next) nav.appendChild(pagerLink(next, 'next'))
  return nav
}

function buildOutline(content: HTMLElement): HTMLElement | null {
  const headings = Array.from(content.querySelectorAll<HTMLElement>('h2[id]'))
  if (headings.length === 0) return null

  const aside = el('aside', { class: 'doc-aside', 'aria-label': 'On this page' })
  const inner = el('div', { class: 'doc-aside-inner' })
  inner.appendChild(el('div', { class: 'doc-aside-title' }, 'On this page'))

  const list = el('ul', { class: 'doc-aside-list' })
  const links = new Map<string, HTMLAnchorElement>()

  const setActive = (id: string) => {
    links.forEach((link, key) => {
      const isActive = key === id
      link.classList.toggle('active', isActive)
      if (isActive) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }

  headings.forEach(heading => {
    const clone = heading.cloneNode(true) as HTMLElement
    clone.querySelector('.wiki-section-count')?.remove()
    clone.querySelector('.wiki-heading-icon')?.remove()
    const label = clone.textContent?.trim() || heading.id

    const item = el('li', { class: 'doc-aside-item' })
    const link = el('a', { class: 'doc-aside-link', href: `#${heading.id}` }, label)
    link.addEventListener('click', (event) => {
      event.preventDefault()
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${heading.id}`)
      setActive(heading.id)
    })
    links.set(heading.id, link)
    item.appendChild(link)
    list.appendChild(item)
  })

  inner.appendChild(list)
  aside.appendChild(inner)

  if (headings.length > 0) {
    const updateActive = () => {
      const navbar = document.querySelector('.navbar')
      const offset = (navbar?.getBoundingClientRect().height || 64) + 24
      let active = headings[0].id

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= offset) active = heading.id
        else break
      }

      const doc = document.documentElement
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
        active = headings[headings.length - 1].id
      }

      setActive(active)
    }

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        updateActive()
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    requestAnimationFrame(updateActive)

    outlineCleanup = () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }

  return aside
}

function handleInternalLink(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const target = event.target
  if (!(target instanceof Element)) return
  const anchor = target.closest('a')
  if (!anchor) return

  const href = anchor.getAttribute('href')
  if (!href || href.startsWith('#') || href.startsWith('//')) return
  if (anchor.target === '_blank' || anchor.hasAttribute('download')) return

  const url = new URL(href, window.location.href)
  if (url.origin !== window.location.origin) return

  const rootPath = basePath('/')
  if (!url.pathname.startsWith(rootPath)) return

  event.preventDefault()
  navigate(stripBase(url.pathname + url.search))
}

function renderPage() {
  teardownOutline()

  const page = getCurrentPage()
  const params = getParams()

  const root = document.querySelector('#app-slot') as HTMLElement | null
  if (!root) return

  const prevSidebarScroll = document.querySelector('.fmhy-side-scroll')?.scrollTop ?? 0
  const currentUrl = window.location.pathname + window.location.search
  const prevUrl = document.body.dataset.lastUrl

  const navbar = Navbar(
    page,
    state.theme,
    state.accentColor,
    state.themePreset,
    categories,
    {
      onSearchOpen: openSearch,
      onThemeChange: handleThemeChange,
      onColorChange: handleColorChange,
      onPresetChange: handlePresetChange,
      onSettingsOpen: openSettings,
    },
  )

  let content: HTMLElement

  switch (page) {
    case 'home':
      state.filters = { ...DEFAULT_STATE.filters }
      content = HomePage(sites, categories, state.favorites, recentSiteIds)
      break

    case 'browse':
      content = BrowsePage(sites, categories, state.filters, state.favorites, (filters) => {
        state.filters = filters
        renderPage()
      })
      break

    case 'favorites': {
      const favSites = sites.filter(s => state.favorites.includes(s.id))
      content = FavoritesPage(favSites, categories, exportFavorites)
      break
    }

    case 'history':
      content = HistoryPage(sites, state.history, clearHistory)
      break

    case 'dashboard':
      content = DashboardPage(sites, categories, recentSiteIds)
      break

    case 'about':
      content = AboutPage(sites, categories)
      break

    default:
      content = HomePage(sites, categories, state.favorites)
  }

  const isHome = page === 'home'
  document.body.classList.toggle('home-layout', isHome)

  const layout = el('div', { class: 'app-layout' })

  const sidebar = Sidebar(categories, sites, state.filters, page, () => {
    state.sidebarOpen = false
    saveSidebarOpen(false)
    updateSidebar()
  })
  layout.appendChild(sidebar)

  const main = el('main', { class: 'app-main animate-fade-in', role: 'main' })
  const doc = el('div', { class: 'doc-layout' })
  const contentWrap = el('div', { class: 'doc-content' })
  contentWrap.appendChild(content)

  if (!isHome) {
    const pager = buildPager(page)
    if (pager) contentWrap.appendChild(pager)
  }
  doc.appendChild(contentWrap)

  if (!isHome) {
    const outline = buildOutline(content)
    if (outline) doc.appendChild(outline)
  }

  main.appendChild(doc)
  main.appendChild(Footer())
  layout.appendChild(main)

  const navbarSlot = document.querySelector('#navbar-slot') as HTMLElement | null
  if (navbarSlot) render(navbarSlot, navbar)

  render(root, layout)

  const newSidebar = document.querySelector('.fmhy-side-scroll')
  if (newSidebar) newSidebar.scrollTop = prevSidebarScroll

  if (prevUrl !== currentUrl) {
    window.scrollTo({ top: 0, behavior: 'auto' })
    document.body.dataset.lastUrl = currentUrl
  }

  updateSidebar()
}

window.addEventListener('resize', () => {
  if (!state) return
  if (window.innerWidth >= MOBILE_BREAKPOINT) {
    state.sidebarOpen = false
    closeMobileNav()
  }
  updateSidebar()
})

document.addEventListener('DOMContentLoaded', init)
