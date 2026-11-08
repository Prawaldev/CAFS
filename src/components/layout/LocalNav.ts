import { el } from '../../utils/dom'
import { icon } from '../../utils/icons'
import { isMobileNavOpen, toggleMobileSidebar } from './Navbar'
import type { PageName, Category, Site, FilterState } from '../../types'

/**
 * Sticky local nav shown on mobile wiki pages in place of the breadcrumbs:
 *   • left  — "Menu" burger that opens the left drawer with the sidebar content
 *   • right — "On this page" trigger for the outline drop panel
 */
export function LocalNav(
  currentPage: PageName,
  categories: Category[],
  sites: Site[],
  filters: FilterState,
): HTMLElement {
  const nav = el('div', { class: 'VPLocalNav', role: 'navigation', 'aria-label': 'Wiki navigation' })

  const open = isMobileNavOpen()
  const menuBtn = el('button', {
    type: 'button',
    class: `local-nav-menu VPNavBarHamburger${open ? ' active' : ''}`,
    'aria-label': 'Open navigation menu',
    'aria-expanded': open ? 'true' : 'false',
  })
  menuBtn.innerHTML = `
    <span class="container" aria-hidden="true">
      <span class="top"></span>
      <span class="middle"></span>
      <span class="bottom"></span>
    </span>
    <span class="local-nav-label">Menu</span>
  `
  menuBtn.addEventListener('click', () => {
    toggleMobileSidebar(currentPage, categories, sites, filters)
    const openNow = isMobileNavOpen()
    menuBtn.classList.toggle('active', openNow)
    menuBtn.setAttribute('aria-expanded', openNow ? 'true' : 'false')
  })
  nav.appendChild(menuBtn)

  const outlineBtn = el('button', {
    class: 'local-nav-outline',
    type: 'button',
    'aria-label': 'On this page',
  })
  outlineBtn.innerHTML = `${icon('list', 14)}<span>On this page</span>${icon('chevronRight', 12)}`
  outlineBtn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('cafs-outline-toggle'))
  })
  nav.appendChild(outlineBtn)

  return nav
}
