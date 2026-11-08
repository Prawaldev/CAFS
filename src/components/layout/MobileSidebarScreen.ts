import { el } from '../../utils/dom'
import { Sidebar } from './Sidebar'
import type { PageName, Category, Site, FilterState } from '../../types'

/**
 * Mobile drawer used on wiki/browse pages: instead of the compact nav screen,
 * the burger reveals the same navigation content the desktop sidebar stores
 * (top links, wiki categories, tools, more) inside the standard VPNavScreen
 * drawer shell.
 */
export function MobileSidebarScreen(
  currentPage: PageName,
  categories: Category[],
  sites: Site[],
  filters: FilterState,
  onClose: () => void,
): HTMLElement {
  const screen = el('div', { class: 'VPNavScreen VPNavScreen--drawer VPNavScreen--sidebar', id: 'VPNavScreen' })
  const container = el('div', { class: 'VPNavScreen-container VPNavScreen-container--sidebar' })

  // Build the real desktop sidebar off-DOM, then lift its scroll body into the
  // drawer so we keep identical structure, hover and active states.
  const source = Sidebar(categories, sites, filters, currentPage, onClose)
  const scroll = source.querySelector('.fmhy-side-scroll')
  if (scroll) container.appendChild(scroll)
  else container.appendChild(source)

  screen.appendChild(container)
  return screen
}
