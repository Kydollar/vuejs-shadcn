import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ordersApi } from '@/services/api'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedOrder = ref(null)

  // Computed
  const ordersByStatus = computed(() => {
    const grouped = {}
    orders.value.forEach(order => {
      if (!grouped[order.status]) {
        grouped[order.status] = []
      }
      grouped[order.status].push(order)
    })
    return grouped
  })

  const pendingOrders = computed(() => 
    orders.value.filter(order => order.status === 'pending')
  )

  const inProductionOrders = computed(() => 
    orders.value.filter(order => order.status === 'inProduction')
  )

  const completedOrders = computed(() => 
    orders.value.filter(order => order.status === 'completed')
  )

  const orderOptions = computed(() =>
    orders.value.map(order => ({
      value: order.id,
      label: `${order.orderNumber} - ${order.buyer}`
    }))
  )

  // Actions
  const fetchOrders = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const data = await ordersApi.getAll(params)
      orders.value = data.data || data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch orders'
      console.error('Error fetching orders:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchOrderById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const data = await ordersApi.getById(id)
      selectedOrder.value = data.data || data
      return selectedOrder.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch order'
      console.error('Error fetching order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createOrder = async (orderData) => {
    loading.value = true
    error.value = null
    try {
      const data = await ordersApi.create(orderData)
      const newOrder = data.data || data
      orders.value.push(newOrder)
      return newOrder
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create order'
      console.error('Error creating order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateOrder = async (id, orderData) => {
    loading.value = true
    error.value = null
    try {
      const data = await ordersApi.update(id, orderData)
      const updatedOrder = data.data || data
      const index = orders.value.findIndex(order => order.id === id)
      if (index !== -1) {
        orders.value[index] = updatedOrder
      }
      if (selectedOrder.value?.id === id) {
        selectedOrder.value = updatedOrder
      }
      return updatedOrder
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update order'
      console.error('Error updating order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteOrder = async (id) => {
    loading.value = true
    error.value = null
    try {
      await ordersApi.delete(id)
      orders.value = orders.value.filter(order => order.id !== id)
      if (selectedOrder.value?.id === id) {
        selectedOrder.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete order'
      console.error('Error deleting order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const uploadGraphic = async (id, file) => {
    loading.value = true
    error.value = null
    try {
      const data = await ordersApi.uploadGraphic(id, file)
      const updatedOrder = data.data || data
      const index = orders.value.findIndex(order => order.id === id)
      if (index !== -1) {
        orders.value[index] = { ...orders.value[index], graphic: updatedOrder.graphic }
      }
      return updatedOrder
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to upload graphic'
      console.error('Error uploading graphic:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getOrderProgress = async (id) => {
    loading.value = true
    error.value = null
    try {
      const data = await ordersApi.getProgress(id)
      return data.data || data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch order progress'
      console.error('Error fetching order progress:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedOrder = () => {
    selectedOrder.value = null
  }

  // Load dummy data for development
  const loadDummyData = () => {
    orders.value = [
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        buyer: 'Global Fashion Co.',
        buyerId: 1,
        product: 'Cotton T-Shirt',
        productId: 1,
        quantity: 5000,
        style: 'Basic Crew Neck',
        deliveryDate: '2024-03-15',
        orderDate: '2024-02-01',
        status: 'inProduction',
        graphic: '/uploads/graphics/ord-001-graphic.png',
        notes: 'Rush order for spring collection'
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002',
        buyer: 'European Brands Ltd.',
        buyerId: 2,
        product: 'Polo Shirt',
        productId: 2,
        quantity: 3000,
        style: 'Classic Polo',
        deliveryDate: '2024-03-30',
        orderDate: '2024-02-05',
        status: 'pending',
        graphic: null,
        notes: 'Waiting for final design approval'
      },
      {
        id: 3,
        orderNumber: 'ORD-2024-003',
        buyer: 'Asian Style House',
        buyerId: 3,
        product: 'Hoodie',
        productId: 3,
        quantity: 2000,
        style: 'Pullover Hoodie',
        deliveryDate: '2024-04-10',
        orderDate: '2024-02-10',
        status: 'qcCheck',
        graphic: '/uploads/graphics/ord-003-graphic.png',
        notes: 'Custom embroidery required'
      },
      {
        id: 4,
        orderNumber: 'ORD-2024-004',
        buyer: 'Global Fashion Co.',
        buyerId: 1,
        product: 'Tank Top',
        productId: 4,
        quantity: 4000,
        style: 'Athletic Tank',
        deliveryDate: '2024-02-28',
        orderDate: '2024-01-15',
        status: 'completed',
        graphic: '/uploads/graphics/ord-004-graphic.png',
        notes: 'Completed ahead of schedule'
      },
      {
        id: 5,
        orderNumber: 'ORD-2024-005',
        buyer: 'Premium Wear Inc.',
        buyerId: 4,
        product: 'Dress Shirt',
        productId: 5,
        quantity: 1500,
        style: 'Formal Long Sleeve',
        deliveryDate: '2024-04-20',
        orderDate: '2024-02-15',
        status: 'shipped',
        graphic: '/uploads/graphics/ord-005-graphic.png',
        notes: 'Premium quality requirements'
      }
    ]
  }

  return {
    // State
    orders,
    loading,
    error,
    selectedOrder,
    
    // Computed
    ordersByStatus,
    pendingOrders,
    inProductionOrders,
    completedOrders,
    orderOptions,
    
    // Actions
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    uploadGraphic,
    getOrderProgress,
    clearError,
    clearSelectedOrder,
    loadDummyData
  }
})
