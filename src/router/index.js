import { createRouter, createWebHistory } from 'vue-router'
import { routes as autoRoutes, handleHotUpdate } from 'vue-router/auto-routes'
import customRoutes from './custom-routes'

const routes = [
  ...autoRoutes, // auto routes dari src/views
  ...customRoutes, // custom routes yang ditambahkan
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Jika ada savedPosition (browser back/forward), gunakan itu
    if (savedPosition) {
      return savedPosition
    }

    // Jika navigasi dalam app (halaman dengan sidebar), jangan auto-scroll
    // Biarkan masing-masing komponen mengatur scroll sendiri
    if (to.path.startsWith('/app/') && from.path.startsWith('/app/')) {
      return false
    }

    // Untuk navigasi lain, scroll ke top
    return { top: 0, behavior: 'smooth' }
  },
})

if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router
