import { el } from '../../utils/dom'
import { icon } from '../../utils/icons'
import type { AppState } from '../../types'

export interface SettingsCallbacks {
  onChangeAccent: (color: string) => void
  onClose: () => void
}

export function SettingsPanel(
  state: AppState,
  callbacks: SettingsCallbacks,
): HTMLElement {
  const overlay = el('div', { class: 'settings-overlay', role: 'dialog', 'aria-label': 'Settings' })
  const panel = el('div', { class: 'settings-panel' })

  const header = el('div', { class: 'settings-header' })
  header.innerHTML = `${icon('settings', 20)} Settings`
  const closeBtn = el('button', { class: 'navbar-btn-icon', title: 'Close' })
  closeBtn.innerHTML = icon('x')
  closeBtn.addEventListener('click', () => callbacks.onClose())
  header.appendChild(closeBtn)
  panel.appendChild(header)

  const accentGroup = el('div', { class: 'settings-group' })
  accentGroup.appendChild(el('div', { class: 'settings-group-title' }, 'Accent Color'))
  const picker = el('div', { class: 'accent-picker' })
  const colors: Record<string, string> = {
    blossom: '#7bc5e4',
    lilac: '#c4b5fd',
    sky: '#7aa2f7',
    sage: '#8fd48f',
    gold: '#e8d06f',
    rose: '#f4a7b9',
  }
  Object.entries(colors).forEach(([name, hex]) => {
    const swatch = el('div', {
      class: `accent-swatch${state.accentColor === name ? ' active' : ''}`,
      style: `background:${hex}`,
      title: name.charAt(0).toUpperCase() + name.slice(1),
    }) as HTMLElement
    swatch.addEventListener('click', () => callbacks.onChangeAccent(name))
    picker.appendChild(swatch)
  })
  accentGroup.appendChild(picker)
  panel.appendChild(accentGroup)

  overlay.appendChild(panel)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) callbacks.onClose()
  })

  return overlay
}
