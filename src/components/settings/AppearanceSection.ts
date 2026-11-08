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

// The settings overlay and the mobile nav screen render this section once and
// never rebuild it, so a click must move its own highlight + check mark
// instead of waiting for a re-render that never happens.
function syncSelection(list: HTMLElement, selected: HTMLElement, checkClass: string): void {
  Array.from(list.children).forEach(child => {
    const item = child as HTMLElement
    const active = item === selected
    item.classList.toggle('active', active)
    item.setAttribute('aria-pressed', active ? 'true' : 'false')

    item.querySelectorAll(`.${checkClass}`).forEach(c => c.remove())
    if (active) {
      const isModeBtn = item.classList.contains('appearance-mode-btn')
      const check = el('span', { class: checkClass })
      check.innerHTML = icon('check', isModeBtn ? 14 : 12)
      const holder = isModeBtn ? item : item.querySelector('.appearance-swatch-circle')
      if (holder) holder.appendChild(check)
    }
  })
}

// Picking from one group deselects the other (a preset is replaced by a plain
// color and vice versa) — clear the leftover highlights so they stay in sync.
function clearSelections(list: HTMLElement): void {
  Array.from(list.children).forEach(child => {
    const item = child as HTMLElement
    item.classList.remove('active')
    item.setAttribute('aria-pressed', 'false')
    item.querySelector('.appearance-swatch-check')?.remove()
  })
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
      syncSelection(modeList, btn, 'appearance-mode-check')
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
      // presetGrid is declared later in this function; the closure only runs
      // after the section finishes rendering, so the reference is valid here.
      syncSelection(colorGrid, swatchBtn, 'appearance-swatch-check')
      clearSelections(presetGrid)
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
      syncSelection(presetGrid, presetBtn, 'appearance-swatch-check')
      clearSelections(colorGrid)
    })
    presetGrid.appendChild(presetBtn)
  })
  presetGroup.appendChild(presetGrid)
  container.appendChild(presetGroup)

  return container
}
