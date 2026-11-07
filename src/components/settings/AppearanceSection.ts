import { el } from '../../utils/dom'
import { icon } from '../../utils/icons'
import {
  COLOR_THEMES,
  THEME_PRESETS,
  resolveColorTheme,
  type DisplayMode,
} from '../../utils/theme'

export interface AppearanceSectionCallbacks {
  onChangeMode: (mode: DisplayMode) => void
  onChangeColor: (colorId: string) => void
  onChangePreset: (presetId: string | null) => void
}

export function AppearanceSection(
  currentMode: DisplayMode,
  currentColor: string,
  currentPreset: string | null,
  callbacks: AppearanceSectionCallbacks,
  options: { compact?: boolean } = {},
): HTMLElement {
  const container = el('div', { class: `appearance-section${options.compact ? ' compact' : ''}` })

  // 1. Display Mode (Light / Dark / AMOLED)
  const modeGroup = el('div', { class: 'appearance-group' })
  modeGroup.appendChild(el('div', { class: 'appearance-group-title' }, 'Appearance'))

  const modeList = el('div', {
    class: 'appearance-mode-list',
    role: 'group',
    'aria-label': 'Display Mode',
  })

  const modes: Array<{ id: DisplayMode; label: string; iconName: 'sun' | 'moon' | 'moonStars' }> = [
    { id: 'light', label: 'Light', iconName: 'sun' },
    { id: 'dark', label: 'Dark', iconName: 'moon' },
    { id: 'amoled', label: 'AMOLED', iconName: 'moonStars' },
  ]

  modes.forEach(m => {
    const isActive = currentMode === m.id
    const btn = el('button', {
      type: 'button',
      class: `appearance-mode-btn${isActive ? ' active' : ''}`,
      'aria-pressed': isActive ? 'true' : 'false',
    })
    btn.innerHTML = `
      <span class="appearance-mode-icon">${icon(m.iconName, 18)}</span>
      <span class="appearance-mode-label">${m.label}</span>
      ${isActive ? `<span class="appearance-mode-check">${icon('check', 14)}</span>` : ''}
    `
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      callbacks.onChangeMode(m.id)
    })
    modeList.appendChild(btn)
  })
  modeGroup.appendChild(modeList)
  container.appendChild(modeGroup)

  const divider1 = el('div', { class: 'appearance-divider' })
  container.appendChild(divider1)

  // 2. Color Themes (Color changing feature)
  const colorGroup = el('div', { class: 'appearance-group' })
  colorGroup.appendChild(el('div', { class: 'appearance-group-title' }, 'Color Themes'))

  const colorGrid = el('div', {
    class: 'appearance-swatch-grid',
    role: 'group',
    'aria-label': 'Color Themes',
  })

  const resolvedColor = resolveColorTheme(currentColor).id

  Object.values(COLOR_THEMES).forEach(c => {
    const isActive = !currentPreset && resolvedColor === c.id
    const swatchBtn = el('button', {
      type: 'button',
      class: `appearance-swatch-btn${isActive ? ' active' : ''}`,
      title: c.name,
      'aria-label': c.name,
      'aria-pressed': isActive ? 'true' : 'false',
    })

    const circle = el('span', {
      class: 'appearance-swatch-circle',
      style: `background-color: ${c.color}`,
    })
    if (isActive) {
      circle.innerHTML = `<span class="appearance-swatch-check">${icon('check', 12)}</span>`
    }
    swatchBtn.appendChild(circle)

    swatchBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      callbacks.onChangePreset(null)
      callbacks.onChangeColor(c.id)
    })
    colorGrid.appendChild(swatchBtn)
  })
  colorGroup.appendChild(colorGrid)
  container.appendChild(colorGroup)

  const divider2 = el('div', { class: 'appearance-divider' })
  container.appendChild(divider2)

  // 3. Theme Presets (copied from https://github.com/fmhy/edit)
  const presetGroup = el('div', { class: 'appearance-group' })
  presetGroup.appendChild(el('div', { class: 'appearance-group-title' }, 'Theme Presets'))

  const presetGrid = el('div', {
    class: 'appearance-swatch-grid preset-grid',
    role: 'group',
    'aria-label': 'Theme Presets',
  })

  Object.values(THEME_PRESETS).forEach(p => {
    const isActive = currentPreset === p.id
    const presetBtn = el('button', {
      type: 'button',
      class: `appearance-swatch-btn preset${isActive ? ' active' : ''}`,
      title: p.name,
      'aria-label': p.name,
      'aria-pressed': isActive ? 'true' : 'false',
    })

    const circle = el('span', {
      class: 'appearance-swatch-circle',
      style: p.preview.startsWith('linear') || p.preview.startsWith('#')
        ? `background: ${p.preview}`
        : `background-color: var(--accent)`,
    })
    if (isActive) {
      circle.innerHTML = `<span class="appearance-swatch-check">${icon('check', 12)}</span>`
    }
    presetBtn.appendChild(circle)
    presetBtn.appendChild(el('span', { class: 'appearance-preset-label' }, p.name))

    presetBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      callbacks.onChangePreset(p.id)
    })
    presetGrid.appendChild(presetBtn)
  })
  presetGroup.appendChild(presetGrid)
  container.appendChild(presetGroup)

  return container
}
