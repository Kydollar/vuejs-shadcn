import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import dataService from '@/data/dataService'

export const useBuyersStore = defineStore('buyers', () => {
  const buyers = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedBuyer = ref(null)

  // Computed
  const activeBuyers = computed(() =>
    buyers.value.filter(buyer => buyer.status === 'active'),
  )

  const inactiveBuyers = computed(() =>
    buyers.value.filter(buyer => buyer.status === 'inactive'),
  )

  const buyerOptions = computed(() =>
    activeBuyers.value.map(buyer => ({
      value: buyer.id,
      label: buyer.buyerName,
    })),
  )

  const uniqueCountries = computed(() =>
    [...new Set(buyers.value.map(buyer => buyer.country))].sort(),
  )

  const statistics = computed(() => ({
    total: buyers.value.length,
    active: activeBuyers.value.length,
    inactive: inactiveBuyers.value.length,
    countries: uniqueCountries.value.length,
    totalValue: buyers.value.reduce((sum, b) => sum + (b.totalValue || 0), 0),
    totalOrders: buyers.value.reduce((sum, b) => sum + (b.totalOrders || 0), 0),
  }))

  // Actions
  const fetchBuyers = async (_params = {}) => {
    loading.value = true
    error.value = null
    try {
      // Reduced loading delay to prevent blank screens on fast navigation
      await new Promise(resolve => setTimeout(resolve, 400))
      buyers.value = dataService.getBuyers()
    }
    catch (err) {
      error.value = 'Failed to fetch buyers'
      console.error('Error fetching buyers:', err)
    }
    finally {
      loading.value = false
    }
  }

  const fetchBuyerById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const buyer = dataService.getById('buyers', id)
      if (buyer) {
        selectedBuyer.value = buyer
        return buyer
      }
      else {
        throw new Error('Buyer not found')
      }
    }
    catch (err) {
      error.value = 'Failed to fetch buyer'
      console.error('Error fetching buyer:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const createBuyer = async (buyerData) => {
    loading.value = true
    error.value = null
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const newBuyer = dataService.createBuyer(buyerData)
      // Immediately update the reactive array
      buyers.value.push(newBuyer)
      return newBuyer
    }
    catch (err) {
      error.value = 'Failed to create buyer'
      console.error('Error creating buyer:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const updateBuyer = async (id, buyerData) => {
    loading.value = true
    error.value = null
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const updatedBuyer = dataService.updateBuyer(id, buyerData)
      if (updatedBuyer) {
        const index = buyers.value.findIndex(buyer => buyer.id === id)
        if (index !== -1) {
          // Update the reactive array immediately
          buyers.value[index] = updatedBuyer
        }
        if (selectedBuyer.value?.id === id) {
          selectedBuyer.value = updatedBuyer
        }
        return updatedBuyer
      }
      else {
        throw new Error('Buyer not found')
      }
    }
    catch (err) {
      error.value = 'Failed to update buyer'
      console.error('Error updating buyer:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const deleteBuyer = async (id) => {
    loading.value = true
    error.value = null
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const success = dataService.deleteBuyer(id)
      if (success) {
        // Immediately update the reactive array
        buyers.value = buyers.value.filter(buyer => buyer.id !== id)
        if (selectedBuyer.value?.id === id) {
          selectedBuyer.value = null
        }
      }
      else {
        throw new Error('Buyer not found')
      }
    }
    catch (err) {
      error.value = 'Failed to delete buyer'
      console.error('Error deleting buyer:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const searchBuyers = (query) => {
    return dataService.searchBuyers(query)
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedBuyer = () => {
    selectedBuyer.value = null
  }

  // // Load dummy data for development
  // const loadDummyData = async () => {
  //   // Prevent duplicate loading dan race condition
  //   if (loading.value || buyers.value.length > 0) {
  //     return
  //   }
  //   await fetchBuyers()
  // }

  // Refresh data
  const refreshData = () => {
    fetchBuyers()
  }

  return {
    // State
    buyers,
    loading,
    error,
    selectedBuyer,

    // Computed
    activeBuyers,
    inactiveBuyers,
    buyerOptions,
    uniqueCountries,
    statistics,

    // Actions
    fetchBuyers,
    fetchBuyerById,
    createBuyer,
    updateBuyer,
    deleteBuyer,
    searchBuyers,
    clearError,
    clearSelectedBuyer,
    // loadDummyData,
    refreshData,
  }
})
