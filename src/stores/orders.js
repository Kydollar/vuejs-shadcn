import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import dataService from '@/data/dataService'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedOrder = ref(null)

  // Computed
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

  const pendingOrders = computed(() =>
    orders.value.filter(order => order.status === 'pending'),
  )

  const inProductionOrders = computed(() =>
    orders.value.filter(order => order.status === 'inProduction'),
  )

  const completedOrders = computed(() =>
    orders.value.filter(order => order.status === 'completed'),
  )

  const statistics = computed(() => ({
    total: orders.value.length,
    pending: pendingOrders.value.length,
    inProduction: inProductionOrders.value.length,
    completed: completedOrders.value.length,
    totalValue: orders.value.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    averageOrderValue: orders.value.length > 0
      ? (orders.value.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / orders.value.length).toFixed(2)
      : 0,
  }))

  const orderOptions = computed(() =>
    orders.value.map(order => ({
      value: order.id,
      label: `${order.orderNumber} - ${order.buyer}`,
    })),
  )

  const factoryOptions = computed(() => {
    const factories = dataService.getFactories()
    return factories
      .filter(factory => factory.status === 'active')
      .map(factory => ({
        value: factory.id,
        label: factory.factoryName,
        location: factory.location,
        capacity: factory.capacity,
      }))
  })

  const productOptions = computed(() => {
    const products = dataService.getProducts()
    return products
      .filter(product => product.status === 'active')
      .map(product => ({
        value: product.id,
        label: `${product.productCode} - ${product.productName}`,
        category: product.category,
        price: product.price,
      }))
  })

  // Helper function to transform order data with relations
  const transformOrderWithRelations = (order) => {
    const buyers = dataService.getBuyers()
    const products = dataService.getProducts()
    const factories = dataService.getFactories()

    // Get related buyer info
    const buyer = buyers.find(b => b.id === order.buyerId)

    // Get related factory info
    const factory = factories.find(f => f.id === order.factoryId)

    // Process items with product info
    const processedItems = order.items?.map((item) => {
      const product = products.find(p => p.id === item.productId)
      return {
        ...item,
        productCode: product?.productCode || 'N/A',
        productName: product?.productName || 'Unknown Product',
        category: product?.category || 'N/A',
      }
    }) || []

    // Get primary product for display
    const primaryProduct = processedItems[0]

    return {
      ...order,
      // Add buyer information
      buyer: buyer?.buyerName || 'Unknown Buyer',
      buyerContact: buyer?.contactPerson || '',
      buyerEmail: buyer?.email || '',

      // Add factory information
      factory: factory?.factoryName || 'Unknown Factory',
      factoryLocation: factory?.location || '',

      // Product information for display
      product: primaryProduct?.productName || 'N/A',
      productCode: primaryProduct?.productCode || 'N/A',
      style: primaryProduct?.productCode || order.style || 'N/A',
      category: primaryProduct?.category || 'N/A',

      // Calculate total quantity from items
      quantity: processedItems.reduce((sum, item) => sum + (item.quantity || 0), 0),

      // Process items with product details
      items: processedItems,

      // Additional computed fields
      itemCount: processedItems.length,
      averageUnitPrice: processedItems.length > 0
        ? (order.totalAmount / processedItems.reduce((sum, item) => sum + (item.quantity || 0), 0))
        : 0,
    }
  }

  // Actions
  const fetchOrders = async () => {
    loading.value = true
    error.value = null
    try {
      // Reduced loading delay to prevent blank screens on fast navigation
      await new Promise(resolve => setTimeout(resolve, 400))
      const rawOrders = dataService.getOrders()

      // Transform orders with relational data
      orders.value = rawOrders.map(order => transformOrderWithRelations(order))
    }
    catch (err) {
      error.value = 'Failed to fetch orders'
      console.error('Error fetching orders:', err)
    }
    finally {
      loading.value = false
    }
  }

  const fetchOrderById = async (id) => {
    loading.value = true
    error.value = null
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      const order = dataService.getById('orders', id)
      if (order) {
        selectedOrder.value = transformOrderWithRelations(order)
        return selectedOrder.value
      }
      else {
        throw new Error('Order not found')
      }
    }
    catch (err) {
      error.value = 'Failed to fetch order'
      console.error('Error fetching order:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const createOrder = async (orderData) => {
    loading.value = true
    error.value = null
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const newOrder = dataService.createOrder(orderData)
      const transformedOrder = transformOrderWithRelations(newOrder)
      orders.value.push(transformedOrder)
      return transformedOrder
    }
    catch (err) {
      error.value = 'Failed to create order'
      console.error('Error creating order:', err)
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const updatedOrder = dataService.updateOrder(id, orderData)
      if (updatedOrder) {
        const transformedOrder = transformOrderWithRelations(updatedOrder)
        const index = orders.value.findIndex(order => order.id === id)
        if (index !== -1) {
          orders.value[index] = transformedOrder
        }
        if (selectedOrder.value?.id === id) {
          selectedOrder.value = transformedOrder
        }
        return transformedOrder
      }
      else {
        throw new Error('Order not found')
      }
    }
    catch (err) {
      error.value = 'Failed to update order'
      console.error('Error updating order:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const deleteOrder = async (id) => {
    loading.value = true
    error.value = null
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const success = dataService.deleteOrder(id)
      if (success) {
        orders.value = orders.value.filter(order => order.id !== id)
        if (selectedOrder.value?.id === id) {
          selectedOrder.value = null
        }
      }
      else {
        throw new Error('Order not found')
      }
    }
    catch (err) {
      error.value = 'Failed to delete order'
      console.error('Error deleting order:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const uploadGraphic = async (id, file) => {
    loading.value = true
    error.value = null
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      // Simulate file upload - in real app this would upload to server
      const graphicUrl = `/uploads/graphics/ord-${id}-${file.name}`
      const updatedOrder = dataService.updateOrder(id, { graphic: graphicUrl })

      const index = orders.value.findIndex(order => order.id === id)
      if (index !== -1) {
        orders.value[index] = updatedOrder
      }
      return updatedOrder
    }
    catch (err) {
      error.value = 'Failed to upload graphic'
      console.error('Error uploading graphic:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const getOrderProgress = async (id) => {
    loading.value = true
    error.value = null
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300))
      const order = dataService.getOrder(id)
      // Simulate progress data
      const progressData = {
        orderId: id,
        currentStage: order?.status || 'pending',
        progress: order?.status === 'completed'
          ? 100
          : order?.status === 'shipped'
            ? 90
            : order?.status === 'qcCheck'
              ? 75
              : order?.status === 'in_production' ? 50 : 25,
        stages: [
          { name: 'Order Received', completed: true, date: order?.orderDate },
          { name: 'In Production', completed: order?.status !== 'pending', date: order?.status !== 'pending' ? '2024-02-15' : null },
          { name: 'Quality Check', completed: ['qcCheck', 'shipped', 'completed'].includes(order?.status), date: ['qcCheck', 'shipped', 'completed'].includes(order?.status) ? '2024-02-20' : null },
          { name: 'Shipped', completed: ['shipped', 'completed'].includes(order?.status), date: ['shipped', 'completed'].includes(order?.status) ? '2024-02-25' : null },
          { name: 'Delivered', completed: order?.status === 'completed', date: order?.status === 'completed' ? '2024-03-01' : null },
        ],
      }
      return progressData
    }
    catch (err) {
      error.value = 'Failed to fetch order progress'
      console.error('Error fetching order progress:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const getOrdersByBuyer = (buyerId) => {
    return orders.value.filter(order => order.buyerId === buyerId)
  }

  const getOrdersByStatus = (status) => {
    return orders.value.filter(order => order.status === status)
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
        notes: 'Rush order for spring collection',
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
        notes: 'Waiting for final design approval',
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
        notes: 'Custom embroidery required',
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
        notes: 'Completed ahead of schedule',
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
        notes: 'Premium quality requirements',
      },
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
    statistics,
    orderOptions,
    factoryOptions,
    productOptions,

    // Actions
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    uploadGraphic,
    getOrderProgress,
    getOrdersByBuyer,
    getOrdersByStatus,
    clearError,
    clearSelectedOrder,
    loadDummyData,
  }
})
