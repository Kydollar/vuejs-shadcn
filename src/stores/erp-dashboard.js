import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBuyersStore } from './buyers'
import { useOrdersStore } from './orders'
import { useProductionStore } from './production'
import { useQCStore } from './qc'

export const useERPDashboardStore = defineStore('erpDashboard', () => {
  const loading = ref(false)
  const error = ref(null)
  const dashboardData = ref({})

  // Get other stores
  const buyersStore = useBuyersStore()
  const ordersStore = useOrdersStore()
  const productionStore = useProductionStore()
  const qcStore = useQCStore()

  // Computed dashboard metrics
  const totalOrders = computed(() => ordersStore.orders.length)
  const totalBuyers = computed(() => buyersStore.buyers.length)
  const activeBuyers = computed(() => buyersStore.activeBuyers.length)
  
  const ordersByStatus = computed(() => ({
    pending: ordersStore.pendingOrders.length,
    inProduction: ordersStore.inProductionOrders.length,
    completed: ordersStore.completedOrders.length,
    shipped: ordersStore.orders.filter(o => o.status === 'shipped').length
  }))

  const productionMetrics = computed(() => ({
    dailyOutput: productionStore.totalProducedToday,
    efficiency: productionStore.averageEfficiency,
    activeLines: Object.keys(productionStore.entriesByLine).length
  }))

  const qualityMetrics = computed(() => ({
    qualityRate: qcStore.qualityRate,
    todayInspections: qcStore.todayInspections.length,
    passedInspections: qcStore.passedInspections.length,
    failedInspections: qcStore.failedInspections.length
  }))

  // Recent activities computed
  const recentOrders = computed(() => 
    ordersStore.orders
      .slice()
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, 5)
  )

  const recentInspections = computed(() =>
    qcStore.inspections
      .slice()
      .sort((a, b) => new Date(b.inspectionDate) - new Date(a.inspectionDate))
      .slice(0, 5)
  )

  // Actions
  const initializeDashboard = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Load dummy data for all stores
      buyersStore.loadDummyData()
      ordersStore.loadDummyData()
      productionStore.loadDummyData()
      qcStore.loadDummyData()

      // Set dashboard summary data
      dashboardData.value = {
        lastUpdated: new Date().toISOString(),
        systemStatus: 'operational',
        alerts: [
          {
            id: 1,
            type: 'warning',
            message: 'Order ORD-2024-002 deadline approaching',
            timestamp: new Date().toISOString()
          },
          {
            id: 2,
            type: 'info',
            message: 'Line A efficiency exceeded target by 5%',
            timestamp: new Date().toISOString()
          }
        ]
      }
    } catch (err) {
      error.value = err.message || 'Failed to initialize dashboard'
      console.error('Error initializing dashboard:', err)
    } finally {
      loading.value = false
    }
  }

  const refreshDashboard = async () => {
    loading.value = true
    error.value = null
    
    try {
      // In a real application, you would fetch fresh data from APIs
      await Promise.all([
        buyersStore.fetchBuyers(),
        ordersStore.fetchOrders(),
        productionStore.fetchProductionEntries(),
        qcStore.fetchInspections()
      ])
      
      dashboardData.value.lastUpdated = new Date().toISOString()
    } catch (err) {
      error.value = err.message || 'Failed to refresh dashboard'
      console.error('Error refreshing dashboard:', err)
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Get dashboard widgets data
  const getWidgetsData = computed(() => [
    {
      title: 'Total Orders',
      value: totalOrders.value,
      change: '+12%',
      trend: 'up',
      icon: 'ShoppingCart'
    },
    {
      title: 'Active Buyers',
      value: activeBuyers.value,
      change: '+5%',
      trend: 'up',
      icon: 'Users'
    },
    {
      title: 'Daily Output',
      value: productionMetrics.value.dailyOutput,
      change: '+8%',
      trend: 'up',
      icon: 'Activity'
    },
    {
      title: 'Quality Rate',
      value: `${qualityMetrics.value.qualityRate}%`,
      change: '+2%',
      trend: 'up',
      icon: 'CheckCircle'
    },
    {
      title: 'In Production',
      value: ordersByStatus.value.inProduction,
      change: '-3%',
      trend: 'down',
      icon: 'Factory'
    },
    {
      title: 'Ready to Ship',
      value: ordersByStatus.value.completed,
      change: '+15%',
      trend: 'up',
      icon: 'Truck'
    }
  ])

  return {
    // State
    loading,
    error,
    dashboardData,
    
    // Computed
    totalOrders,
    totalBuyers,
    activeBuyers,
    ordersByStatus,
    productionMetrics,
    qualityMetrics,
    recentOrders,
    recentInspections,
    getWidgetsData,
    
    // Actions
    initializeDashboard,
    refreshDashboard,
    clearError
  }
})
