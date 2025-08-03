import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import dataService from '@/data/example/dataService'

export const useOrderRecapStore = defineStore('orderRecap', () => {
  const orderRecaps = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedOrderRecap = ref(null)

  // Computed
  const orderRecapsByBuyer = computed(() => {
    const grouped = {}
    orderRecaps.value.forEach((recap) => {
      if (!grouped[recap.buyer]) {
        grouped[recap.buyer] = []
      }
      grouped[recap.buyer].push(recap)
    })
    return grouped
  })

  const orderRecapsByFactory = computed(() => {
    const grouped = {}
    orderRecaps.value.forEach((recap) => {
      if (!grouped[recap.factory]) {
        grouped[recap.factory] = []
      }
      grouped[recap.factory].push(recap)
    })
    return grouped
  })

  const statistics = computed(() => ({
    totalOrders: orderRecaps.value.length,
    totalQuantity: orderRecaps.value.reduce((sum, r) => sum + (r.orderQuantity || 0), 0),
    totalAmount: orderRecaps.value.reduce((sum, r) => sum + (r.amount || 0), 0),
    averagePrice:
      orderRecaps.value.length > 0
        ? (
            orderRecaps.value.reduce((sum, r) => sum + (r.price || 0), 0) / orderRecaps.value.length
          ).toFixed(3)
        : 0,
    buyers: [...new Set(orderRecaps.value.map(r => r.buyer))].length,
    factories: [...new Set(orderRecaps.value.map(r => r.factory))].length,
  }))

  const pendingQCOrders = computed(() =>
    orderRecaps.value.filter(recap => !recap.firstQC || recap.firstQC === ''),
  )

  const completedQCOrders = computed(() =>
    orderRecaps.value.filter(recap => recap.firstQC && recap.firstQC !== ''),
  )

  // Actions
  const fetchOrderRecaps = async () => {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      orderRecaps.value = dataService.getOrderRecap()
    }
    catch (err) {
      error.value = 'Failed to fetch order recaps'
      console.error('Error fetching order recaps:', err)
    }
    finally {
      loading.value = false
    }
  }

  const fetchOrderRecapById = async (id) => {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      selectedOrderRecap.value = dataService.getById('orderRecap', id)
      return selectedOrderRecap.value
    }
    catch (err) {
      error.value = 'Failed to fetch order recap'
      console.error('Error fetching order recap:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const createOrderRecap = async (recapData) => {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      const newRecap = dataService.createOrderRecap(recapData)
      orderRecaps.value.push(newRecap)
      return newRecap
    }
    catch (err) {
      error.value = 'Failed to create order recap'
      console.error('Error creating order recap:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const updateOrderRecap = async (id, recapData) => {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      const updatedRecap = dataService.updateOrderRecap(id, recapData)
      if (updatedRecap) {
        const index = orderRecaps.value.findIndex(recap => recap.id === id)
        if (index !== -1) {
          orderRecaps.value[index] = updatedRecap
        }
        return updatedRecap
      }
      else {
        throw new Error('Order recap not found')
      }
    }
    catch (err) {
      error.value = 'Failed to update order recap'
      console.error('Error updating order recap:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const deleteOrderRecap = async (id) => {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const success = dataService.deleteOrderRecap(id)
      if (success) {
        orderRecaps.value = orderRecaps.value.filter(recap => recap.id !== id)
        return true
      }
      else {
        throw new Error('Failed to delete order recap')
      }
    }
    catch (err) {
      error.value = 'Failed to delete order recap'
      console.error('Error deleting order recap:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const getOrderRecapsByBuyer = (buyer) => {
    return orderRecaps.value.filter(recap => recap.buyer === buyer)
  }

  const getOrderRecapsByFactory = (factory) => {
    return orderRecaps.value.filter(recap => recap.factory === factory)
  }

  const updateQCStatus = async (id, qcData) => {
    return await updateOrderRecap(id, qcData)
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedOrderRecap = () => {
    selectedOrderRecap.value = null
  }

  return {
    // State
    orderRecaps,
    loading,
    error,
    selectedOrderRecap,

    // Computed
    orderRecapsByBuyer,
    orderRecapsByFactory,
    statistics,
    pendingQCOrders,
    completedQCOrders,

    // Actions
    fetchOrderRecaps,
    fetchOrderRecapById,
    createOrderRecap,
    updateOrderRecap,
    deleteOrderRecap,
    getOrderRecapsByBuyer,
    getOrderRecapsByFactory,
    updateQCStatus,
    clearError,
    clearSelectedOrderRecap,
  }
})
