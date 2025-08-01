import { createApp } from 'vue'

import router from '@/router'

import App from './App.vue'
import { setupPlugins } from './plugins'
import './assets/main.css'

function bootstrap() {
  const app = createApp(App)

  // Setup plugins
  setupPlugins(app, router)

  app.use(router)
  app.mount('#app')
}

bootstrap()
