import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import dataService from '@/data/example/dataService'

export const useFactoriesStore = defineStore('factories', () => {
  const factories = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedFactory = ref(null)

  // Computed
  const activeFactories = computed(() =>
    factories.value.filter(factory => factory.status === 'active'),
  )

  const factoryOptions = computed(() =>
    activeFactories.value.map(factory => ({
      value: factory.id,
      label: factory.factoryName,
    })),
  )

  const factoryCapacityUtilization = computed(() => {
    const total = factories.value.reduce((sum, factory) => sum + factory.capacity, 0)
    const utilized = factories.value.reduce(
      (sum, factory) => sum + (factory.totalProduction || 0),
      0,
    )
    return total > 0 ? Math.round((utilized / total) * 100) : 0
  })

  const uniqueLocations = computed(() =>
    [...new Set(factories.value.map(factory => factory.location))].sort(),
  )

  const statistics = computed(() => ({
    total: factories.value.length,
    active: activeFactories.value.length,
    totalCapacity: factories.value.reduce((sum, f) => sum + f.capacity, 0),
    totalProduction: factories.value.reduce((sum, f) => sum + (f.totalProduction || 0), 0),
    averageRating:
      factories.value.length > 0
        ? (
            factories.value.reduce((sum, f) => sum + (f.rating || 0), 0) / factories.value.length
          ).toFixed(1)
        : 0,
    averageOnTime:
      factories.value.length > 0
        ? (
            factories.value.reduce((sum, f) => sum + (f.onTimeDelivery || 0), 0)
            / factories.value.length
          ).toFixed(1)
        : 0,
  }))

  // Actions
  const fetchFactories = async (_params = {}) => {
    loading.value = true
    error.value = null
    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 400))
      factories.value = dataService.getFactories()
    }
    catch (err) {
      error.value = 'Failed to fetch factories'
      console.error('Error fetching factories:', err)
    }
    finally {
      loading.value = false
    }
  }

  const fetchFactoryById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const factory = dataService.getById('factories', id)
      if (factory) {
        selectedFactory.value = factory
        return factory
      }
      else {
        throw new Error('Factory not found')
      }
    }
    catch (err) {
      error.value = 'Failed to fetch factory'
      console.error('Error fetching factory:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const createFactory = async (factoryData) => {
    loading.value = true
    error.value = null
    try {
      const newFactory = dataService.createFactory(factoryData)
      factories.value.push(newFactory)
      return newFactory
    }
    catch (err) {
      error.value = 'Failed to create factory'
      console.error('Error creating factory:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const updateFactory = async (id, factoryData) => {
    loading.value = true
    error.value = null
    try {
      const updatedFactory = dataService.updateFactory(id, factoryData)
      if (updatedFactory) {
        const index = factories.value.findIndex(factory => factory.id === id)
        if (index !== -1) {
          factories.value[index] = updatedFactory
        }
        if (selectedFactory.value?.id === id) {
          selectedFactory.value = updatedFactory
        }
        return updatedFactory
      }
      else {
        throw new Error('Factory not found')
      }
    }
    catch (err) {
      error.value = 'Failed to update factory'
      console.error('Error updating factory:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const deleteFactory = async (id) => {
    loading.value = true
    error.value = null
    try {
      const success = dataService.deleteFactory(id)
      if (success) {
        factories.value = factories.value.filter(factory => factory.id !== id)
        if (selectedFactory.value?.id === id) {
          selectedFactory.value = null
        }
      }
      else {
        throw new Error('Factory not found')
      }
    }
    catch (err) {
      error.value = 'Failed to delete factory'
      console.error('Error deleting factory:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedFactory = () => {
    selectedFactory.value = null
  }

  // // Load dummy data for development
  // const loadDummyData = async () => {
  //   // Prevent duplicate loading dan race condition
  //   if (loading.value || factories.value.length > 0) {
  //     return
  //   }
  //   await fetchFactories()
  // }

  const refreshData = () => {
    fetchFactories()
  }

  return {
    // State
    factories,
    loading,
    error,
    selectedFactory,

    // Computed
    activeFactories,
    factoryOptions,
    factoryCapacityUtilization,
    uniqueLocations,
    statistics,

    // Actions
    fetchFactories,
    fetchFactoryById,
    createFactory,
    updateFactory,
    deleteFactory,
    clearError,
    clearSelectedFactory,
    // loadDummyData,
    refreshData,
  }
})
