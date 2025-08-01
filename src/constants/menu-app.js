/**
 * Application routes
 */
export const MENU_APP = Object.freeze({
  DASHBOARD: '/app/dashboard',
  TASKS: '/app/tasks',
  APPS: '/app/apps',
  USERS: {
    ROOT: '/app/users',
    DETAIL: '/app/users/:id',
  },
  PROFILE: '/app/profile',
  SETTINGS: '/app/settings',
  // ERP Routes
  ERP: {
    DASHBOARD: '/app/erp-dashboard',
    BUYERS: '/app/buyers',
    FACTORIES: '/app/factories',
    PRODUCTS: '/app/products',
    ORDERS: '/app/orders',
    DECORATIONS: '/app/decorations',
    REPORTS: '/app/reports',
    // Workflow Routes
    PRODUCTION: '/app/production',
    QC: '/app/qc',
    FARMOUT: '/app/farmout',
    PACKING_LIST: '/app/packinglist',
    DELIVERY_NOTE: '/app/deliverynote',
  },
})
