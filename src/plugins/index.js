import { setupPinia } from '@/plugins/pinia'
import { setupNProgress } from '@/plugins/nprogress'

export function setupPlugins(app) {
  setupNProgress()
  setupPinia(app)
}
