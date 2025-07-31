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
  scrollBehavior() {
    return { left: 0, top: 0, behavior: 'smooth' }
  },
})

if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router
