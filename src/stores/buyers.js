import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { buyersApi } from '@/services/api'

export const useBuyersStore = defineStore('buyers', () => {
  const buyers = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedBuyer = ref(null)

  // Computed
  const activeBuyers = computed(() => 
    buyers.value.filter(buyer => buyer.status === 'active')
  )

  const buyerOptions = computed(() =>
    activeBuyers.value.map(buyer => ({
      value: buyer.id,
      label: buyer.buyerName
    }))
  )

  // Actions
  const fetchBuyers = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const data = await buyersApi.getAll(params)
      buyers.value = data.data || data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch buyers'
      console.error('Error fetching buyers:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchBuyerById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const data = await buyersApi.getById(id)
      selectedBuyer.value = data.data || data
      return selectedBuyer.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch buyer'
      console.error('Error fetching buyer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createBuyer = async (buyerData) => {
    loading.value = true
    error.value = null
    try {
      const data = await buyersApi.create(buyerData)
      const newBuyer = data.data || data
      buyers.value.push(newBuyer)
      return newBuyer
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create buyer'
      console.error('Error creating buyer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBuyer = async (id, buyerData) => {
    loading.value = true
    error.value = null
    try {
      const data = await buyersApi.update(id, buyerData)
      const updatedBuyer = data.data || data
      const index = buyers.value.findIndex(buyer => buyer.id === id)
      if (index !== -1) {
        buyers.value[index] = updatedBuyer
      }
      if (selectedBuyer.value?.id === id) {
        selectedBuyer.value = updatedBuyer
      }
      return updatedBuyer
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update buyer'
      console.error('Error updating buyer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteBuyer = async (id) => {
    loading.value = true
    error.value = null
    try {
      await buyersApi.delete(id)
      buyers.value = buyers.value.filter(buyer => buyer.id !== id)
      if (selectedBuyer.value?.id === id) {
        selectedBuyer.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete buyer'
      console.error('Error deleting buyer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedBuyer = () => {
    selectedBuyer.value = null
  }

  // Load dummy data for development
  const loadDummyData = () => {
    buyers.value = [
      {
        id: 1,
        buyerName: 'Global Fashion Co.',
        contactPerson: 'John Smith',
        email: 'john.smith@globalfashion.com',
        phone: '+1-555-0123',
        address: '123 Fashion Ave, New York, NY 10001',
        country: 'United States',
        status: 'active',
        createdAt: '2024-01-15T08:00:00Z'
      },
      {
        id: 2,
        buyerName: 'European Brands Ltd.',
        contactPerson: 'Maria Garcia',
        email: 'maria.garcia@europeanbrands.eu',
        phone: '+34-91-123-4567',
        address: 'Calle Mayor 45, Madrid, Spain',
        country: 'Spain',
        status: 'active',
        createdAt: '2024-01-20T10:30:00Z'
      },
      {
        id: 3,
        buyerName: 'Asian Style House',
        contactPerson: 'Tanaka Hiroshi',
        email: 'tanaka@asianstyle.jp',
        phone: '+81-3-1234-5678',
        address: '1-2-3 Shibuya, Tokyo, Japan',
        country: 'Japan',
        status: 'active',
        createdAt: '2024-02-01T14:15:00Z'
      },
      {
        id: 4,
        buyerName: 'Premium Wear Inc.',
        contactPerson: 'Sarah Johnson',
        email: 'sarah.j@premiumwear.com',
        phone: '+1-555-0456',
        address: '456 Premium St, Los Angeles, CA 90210',
        country: 'United States',
        status: 'inactive',
        createdAt: '2024-01-10T09:45:00Z'
      }
    ]
  }

  return {
    // State
    buyers,
    loading,
    error,
    selectedBuyer,
    
    // Computed
    activeBuyers,
    buyerOptions,
    
    // Actions
    fetchBuyers,
    fetchBuyerById,
    createBuyer,
    updateBuyer,
    deleteBuyer,
    clearError,
    clearSelectedBuyer,
    loadDummyData
  }
})
