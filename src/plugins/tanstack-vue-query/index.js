import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
})

export function setupTanstackVueQuery(app) {
  app.use(VueQueryPlugin, {
    enableDevtoolsV6Plugin: true,
    queryClient,
  })
}
