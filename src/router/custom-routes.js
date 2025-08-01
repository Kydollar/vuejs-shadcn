export default [
  {
    path: '/custom-test',
    name: 'Custom test with page 503',
    component: () => import('@/pages/errors/503.vue'),
  },
  // ERP Routes
  {
    path: '/app/erp-dashboard',
    name: 'ERP Dashboard',
    component: () => import('@/pages/app/erp-dashboard.vue'),
    meta: {
      title: 'ERP Dashboard',
      description: 'Overview of your ERP system with key metrics and insights',
    },
  },
  {
    path: '/app/buyers',
    name: 'Buyers Management',
    component: () => import('@/pages/app/buyers.vue'),
    meta: {
      title: 'Buyers',
      description: 'Manage buyer relationships and track their orders',
    },
  },
  {
    path: '/app/factories',
    name: 'Factories Management',
    component: () => import('@/pages/app/factories.vue'),
    meta: {
      title: 'Factories',
      description: 'Manage production facilities and their capabilities',
    },
  },
  {
    path: '/app/products',
    name: 'Products Management',
    component: () => import('@/pages/app/products.vue'),
    meta: {
      title: 'Products',
      description: 'Manage your product catalog and specifications',
    },
  },
  {
    path: '/app/orders',
    name: 'Orders Management',
    component: () => import('@/pages/app/orders.vue'),
    meta: {
      title: 'Orders',
      description: 'Manage production orders and track their progress',
    },
  },
  {
    path: '/app/decorations',
    name: 'Decorations Management',
    component: () => import('@/pages/app/decorations.vue'),
    meta: {
      title: 'Decorations',
      description: 'Manage decoration components and specifications',
    },
  },
  {
    path: '/app/reports',
    name: 'Reports & Analytics',
    component: () => import('@/pages/app/reports.vue'),
    meta: {
      title: 'Reports',
      description: 'Generate and export various business reports',
    },
  },
  // Additional ERP Workflow Pages
  {
    path: '/app/production',
    name: 'Production Input',
    component: () => import('@/pages/app/production.vue'),
    meta: {
      title: 'Production',
      description: 'Input production per jam/per line workflow',
    },
  },
  {
    path: '/app/qc',
    name: 'Quality Control',
    component: () => import('@/pages/app/qc.vue'),
    meta: {
      title: 'Quality Control',
      description: 'Input Qty dicek QC dan Qty Reject workflow',
    },
  },
  {
    path: '/app/farmout',
    name: 'Farm Out Management',
    component: () => import('@/pages/app/farmout.vue'),
    meta: {
      title: 'Farm Out',
      description: 'Input Farm-Out per style dan per size workflow',
    },
  },
  {
    path: '/app/packinglist',
    name: 'Packing List',
    component: () => import('@/pages/app/packinglist.vue'),
    meta: {
      title: 'Packing List',
      description: 'Print Detail Packing List workflow',
    },
  },
  {
    path: '/app/deliverynote',
    name: 'Delivery Note',
    component: () => import('@/pages/app/deliverynote.vue'),
    meta: {
      title: 'Delivery Note',
      description: 'Print Surat Jalan workflow',
    },
  },
]
