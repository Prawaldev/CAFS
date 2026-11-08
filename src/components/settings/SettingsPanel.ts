import { el } from '../../utils/dom'
import { icon } from '../../utils/icons'
import type { AppState } from '../../types'
import { AppearanceSection } from './AppearanceSection'
import type { DisplayMode } from '../../utils/theme'

export interface SettingsCallbacks {
  onChangeMode: (mode: DisplayMode) => void
  onChangeColor: (color: string) => void
  onChangePreset: (preset: string | null) => void
  onClose: () => void
}

export function SettingsPanel(
  state: AppState,
  callbacks: SettingsCallbacks,
): HTMLElement {
  const overlay = el('div', { class: 'settings-overlay', role: 'dialog', 'aria-label': 'Settings' })
  const panel = el('div', { class: 'settings-panel' })

  const header = el('div', { class: 'settings-header' })
  header.innerHTML = `${icon('palette', 18)} <span>Appearance</span>`
  const closeBtn = el('button', { class: 'navbar-btn-icon', title: 'Close', 'aria-label': 'Close appearance settings' })
  closeBtn.innerHTML = icon('x', 16)
  closeBtn.addEventListener('click', () => callbacks.onClose())
  header.appendChild(closeBtn)
  panel.appendChild(header)

  const body = el('div', { class: 'settings-body' })
  body.appendChild(
    AppearanceSection(
      state.theme as DisplayMode,
      state.accentColor,
      state.themePreset,
      {
        onChangeMode: (mode) => callbacks.onChangeMode(mode),
        onChangeColor: (color) => callbacks.onChangeColor(color),
        onChangePreset: (preset) => callbacks.onChangePreset(preset),
      },
    ),
  )
  panel.appendChild(body)

  overlay.appendChild(panel)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) callbacks.onClose()
  })

  return overlay
}
