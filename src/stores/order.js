import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Dummy data
  const dummyOrders = [
    {
      id: 1,
      order_number: 'ORD-2024-001',
      buyer_id: 1,
      factory_id: 1,
      product_id: 1,
      order_qty: 5000,
      price: 12.50,
      amount: 62500,
      remarks: 'Rush order - needed by March 15',
      status: 'confirmed',
      priority: 'high',
      order_date: '2024-01-15',
      delivery_date: '2024-03-15',
      created_at: '2024-01-15',
      updated_at: '2024-01-16',
      decorations: [
        {
          id: 1,
          type: 'rhinestone',
          description: 'Silver rhinestone logo on front',
          quantity: 5000,
          weight: 2.5,
        },
      ],
      cmt_status: {
        first_fso: 'pending',
        second_fso: 'pending',
        third_fso: 'pending',
        pps: 'pending',
        worksheet: 'pending',
        approved_fso: 'pending',
      },
    },
    {
      id: 2,
      order_number: 'ORD-2024-002',
      buyer_id: 2,
      factory_id: 2,
      product_id: 2,
      order_qty: 3000,
      price: 18.75,
      amount: 56250,
      remarks: 'Standard delivery',
      status: 'in_production',
      priority: 'medium',
      order_date: '2024-01-20',
      delivery_date: '2024-04-20',
      created_at: '2024-01-20',
      updated_at: '2024-02-01',
      decorations: [
        {
          id: 2,
          type: 'embroidery',
          description: 'Company logo embroidery',
          quantity: 3000,
          weight: 1.8,
        },
      ],
      cmt_status: {
        first_fso: 'completed',
        second_fso: 'in_progress',
        third_fso: 'pending',
        pps: 'pending',
        worksheet: 'completed',
        approved_fso: 'pending',
      },
    },
    {
      id: 3,
      order_number: 'ORD-2024-003',
      buyer_id: 3,
      factory_id: 3,
      product_id: 3,
      order_qty: 2500,
      price: 32.00,
      amount: 80000,
      remarks: 'Quality inspection required',
      status: 'completed',
      priority: 'medium',
      order_date: '2024-02-01',
      delivery_date: '2024-05-01',
      created_at: '2024-02-01',
      updated_at: '2024-04-15',
      decorations: [
        {
          id: 3,
          type: 'screen_print',
          description: 'Multi-color screen print design',
          quantity: 2500,
          weight: 3.2,
        },
      ],
      cmt_status: {
        first_fso: 'completed',
        second_fso: 'completed',
        third_fso: 'completed',
        pps: 'completed',
        worksheet: 'completed',
        approved_fso: 'completed',
      },
    },
    {
      id: 4,
      order_number: 'ORD-2024-004',
      buyer_id: 4,
      factory_id: 4,
      product_id: 4,
      order_qty: 4000,
      price: 45.50,
      amount: 182000,
      remarks: 'Custom fit requirements',
      status: 'pending',
      priority: 'low',
      order_date: '2024-02-10',
      delivery_date: '2024-06-10',
      created_at: '2024-02-10',
      updated_at: '2024-02-10',
      decorations: [
        {
          id: 4,
          type: 'laser_cut',
          description: 'Laser cut pocket details',
          quantity: 4000,
          weight: 0.5,
        },
      ],
      cmt_status: {
        first_fso: 'pending',
        second_fso: 'pending',
        third_fso: 'pending',
        pps: 'pending',
        worksheet: 'pending',
        approved_fso: 'pending',
      },
    },
    {
      id: 5,
      order_number: 'ORD-2024-005',
      buyer_id: 5,
      factory_id: 5,
      product_id: 5,
      order_qty: 1800,
      price: 28.90,
      amount: 52020,
      remarks: 'Seasonal collection',
      status: 'confirmed',
      priority: 'medium',
      order_date: '2024-02-15',
      delivery_date: '2024-05-15',
      created_at: '2024-02-15',
      updated_at: '2024-02-16',
      decorations: [
        {
          id: 5,
          type: 'applique',
          description: 'Floral applique details',
          quantity: 1800,
          weight: 4.0,
        },
      ],
      cmt_status: {
        first_fso: 'completed',
        second_fso: 'pending',
        third_fso: 'pending',
        pps: 'pending',
        worksheet: 'completed',
        approved_fso: 'pending',
      },
    },
    {
      id: 6,
      order_number: 'ORD-2024-006',
      buyer_id: 1,
      factory_id: 2,
      product_id: 6,
      order_qty: 3500,
      price: 25.60,
      amount: 89600,
      remarks: 'Repeat order from previous season',
      status: 'in_production',
      priority: 'high',
      order_date: '2024-03-01',
      delivery_date: '2024-06-01',
      created_at: '2024-03-01',
      updated_at: '2024-03-15',
      decorations: [
        {
          id: 6,
          type: 'heat_transfer',
          description: 'Heat transfer vinyl logo',
          quantity: 3500,
          weight: 1.2,
        },
      ],
      cmt_status: {
        first_fso: 'completed',
        second_fso: 'completed',
        third_fso: 'in_progress',
        pps: 'pending',
        worksheet: 'completed',
        approved_fso: 'pending',
      },
    },
  ]

  // Computed
  const totalOrders = computed(() => orders.value.length)
  const totalAmount = computed(() => orders.value.reduce((sum, order) => sum + (order.amount || 0), 0))
  const totalQuantity = computed(() => orders.value.reduce((sum, order) => sum + (order.order_qty || 0), 0))

  const ordersByStatus = computed(() => {
    const grouped = {}
    orders.value.forEach((order) => {
      if (!grouped[order.status]) {
        grouped[order.status] = []
      }
      grouped[order.status].push(order)
    })
    return grouped
  })

  const ordersByPriority = computed(() => {
    const grouped = {}
    orders.value.forEach((order) => {
      if (!grouped[order.priority]) {
        grouped[order.priority] = []
      }
      grouped[order.priority].push(order)
    })
    return grouped
  })

  const pendingOrders = computed(() => orders.value.filter(order => order.status === 'pending'))
  const confirmedOrders = computed(() => orders.value.filter(order => order.status === 'confirmed'))
  const inProductionOrders = computed(() => orders.value.filter(order => order.status === 'in_production'))
  const completedOrders = computed(() => orders.value.filter(order => order.status === 'completed'))

  // Actions
  const fetchOrders = async () => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      orders.value = dummyOrders
    }
    catch (err) {
      error.value = err.message
    }
    finally {
      loading.value = false
    }
  }

  const getOrderById = (id) => {
    return orders.value.find(order => order.id === id)
  }

  const getOrdersByBuyer = (buyerId) => {
    return orders.value.filter(order => order.buyer_id === buyerId)
  }

  const getOrdersByFactory = (factoryId) => {
    return orders.value.filter(order => order.factory_id === factoryId)
  }

  const getOrdersByProduct = (productId) => {
    return orders.value.filter(order => order.product_id === productId)
  }

  const getOrdersByDateRange = (startDate, endDate) => {
    return orders.value.filter((order) => {
      const orderDate = new Date(order.order_date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return orderDate >= start && orderDate <= end
    })
  }

  const searchOrders = (query) => {
    const searchTerm = query.toLowerCase()
    return orders.value.filter(order =>
      order.order_number.toLowerCase().includes(searchTerm)
      || order.remarks.toLowerCase().includes(searchTerm)
      || order.status.toLowerCase().includes(searchTerm),
    )
  }

  const createOrder = async (orderData) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const newOrder = {
        id: Date.now(),
        order_number: `ORD-${new Date().getFullYear()}-${String(orders.value.length + 1).padStart(3, '0')}`,
        ...orderData,
        amount: orderData.order_qty * orderData.price,
        status: 'pending',
        priority: orderData.priority || 'medium',
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
        decorations: orderData.decorations || [],
        cmt_status: {
          first_fso: 'pending',
          second_fso: 'pending',
          third_fso: 'pending',
          pps: 'pending',
          worksheet: 'pending',
          approved_fso: 'pending',
        },
      }
      orders.value.push(newOrder)
      return newOrder
    }
    catch (err) {
      error.value = err.message
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const updateOrder = async (id, orderData) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = orders.value.findIndex(order => order.id === id)
      if (index !== -1) {
        const updatedOrder = {
          ...orders.value[index],
          ...orderData,
          updated_at: new Date().toISOString().split('T')[0],
        }
        // Recalculate amount if qty or price changed
        if (orderData.order_qty || orderData.price) {
          updatedOrder.amount = (orderData.order_qty || orders.value[index].order_qty)
            * (orderData.price || orders.value[index].price)
        }
        orders.value[index] = updatedOrder
        return orders.value[index]
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

  const updateOrderStatus = async (id, status) => {
    return updateOrder(id, { status })
  }

  const updateCMTStatus = async (id, cmtStatus) => {
    const order = getOrderById(id)
    if (order) {
      const updatedCMTStatus = { ...order.cmt_status, ...cmtStatus }
      return updateOrder(id, { cmt_status: updatedCMTStatus })
    }
  }

  const deleteOrder = async (id) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = orders.value.findIndex(order => order.id === id)
      if (index !== -1) {
        orders.value.splice(index, 1)
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
    orders,
    loading,
    error,

    // Computed
    totalOrders,
    totalAmount,
    totalQuantity,
    ordersByStatus,
    ordersByPriority,
    pendingOrders,
    confirmedOrders,
    inProductionOrders,
    completedOrders,

    // Actions
    fetchOrders,
    getOrderById,
    getOrdersByBuyer,
    getOrdersByFactory,
    getOrdersByProduct,
    getOrdersByDateRange,
    searchOrders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updateCMTStatus,
    deleteOrder,
  }
}, {
  persist: {
    key: 'order-store',
    storage: localStorage,
    paths: ['orders'],
  },
})
