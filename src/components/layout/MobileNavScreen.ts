import { el } from '../../utils/dom'
import { icon } from '../../utils/icons'
import { navigate, basePath } from '../../utils/router'
import type { PageName, Category } from '../../types'
import { AppearanceSection } from '../settings/AppearanceSection'
import type { DisplayMode } from '../../utils/theme'

export interface MobileNavScreenCallbacks {
  onClose: () => void
  onChangeMode: (mode: DisplayMode) => void
  onChangeColor: (colorId: string) => void
  onChangePreset: (presetId: string | null) => void
}

export function MobileNavScreen(
  currentPage: PageName,
  currentMode: DisplayMode,
  currentColor: string,
  currentPreset: string | null,
  categories: Category[],
  callbacks: MobileNavScreenCallbacks,
): HTMLElement {
  const screen = el('div', { class: 'VPNavScreen', id: 'VPNavScreen' })
  const container = el('div', { class: 'VPNavScreen-container' })

  // 1. Primary Navigation Menu
  const menuNav = el('nav', { class: 'VPNavScreen-menu', 'aria-label': 'Mobile Primary Navigation' })
  const navPages: Array<{ id: PageName; label: string; path: string }> = [
    { id: 'browse', label: 'Wiki', path: '/browse' },
    { id: 'favorites', label: 'Favorites', path: '/favorites' },
    { id: 'dashboard', label: 'Stats', path: '/dashboard' },
    { id: 'about', label: 'About', path: '/about' },
  ]

  navPages.forEach(p => {
    const isActive = currentPage === p.id
    const link = el('a', {
      class: `VPNavScreen-link${isActive ? ' active' : ''}`,
      href: basePath(p.path),
      'aria-current': isActive ? 'page' : undefined,
    }, p.label)

    link.addEventListener('click', (e) => {
      e.preventDefault()
      callbacks.onClose()
      navigate(p.path)
    })
    menuNav.appendChild(link)
  })

  // Optional collapsible wiki categories list
  if (categories && categories.length > 0) {
    const catGroup = el('details', { class: 'VPNavScreen-cat-group' })
    const summary = el('summary', { class: 'VPNavScreen-cat-summary' })
    summary.innerHTML = `<span>Browse Categories</span><span class="VPNavScreen-cat-caret">${icon('chevronRight', 14)}</span>`
    catGroup.appendChild(summary)

    const catList = el('div', { class: 'VPNavScreen-cat-list' })
    categories.forEach(cat => {
      const catLink = el('a', {
        class: 'VPNavScreen-cat-link',
        href: basePath(`/browse?category=${cat.id}`),
      }, cat.name)
      catLink.addEventListener('click', (e) => {
        e.preventDefault()
        callbacks.onClose()
        navigate(`/browse?category=${cat.id}`)
      })
      catList.appendChild(catLink)
    })
    catGroup.appendChild(catList)
    menuNav.appendChild(catGroup)
  }

  container.appendChild(menuNav)

  // 2. Appearance Section (Light, Dark, AMOLED + Color Themes + Theme Presets)
  const appearanceBox = el('div', { class: 'VPNavScreen-appearance' })
  appearanceBox.appendChild(
    AppearanceSection(
      currentMode,
      currentColor,
      currentPreset,
      {
        onChangeMode: (mode) => callbacks.onChangeMode(mode),
        onChangeColor: (color) => callbacks.onChangeColor(color),
        onChangePreset: (preset) => callbacks.onChangePreset(preset),
      },
      { compact: true },
    ),
  )
  container.appendChild(appearanceBox)

  screen.appendChild(container)
  return screen
}
