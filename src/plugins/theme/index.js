import { THEMES, useThemeStore } from '@/stores/theme'

// Daftar semua tema

export function setupTheme() {
  const themeStore = useThemeStore()

  const theme = localStorage.getItem('theme') || themeStore.theme
  const radius = localStorage.getItem('radius') || themeStore.radius
  const vueuseColorScheme =
    localStorage.getItem('vueuse-color-scheme') || themeStore.vueuseColorScheme

  // Set theme class di html
  document.documentElement.classList.add(vueuseColorScheme)
  document.documentElement.classList.remove(...THEMES.map(t => `theme-${t}`))
  document.documentElement.classList.add(`theme-${theme}`)

  // Set custom radius variable
  document.documentElement.style.setProperty('--radius', `${radius}rem`)
}
