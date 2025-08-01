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
    const utilized = factories.value.reduce((sum, factory) => sum + (factory.totalProduction || 0), 0)
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
    averageRating: factories.value.length > 0
      ? (factories.value.reduce((sum, f) => sum + (f.rating || 0), 0) / factories.value.length).toFixed(1)
      : 0,
    averageOnTime: factories.value.length > 0
      ? (factories.value.reduce((sum, f) => sum + (f.onTimeDelivery || 0), 0) / factories.value.length).toFixed(1)
      : 0,
  }))

  // Actions
  const fetchFactories = async (_params = {}) => {
    loading.value = true
    error.value = null
    try {
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
      const data = await factoriesApi.getById(id)
      selectedFactory.value = data.data || data
      return selectedFactory.value
    }
    catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch factory'
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
      const data = await factoriesApi.create(factoryData)
      const newFactory = data.data || data
      factories.value.push(newFactory)
      return newFactory
    }
    catch (err) {
      error.value = err.response?.data?.message || 'Failed to create factory'
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
      const data = await factoriesApi.update(id, factoryData)
      const updatedFactory = data.data || data
      const index = factories.value.findIndex(factory => factory.id === id)
      if (index !== -1) {
        factories.value[index] = updatedFactory
      }
      if (selectedFactory.value?.id === id) {
        selectedFactory.value = updatedFactory
      }
      return updatedFactory
    }
    catch (err) {
      error.value = err.response?.data?.message || 'Failed to update factory'
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
      await factoriesApi.delete(id)
      factories.value = factories.value.filter(factory => factory.id !== id)
      if (selectedFactory.value?.id === id) {
        selectedFactory.value = null
      }
    }
    catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete factory'
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

  // Load dummy data for development
  function loadDummyData() {
    factories.value = [
      {
        id: 1,
        factoryName: 'Main Production Facility',
        factoryCode: 'FAC-001',
        location: 'Bandung, Indonesia',
        address: 'Jl. Industri No. 123, Bandung 40111',
        managerName: 'Ahmad Wijaya',
        managerPhone: '+62-22-1234-5678',
        email: 'ahmad.wijaya@factory.com',
        capacity: 10000,
        currentLoad: 7500,
        specialization: 'Garment Manufacturing',
        certifications: ['ISO 9001', 'WRAP', 'OEKO-TEX'],
        status: 'active',
        establishedDate: '2018-03-15',
        createdAt: '2024-01-15T08:00:00Z',
      },
      {
        id: 2,
        factoryName: 'Textile Processing Center',
        factoryCode: 'FAC-002',
        location: 'Surabaya, Indonesia',
        address: 'Jl. Raya Industri No. 456, Surabaya 60174',
        managerName: 'Sari Indrawati',
        managerPhone: '+62-31-9876-5432',
        email: 'sari.indra@textilepcenter.com',
        capacity: 8000,
        currentLoad: 5600,
        specialization: 'Fabric Dyeing & Finishing',
        certifications: ['ISO 14001', 'GOTS', 'Cradle to Cradle'],
        status: 'active',
        establishedDate: '2020-07-22',
        createdAt: '2024-01-20T10:30:00Z',
      },
      {
        id: 3,
        factoryName: 'Quality Apparel Works',
        factoryCode: 'FAC-003',
        location: 'Jakarta, Indonesia',
        address: 'Kawasan Industri Pulogadung, Jakarta 13930',
        managerName: 'Budi Santoso',
        managerPhone: '+62-21-4567-8901',
        email: 'budi.santoso@qualityapparel.com',
        capacity: 12000,
        currentLoad: 9000,
        specialization: 'Premium Garment Assembly',
        certifications: ['ISO 9001', 'SA8000', 'BSCI'],
        status: 'active',
        establishedDate: '2015-11-08',
        createdAt: '2024-02-01T14:15:00Z',
      },
      {
        id: 4,
        factoryName: 'Sustainable Fashion Hub',
        factoryCode: 'FAC-004',
        location: 'Yogyakarta, Indonesia',
        address: 'Jl. Solo-Yogya Km 12, Yogyakarta 55584',
        managerName: 'Dewi Lestari',
        managerPhone: '+62-274-555-1234',
        email: 'dewi.lestari@sustainablehub.com',
        capacity: 6000,
        currentLoad: 3000,
        specialization: 'Eco-Friendly Production',
        certifications: ['GOTS', 'Fair Trade', 'B Corp'],
        status: 'maintenance',
        establishedDate: '2022-01-10',
        createdAt: '2024-01-10T09:45:00Z',
      },
    ]
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

    // Actions
    fetchFactories,
    fetchFactoryById,
    createFactory,
    updateFactory,
    deleteFactory,
    clearError,
    clearSelectedFactory,
    loadDummyData,
  }
})
