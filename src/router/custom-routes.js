export default [
  {
    path: '/custom-test',
    name: 'Custom test with page 503',
    component: () => import('@/pages/errors/503.vue'),
  },
  // ERP Custom Routes
  {
    path: '/app/order-recap',
    name: 'OrderRecap',
    component: () => import('@/pages/app/order-recap.vue'),
  },
  {
    path: '/app/production-reports',
    name: 'ProductionReports',
    component: () => import('@/pages/app/production-reports.vue'),
  },
  {
    path: '/app/process-flow',
    name: 'ProcessFlow',
    component: () => import('@/pages/app/process-flow.vue'),
  },
]
