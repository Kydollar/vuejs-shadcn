import { setupNProgress } from '@/plugins/nprogress'
import { setupPinia } from '@/plugins/pinia'
import { setupTanstackVueQuery } from '@/plugins/tanstack-vue-query'
import { setupTheme } from '@/plugins/theme'

export function setupPlugins(app, router) {
  setupTanstackVueQuery(app)
  setupPinia(app)
  setupTheme()
  setupNProgress(router)
}
