export const ACCENT_COLORS = {
    purple: {
        light: { primary: '#7c3aed', primaryHover: '#6d28d9' },
        dark: { primary: '#a78bfa', primaryHover: '#c4b5fd' },
    },
    orange: {
        light: { primary: '#ea580c', primaryHover: '#c2410c' },
        dark: { primary: '#fb923c', primaryHover: '#fdba74' },
    },
    blue: {
        light: { primary: '#2563eb', primaryHover: '#1d4ed8' },
        dark: { primary: '#60a5fa', primaryHover: '#93c5fd' },
    },
    green: {
        light: { primary: '#16a34a', primaryHover: '#15803d' },
        dark: { primary: '#4ade80', primaryHover: '#86efac' },
    },
    pink: {
        light: { primary: '#db2777', primaryHover: '#be185d' },
        dark: { primary: '#f472b6', primaryHover: '#f9a8d4' },
    },
} as const

export type AccentColorName = keyof typeof ACCENT_COLORS

const STORAGE_KEY = 'accentColor'

export function getStoredAccentColor(): AccentColorName {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored && stored in ACCENT_COLORS ? (stored as AccentColorName) : 'purple'
}

export function storeAccentColor(name: AccentColorName) {
    localStorage.setItem(STORAGE_KEY, name)
}

export function applyAccentColor(name: AccentColorName) {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const palette = ACCENT_COLORS[name][isDark ? 'dark' : 'light']
    document.documentElement.style.setProperty('--color-primary', palette.primary)
    document.documentElement.style.setProperty('--color-primary-hover', palette.primaryHover)
}