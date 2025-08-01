import { setupI18n } from '@/plugins/i18n'
import { setupNProgress } from '@/plugins/nprogress'
import { setupPinia } from '@/plugins/pinia'
import { setupTanstackVueQuery } from '@/plugins/tanstack-vue-query'
import { setupTheme } from '@/plugins/theme'

export function setupPlugins(app, router) {
  setupI18n(app)
  setupTanstackVueQuery(app)
  setupPinia(app)
  setupTheme()
  setupNProgress(router)
}
