export default [
  {
    path: '/custom-test',
    name: 'Custom test with page 503',
    component: () => import('@/pages/errors/503.vue'),
  },
]
