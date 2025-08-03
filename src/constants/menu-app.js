/**
 * Application routes
 */
export const MENU_APP = Object.freeze({
  TASKS: '/app/tasks',
  APPS: '/app/apps',
  USERS: {
    ROOT: '/app/users',
    DETAIL: '/app/users/:id',
  },
  PROFILE: '/app/profile',
  SETTINGS: '/app/settings',
  // ERP System Routes (matching auto-generated routes)
  ERP: {
    DASHBOARD: '/app/dashboard',
    MASTER_DATA: {
      BUYERS: '/app/master-data/buyers-management',
      FACTORIES: '/app/master-data/factories-management',
      PRODUCTS: '/app/master-data/products-management',
    },
    ORDERS: '/app/orders',
    PRODUCTION: '/app/production',
    QC: '/app/qc',
    FARM_OUT: '/app/farm-out',
    PACKING_LIST: '/app/packing-list',
    DELIVERY_NOTE: '/app/delivery-note',
  },

  // Example ERP System Routes (matching auto-generated routes)
  EXAMPLE_ERP: {
    DASHBOARD: '/app/example/dashboard',
    BUYERS: '/app/example/Buyers',
    FACTORIES: '/app/example/Factories',
    PRODUCTS: '/app/example/Products',
    ORDERS: '/app/example/Orders',
    ORDER_RECAP: '/app/example/order-recap',
    PRODUCTION: '/app/example/Production',
    PRODUCTION_REPORTS: '/app/example/production-reports',
    PROCESS_FLOW: '/app/example/process-flow',
    DECORATIONS: '/app/example/Decorations',
    QC: '/app/example/QC',
    FARM_OUT: '/app/example/FarmOut',
    PACKING_LIST: '/app/example/PackingList',
    DELIVERY_NOTE: '/app/example/DeliveryNote',
  },
})
