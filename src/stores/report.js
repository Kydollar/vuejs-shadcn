import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBuyerStore } from './buyer'
import { useDecorationStore } from './decoration'
import { useFactoryStore } from './factory'
import { useOrderStore } from './order'
import { useProductStore } from './product'

export const useReportStore = defineStore('report', () => {
  const loading = ref(false)
  const error = ref(null)

  // Get other stores
  const buyerStore = useBuyerStore()
  const factoryStore = useFactoryStore()
  const productStore = useProductStore()
  const orderStore = useOrderStore()
  const decorationStore = useDecorationStore()

  // Dashboard statistics
  const dashboardStats = computed(() => {
    return {
      totalBuyers: buyerStore.totalBuyers,
      totalFactories: factoryStore.totalFactories,
      totalProducts: productStore.totalProducts,
      totalOrders: orderStore.totalOrders,
      totalOrderAmount: orderStore.totalAmount,
      totalOrderQuantity: orderStore.totalQuantity,
      totalDecorations: decorationStore.totalDecorations,
      totalDecorationCost: decorationStore.totalDecorationCost,
      pendingOrders: orderStore.pendingOrders.length,
      confirmedOrders: orderStore.confirmedOrders.length,
      inProductionOrders: orderStore.inProductionOrders.length,
      completedOrders: orderStore.completedOrders.length,
    }
  })

  // Sales report by buyer
  const salesByBuyer = computed(() => {
    const sales = {}
    orderStore.orders.forEach((order) => {
      const buyer = buyerStore.getBuyerById(order.buyer_id)
      if (buyer) {
        if (!sales[buyer.name]) {
          sales[buyer.name] = {
            buyer_name: buyer.name,
            buyer_code: buyer.code,
            total_orders: 0,
            total_quantity: 0,
            total_amount: 0,
            orders: [],
          }
        }
        sales[buyer.name].total_orders += 1
        sales[buyer.name].total_quantity += order.order_qty
        sales[buyer.name].total_amount += order.amount
        sales[buyer.name].orders.push(order)
      }
    })
    return Object.values(sales)
  })

  // Production report by factory
  const productionByFactory = computed(() => {
    const production = {}
    orderStore.orders.forEach((order) => {
      const factory = factoryStore.getFactoryById(order.factory_id)
      if (factory) {
        if (!production[factory.name]) {
          production[factory.name] = {
            factory_name: factory.name,
            factory_code: factory.code,
            total_orders: 0,
            total_quantity: 0,
            total_amount: 0,
            capacity_utilization: 0,
            orders: [],
          }
        }
        production[factory.name].total_orders += 1
        production[factory.name].total_quantity += order.order_qty
        production[factory.name].total_amount += order.amount
        production[factory.name].orders.push(order)

        // Calculate capacity utilization (assuming monthly capacity)
        const monthlyProduction = production[factory.name].total_quantity
        const monthlyCapacity = factory.capacity_per_month || 1
        production[factory.name].capacity_utilization = (monthlyProduction / monthlyCapacity) * 100
      }
    })
    return Object.values(production)
  })

  // Product performance report
  const productPerformance = computed(() => {
    const performance = {}
    orderStore.orders.forEach((order) => {
      const product = productStore.getProductById(order.product_id)
      if (product) {
        if (!performance[product.style_no]) {
          performance[product.style_no] = {
            product_name: product.name,
            style_no: product.style_no,
            category: product.category,
            total_orders: 0,
            total_quantity: 0,
            total_amount: 0,
            average_price: 0,
            orders: [],
          }
        }
        performance[product.style_no].total_orders += 1
        performance[product.style_no].total_quantity += order.order_qty
        performance[product.style_no].total_amount += order.amount
        performance[product.style_no].orders.push(order)
        performance[product.style_no].average_price
          = performance[product.style_no].total_amount / performance[product.style_no].total_quantity
      }
    })
    return Object.values(performance)
  })

  // Monthly sales trend
  const monthlySalesTrend = computed(() => {
    const monthly = {}
    orderStore.orders.forEach((order) => {
      const date = new Date(order.order_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!monthly[monthKey]) {
        monthly[monthKey] = {
          month: monthKey,
          total_orders: 0,
          total_quantity: 0,
          total_amount: 0,
        }
      }
      monthly[monthKey].total_orders += 1
      monthly[monthKey].total_quantity += order.order_qty
      monthly[monthKey].total_amount += order.amount
    })

    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month))
  })

  // Order status distribution
  const orderStatusDistribution = computed(() => {
    const distribution = {}
    orderStore.orders.forEach((order) => {
      if (!distribution[order.status]) {
        distribution[order.status] = {
          status: order.status,
          count: 0,
          total_amount: 0,
          percentage: 0,
        }
      }
      distribution[order.status].count += 1
      distribution[order.status].total_amount += order.amount
    })

    const total = orderStore.totalOrders
    Object.values(distribution).forEach((item) => {
      item.percentage = total > 0 ? (item.count / total) * 100 : 0
    })

    return Object.values(distribution)
  })

  // Product category analysis
  const categoryAnalysis = computed(() => {
    const analysis = {}
    orderStore.orders.forEach((order) => {
      const product = productStore.getProductById(order.product_id)
      if (product) {
        if (!analysis[product.category]) {
          analysis[product.category] = {
            category: product.category,
            total_orders: 0,
            total_quantity: 0,
            total_amount: 0,
            unique_products: new Set(),
            average_price: 0,
          }
        }
        analysis[product.category].total_orders += 1
        analysis[product.category].total_quantity += order.order_qty
        analysis[product.category].total_amount += order.amount
        analysis[product.category].unique_products.add(product.id)
      }
    })

    return Object.values(analysis).map(item => ({
      ...item,
      unique_products: item.unique_products.size,
      average_price: item.total_quantity > 0 ? item.total_amount / item.total_quantity : 0,
    }))
  })

  // CMT Status Progress Report
  const cmtStatusReport = computed(() => {
    const statusCounts = {
      first_fso: { pending: 0, in_progress: 0, completed: 0 },
      second_fso: { pending: 0, in_progress: 0, completed: 0 },
      third_fso: { pending: 0, in_progress: 0, completed: 0 },
      pps: { pending: 0, in_progress: 0, completed: 0 },
      worksheet: { pending: 0, in_progress: 0, completed: 0 },
      approved_fso: { pending: 0, in_progress: 0, completed: 0 },
    }

    orderStore.orders.forEach((order) => {
      if (order.cmt_status) {
        Object.keys(statusCounts).forEach((stage) => {
          const status = order.cmt_status[stage] || 'pending'
          if (statusCounts[stage][status] !== undefined) {
            statusCounts[stage][status] += 1
          }
        })
      }
    })

    return statusCounts
  })

  // Top performers
  const topPerformers = computed(() => {
    const sortedBuyers = [...salesByBuyer.value].sort((a, b) => b.total_amount - a.total_amount)
    const sortedFactories = [...productionByFactory.value].sort((a, b) => b.total_amount - a.total_amount)
    const sortedProducts = [...productPerformance.value].sort((a, b) => b.total_quantity - a.total_quantity)

    return {
      topBuyers: sortedBuyers.slice(0, 5),
      topFactories: sortedFactories.slice(0, 5),
      topProducts: sortedProducts.slice(0, 5),
    }
  })

  // Actions
  const generateReport = async (reportType, filters = {}) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      let reportData = {}

      switch (reportType) {
        case 'dashboard':
          reportData = dashboardStats.value
          break
        case 'sales_by_buyer':
          reportData = salesByBuyer.value
          break
        case 'production_by_factory':
          reportData = productionByFactory.value
          break
        case 'product_performance':
          reportData = productPerformance.value
          break
        case 'monthly_trend':
          reportData = monthlySalesTrend.value
          break
        case 'status_distribution':
          reportData = orderStatusDistribution.value
          break
        case 'category_analysis':
          reportData = categoryAnalysis.value
          break
        case 'cmt_status':
          reportData = cmtStatusReport.value
          break
        case 'top_performers':
          reportData = topPerformers.value
          break
        default:
          throw new Error('Invalid report type')
      }

      return {
        type: reportType,
        data: reportData,
        filters,
        generated_at: new Date().toISOString(),
        total_records: Array.isArray(reportData) ? reportData.length : Object.keys(reportData).length,
      }
    }
    catch (err) {
      error.value = err.message
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const exportReport = async (reportData, format = 'xlsx') => {
    loading.value = true
    error.value = null
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real application, this would generate and download the file
      const fileName = `report_${reportData.type}_${new Date().toISOString().split('T')[0]}.${format}`

      return {
        success: true,
        fileName,
        url: `#download/${fileName}`,
        message: `Report exported successfully as ${format.toUpperCase()}`,
      }
    }
    catch (err) {
      error.value = err.message
      throw err
    }
    finally {
      loading.value = false
    }
  }

  return {
    // State
    loading,
    error,

    // Computed
    dashboardStats,
    salesByBuyer,
    productionByFactory,
    productPerformance,
    monthlySalesTrend,
    orderStatusDistribution,
    categoryAnalysis,
    cmtStatusReport,
    topPerformers,

    // Actions
    generateReport,
    exportReport,
  }
})
