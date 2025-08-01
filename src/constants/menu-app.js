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
  
  // ERP Routes (matching auto-generated routes)
  ERP: {
    BUYERS: '/app/Buyers',
    FACTORIES: '/app/Factories',
    PRODUCTS: '/app/Products',
    ORDERS: '/app/Orders',
    DECORATIONS: '/app/Decorations',
    PRODUCTION: '/app/Production',
    QC: '/app/QC',
    FARM_OUT: '/app/FarmOut',
    PACKING_LIST: '/app/PackingList',
    DELIVERY_NOTE: '/app/DeliveryNote'
  }
})
