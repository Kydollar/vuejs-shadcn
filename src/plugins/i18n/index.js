import { createI18n } from 'vue-i18n'

import en from '@/locales/en.json'
import id from '@/locales/id.json'

const messages = {
  en,
  id,
}

export function setupI18n(app) {
  const instance = createI18n({
    legacy: false, // Use composition API
    locale: localStorage.getItem('language') || 'en',
    fallbackLocale: 'en',
    messages,
  })

  app.use(instance)
}
