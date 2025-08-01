import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useFactoryStore = defineStore('factory', () => {
  const factories = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Dummy data
  const dummyFactories = [
    {
      id: 1,
      name: 'PT Sritex Indonesia',
      code: 'STX',
      buyer_id: 1,
      email: 'production@sritex.com',
      phone: '+62-271-714-488',
      address: 'Jl. Raya Solo-Sragen Km 15, Sukoharjo, Central Java',
      country: 'Indonesia',
      manager: 'Budi Santoso',
      capacity_per_month: 50000,
      status: 'active',
      created_at: '2024-01-10',
      specialization: ['T-Shirt', 'Polo Shirt', 'Hoodie'],
      total_orders: 25,
      efficiency_rating: 4.8,
    },
    {
      id: 2,
      name: 'PT Pan Brothers Indonesia',
      code: 'PAN',
      buyer_id: 2,
      email: 'orders@panbrothers.com',
      phone: '+62-21-899-0900',
      address: 'Jl. Raya Tangerang-Merak Km 16, Tangerang, Banten',
      country: 'Indonesia',
      manager: 'Sari Wijaya',
      capacity_per_month: 75000,
      status: 'active',
      created_at: '2024-01-15',
      specialization: ['Jeans', 'Casual Wear', 'Work Wear'],
      total_orders: 32,
      efficiency_rating: 4.6,
    },
    {
      id: 3,
      name: 'CV Garment Sejahtera',
      code: 'GSJ',
      buyer_id: 3,
      email: 'production@garmentsejahtera.com',
      phone: '+62-22-876-5432',
      address: 'Jl. Industri Raya No. 25, Bandung, West Java',
      country: 'Indonesia',
      manager: 'Ahmad Rahman',
      capacity_per_month: 30000,
      status: 'active',
      created_at: '2024-02-01',
      specialization: ['Dress', 'Blouse', 'Formal Wear'],
      total_orders: 18,
      efficiency_rating: 4.5,
    },
    {
      id: 4,
      name: 'PT Textile Prima',
      code: 'TPR',
      buyer_id: 4,
      email: 'contact@textilepima.co.id',
      phone: '+62-31-789-2345',
      address: 'Kawasan Industri PIER, Surabaya, East Java',
      country: 'Indonesia',
      manager: 'Lina Kusuma',
      capacity_per_month: 60000,
      status: 'active',
      created_at: '2024-02-10',
      specialization: ['Sports Wear', 'Active Wear', 'Casual T-Shirt'],
      total_orders: 40,
      efficiency_rating: 4.7,
    },
    {
      id: 5,
      name: 'PT Fashion Master',
      code: 'FMS',
      buyer_id: 5,
      email: 'production@fashionmaster.id',
      phone: '+62-274-567-890',
      address: 'Jl. Wates Km 7, Yogyakarta',
      country: 'Indonesia',
      manager: 'Dewi Sartika',
      capacity_per_month: 40000,
      status: 'active',
      created_at: '2024-02-15',
      specialization: ['Formal Shirt', 'Business Wear', 'Uniform'],
      total_orders: 22,
      efficiency_rating: 4.4,
    },
  ]

  // Computed
  const activeFactories = computed(() => factories.value.filter(f => f.status === 'active'))
  const totalFactories = computed(() => factories.value.length)
  const totalCapacity = computed(() => factories.value.reduce((sum, factory) => sum + (factory.capacity_per_month || 0), 0))
  const averageEfficiency = computed(() => {
    if (factories.value.length === 0)
      return 0
    return factories.value.reduce((sum, factory) => sum + (factory.efficiency_rating || 0), 0) / factories.value.length
  })

  // Actions
  const fetchFactories = async () => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      factories.value = dummyFactories
    }
    catch (err) {
      error.value = err.message
    }
    finally {
      loading.value = false
    }
  }

  const getFactoryById = (id) => {
    return factories.value.find(factory => factory.id === id)
  }

  const getFactoriesByBuyer = (buyerId) => {
    return factories.value.filter(factory => factory.buyer_id === buyerId)
  }

  const createFactory = async (factoryData) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const newFactory = {
        id: Date.now(),
        ...factoryData,
        created_at: new Date().toISOString().split('T')[0],
        total_orders: 0,
        efficiency_rating: 0,
        status: 'active',
      }
      factories.value.push(newFactory)
      return newFactory
    }
    catch (err) {
      error.value = err.message
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = factories.value.findIndex(factory => factory.id === id)
      if (index !== -1) {
        factories.value[index] = { ...factories.value[index], ...factoryData }
        return factories.value[index]
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

  const deleteFactory = async (id) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = factories.value.findIndex(factory => factory.id === id)
      if (index !== -1) {
        factories.value.splice(index, 1)
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
    factories,
    loading,
    error,

    // Computed
    activeFactories,
    totalFactories,
    totalCapacity,
    averageEfficiency,

    // Actions
    fetchFactories,
    getFactoryById,
    getFactoriesByBuyer,
    createFactory,
    updateFactory,
    deleteFactory,
  }
}, {
  persist: {
    key: 'factory-store',
    storage: localStorage,
    paths: ['factories'],
  },
})
