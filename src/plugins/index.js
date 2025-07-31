import { setupNProgress } from '@/plugins/nprogress'
import { setupPinia } from '@/plugins/pinia'
import { setupTheme } from '@/plugins/theme'

export function setupPlugins(app, router) {
  setupPinia(app)
  setupTheme()
  setupNProgress(router)
}
