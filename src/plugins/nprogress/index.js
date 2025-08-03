import nprogress from 'nprogress'

export function setupNProgress(router) {
  nprogress.configure({
    showSpinner: false,
    speed: 500,
    trickleSpeed: 200,
    className: 'custom-color-progress',
  })

  router.beforeEach((to) => {
    nprogress.start()
    if (import.meta.env.DEV) {
      to.meta.__navigationStart = performance.now()
    }
    return true
  })

  router.afterEach((to) => {
    nprogress.done()
    if (import.meta.env.DEV && to.meta.__navigationStart) {
      const duration = performance.now() - to.meta.__navigationStart
      if (duration > 100) {
        console.warn(`[Router] 🐌 Slow navigation to ${to.path}: ${duration.toFixed(2)}ms`)
      }
    }
  })

  router.onError(() => {
    nprogress.done()
  })
}
