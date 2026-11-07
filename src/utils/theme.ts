export type DisplayMode = 'light' | 'dark' | 'amoled'

export interface ColorThemeOption {
  id: string
  name: string
  color: string // 500 hex
  dark: {
    accent: string
    hover: string
    dim: string
    soft: string
  }
  light: {
    accent: string
    hover: string
    dim: string
    soft: string
  }
}

export interface ThemePresetOption {
  id: string
  name: string
  preview: string
  modes: {
    dark: {
      accent: string
      bg: string
      surface: string
      surfaceRaised: string
      line: string
      lineSoft: string
      ink?: string
      inkDim?: string
    }
    light: {
      accent: string
      bg: string
      surface: string
      surfaceRaised: string
      line: string
      lineSoft: string
      ink?: string
      inkDim?: string
    }
  }
}

// 7 exact FMHY color themes
export const COLOR_THEMES: Record<string, ColorThemeOption> = {
  swarm: {
    id: 'swarm',
    name: 'Swarm',
    color: '#5d9cec',
    dark: {
      accent: '#7aa2f7',
      hover: '#93b6f8',
      dim: '#4f78c8',
      soft: 'color-mix(in srgb, #7aa2f7 14%, transparent)',
    },
    light: {
      accent: '#3e63b0',
      hover: '#2f4f91',
      dim: '#5c80ce',
      soft: 'color-mix(in srgb, #3e63b0 12%, transparent)',
    },
  },
  turquoise: {
    id: 'turquoise',
    name: 'Turquoise',
    color: '#0fb5cf',
    dark: {
      accent: '#49d3e9',
      hover: '#67def2',
      dim: '#2395a8',
      soft: 'color-mix(in srgb, #49d3e9 14%, transparent)',
    },
    light: {
      accent: '#0e7490',
      hover: '#0a5970',
      dim: '#2297b8',
      soft: 'color-mix(in srgb, #0e7490 12%, transparent)',
    },
  },
  carnation: {
    id: 'carnation',
    name: 'Carnation',
    color: '#f43f5e',
    dark: {
      accent: '#fb7185',
      hover: '#fc8e9f',
      dim: '#c93c52',
      soft: 'color-mix(in srgb, #fb7185 14%, transparent)',
    },
    light: {
      accent: '#e11d48',
      hover: '#be123c',
      dim: '#ea496e',
      soft: 'color-mix(in srgb, #e11d48 12%, transparent)',
    },
  },
  cerise: {
    id: 'cerise',
    name: 'Cerise',
    color: '#ec4899',
    dark: {
      accent: '#f472b6',
      hover: '#f68fc4',
      dim: '#bf367e',
      soft: 'color-mix(in srgb, #f472b6 14%, transparent)',
    },
    light: {
      accent: '#db2777',
      hover: '#be185d',
      dim: '#e44a90',
      soft: 'color-mix(in srgb, #db2777 12%, transparent)',
    },
  },
  meadow: {
    id: 'meadow',
    name: 'Meadow',
    color: '#10b981',
    dark: {
      accent: '#34d399',
      hover: '#5eead4',
      dim: '#15803d',
      soft: 'color-mix(in srgb, #34d399 14%, transparent)',
    },
    light: {
      accent: '#059669',
      hover: '#047857',
      dim: '#10b981',
      soft: 'color-mix(in srgb, #059669 12%, transparent)',
    },
  },
  merlin: {
    id: 'merlin',
    name: 'Merlin',
    color: '#f59e0b',
    dark: {
      accent: '#fbbf24',
      hover: '#fcd34d',
      dim: '#b45309',
      soft: 'color-mix(in srgb, #fbbf24 14%, transparent)',
    },
    light: {
      accent: '#d97706',
      hover: '#b45309',
      dim: '#f59e0b',
      soft: 'color-mix(in srgb, #d97706 12%, transparent)',
    },
  },
  'blue-violet': {
    id: 'blue-violet',
    name: 'Blue Violet',
    color: '#8b5cf6',
    dark: {
      accent: '#a78bfa',
      hover: '#c4b5fd',
      dim: '#6d28d9',
      soft: 'color-mix(in srgb, #a78bfa 14%, transparent)',
    },
    light: {
      accent: '#7c3aed',
      hover: '#6d28d9',
      dim: '#8b5cf6',
      soft: 'color-mix(in srgb, #7c3aed 12%, transparent)',
    },
  },
}

// Map legacy color IDs
export const LEGACY_COLOR_MAP: Record<string, string> = {
  blossom: 'swarm',
  sky: 'turquoise',
  rose: 'carnation',
  lilac: 'blue-violet',
  sage: 'meadow',
  gold: 'merlin',
}

// Exact Theme Presets from fmhy/edit
export const THEME_PRESETS: Record<string, ThemePresetOption> = {
  catppuccin: {
    id: 'catppuccin',
    name: 'Catppuccin',
    preview: 'linear-gradient(135deg, #cba6f6 0%, #b4befe 100%)',
    modes: {
      dark: {
        accent: '#CBA6F6',
        bg: '#1F1E2E',
        surface: '#252438',
        surfaceRaised: '#2e2d42',
        line: '#38364e',
        lineSoft: '#2d2b3f',
        ink: '#cdd6f4',
        inkDim: '#a6adc8',
      },
      light: {
        accent: '#7c3aed',
        bg: '#f8fafc',
        surface: '#eef2f5',
        surfaceRaised: '#ffffff',
        line: '#dce0e8',
        lineSoft: '#e6e9ef',
        ink: '#353638',
        inkDim: '#6b7280',
      },
    },
  },
  halloween: {
    id: 'halloween',
    name: 'Halloween',
    preview: 'linear-gradient(135deg, #EA580C 0%, #7C3AED 100%)',
    modes: {
      dark: {
        accent: '#EA580C',
        bg: '#18181b',
        surface: '#22201e',
        surfaceRaised: '#2b2724',
        line: '#3a342e',
        lineSoft: '#2e2a25',
        ink: '#faf5ee',
        inkDim: '#b3a89d',
      },
      light: {
        accent: '#C2410C',
        bg: '#faf7f4',
        surface: '#f2ece6',
        surfaceRaised: '#ffffff',
        line: '#e2dad0',
        lineSoft: '#ede5dc',
        ink: '#1c1917',
        inkDim: '#78716c',
      },
    },
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    preview: '#808080',
    modes: {
      dark: {
        accent: '#FFFFFF',
        bg: '#141414',
        surface: '#1f1f1f',
        surfaceRaised: '#292929',
        line: '#333333',
        lineSoft: '#282828',
        ink: '#FFFFFF',
        inkDim: '#8A8A8A',
      },
      light: {
        accent: '#000000',
        bg: '#FFFFFF',
        surface: '#F5F5F5',
        surfaceRaised: '#EBEBEB',
        line: '#E0E0E0',
        lineSoft: '#EEEEEE',
        ink: '#000000',
        inkDim: '#555555',
      },
    },
  },
  monolith: {
    id: 'monolith',
    name: 'Monolith',
    preview: 'linear-gradient(135deg, #F42A8B 0%, #3A0CA3 100%)',
    modes: {
      dark: {
        accent: '#F42A8B',
        bg: '#06070B',
        surface: '#0E101A',
        surfaceRaised: '#161928',
        line: '#20253a',
        lineSoft: '#151928',
        ink: '#D2F4FF',
        inkDim: '#7596A8',
      },
      light: {
        accent: '#D81B70',
        bg: '#F5FBFF',
        surface: '#E8F4FD',
        surfaceRaised: '#FFFFFF',
        line: '#C6E2FA',
        lineSoft: '#D8ECFD',
        ink: '#0A0E1A',
        inkDim: '#53627B',
      },
    },
  },
}

export function resolveColorTheme(colorId: string): ColorThemeOption {
  const mapped = LEGACY_COLOR_MAP[colorId] || colorId
  return COLOR_THEMES[mapped] || COLOR_THEMES.swarm
}

export function applyTheme(mode: DisplayMode, colorId: string, presetId: string | null = null) {
  const root = document.documentElement
  const isAmoled = mode === 'amoled'
  const isDark = mode === 'dark' || isAmoled

  // Set DOM attributes and classes
  root.setAttribute('data-theme', mode)
  root.classList.toggle('dark', isDark)
  root.classList.toggle('light', !isDark)
  root.classList.toggle('amoled', isAmoled)

  if (presetId && THEME_PRESETS[presetId]) {
    root.setAttribute('data-theme-preset', presetId)
    const preset = THEME_PRESETS[presetId]
    const pMode = isDark ? preset.modes.dark : preset.modes.light

    let bg = pMode.bg
    let surface = pMode.surface
    let surfaceRaised = pMode.surfaceRaised
    let line = pMode.line
    let lineSoft = pMode.lineSoft

    if (isAmoled) {
      bg = '#000000'
      surface = '#09090b'
      surfaceRaised = '#121216'
      line = '#1f1f24'
      lineSoft = '#16161a'
    }

    root.style.setProperty('--bg', bg)
    root.style.setProperty('--surface', surface)
    root.style.setProperty('--surface-raised', surfaceRaised)
    root.style.setProperty('--line', line)
    root.style.setProperty('--line-soft', lineSoft)
    root.style.setProperty('--nav-bg', isAmoled ? 'rgba(0, 0, 0, 0.96)' : `color-mix(in srgb, ${bg} 92%, transparent)`)

    if (pMode.ink) root.style.setProperty('--ink', pMode.ink)
    else root.style.removeProperty('--ink')

    if (pMode.inkDim) root.style.setProperty('--ink-dim', pMode.inkDim)
    else root.style.removeProperty('--ink-dim')

    const accent = pMode.accent
    root.style.setProperty('--accent', accent)
    root.style.setProperty('--accent-hover', `color-mix(in srgb, ${accent} 85%, white)`)
    root.style.setProperty('--accent-dim', `color-mix(in srgb, ${accent} 70%, black)`)
    root.style.setProperty('--accent-soft', `color-mix(in srgb, ${accent} 14%, transparent)`)
    root.style.setProperty('--signal', accent)
    root.style.setProperty('--signal-dim', `color-mix(in srgb, ${accent} 75%, black)`)
    root.style.setProperty('--link', accent)
  } else {
    root.removeAttribute('data-theme-preset')
    root.style.removeProperty('--bg')
    root.style.removeProperty('--surface')
    root.style.removeProperty('--surface-raised')
    root.style.removeProperty('--line')
    root.style.removeProperty('--line-soft')
    root.style.removeProperty('--nav-bg')
    root.style.removeProperty('--ink')
    root.style.removeProperty('--ink-dim')

    if (isAmoled) {
      root.style.setProperty('--bg', '#000000')
      root.style.setProperty('--surface', '#09090b')
      root.style.setProperty('--surface-raised', '#121216')
      root.style.setProperty('--line', '#1e1e24')
      root.style.setProperty('--line-soft', '#16161b')
      root.style.setProperty('--nav-bg', 'rgba(0, 0, 0, 0.96)')
    }

    const theme = resolveColorTheme(colorId)
    const palette = isDark ? theme.dark : theme.light
    root.style.setProperty('--accent', palette.accent)
    root.style.setProperty('--accent-hover', palette.hover)
    root.style.setProperty('--accent-dim', palette.dim)
    root.style.setProperty('--accent-soft', palette.soft)
    root.style.setProperty('--signal', palette.accent)
    root.style.setProperty('--signal-dim', palette.dim)
    root.style.setProperty('--link', palette.accent)
  }
}
