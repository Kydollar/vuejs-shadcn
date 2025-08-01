import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useBuyerStore = defineStore('buyer', () => {
  const buyers = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Dummy data
  const dummyBuyers = [
    {
      id: 1,
      name: 'Macy\'s Inc.',
      code: 'MCY',
      email: 'orders@macys.com',
      phone: '+1-555-0123',
      address: '151 W 34th St, New York, NY 10001',
      country: 'United States',
      contact_person: 'John Smith',
      status: 'active',
      created_at: '2024-01-15',
      total_orders: 45,
      total_amount: 2500000,
    },
    {
      id: 2,
      name: 'Walmart Inc.',
      code: 'WMT',
      email: 'procurement@walmart.com',
      phone: '+1-555-0124',
      address: '702 SW 8th St, Bentonville, AR 72716',
      country: 'United States',
      contact_person: 'Sarah Johnson',
      status: 'active',
      created_at: '2024-01-20',
      total_orders: 32,
      total_amount: 1800000,
    },
    {
      id: 3,
      name: 'Target Corporation',
      code: 'TGT',
      email: 'sourcing@target.com',
      phone: '+1-555-0125',
      address: '1000 Nicollet Mall, Minneapolis, MN 55403',
      country: 'United States',
      contact_person: 'Mike Davis',
      status: 'active',
      created_at: '2024-02-01',
      total_orders: 28,
      total_amount: 1200000,
    },
    {
      id: 4,
      name: 'H&M Group',
      code: 'HM',
      email: 'orders@hm.com',
      phone: '+46-8-796-5500',
      address: 'Arlanda 230 60, Sweden',
      country: 'Sweden',
      contact_person: 'Anna Andersson',
      status: 'active',
      created_at: '2024-02-10',
      total_orders: 52,
      total_amount: 3200000,
    },
    {
      id: 5,
      name: 'Uniqlo Co., Ltd.',
      code: 'UNQ',
      email: 'purchasing@uniqlo.com',
      phone: '+81-3-6215-8800',
      address: '717-1 Sayama, Yamaguchi 754-0894, Japan',
      country: 'Japan',
      contact_person: 'Takeshi Yamamoto',
      status: 'active',
      created_at: '2024-02-15',
      total_orders: 38,
      total_amount: 2100000,
    },
  ]

  // Computed
  const activeBuyers = computed(() => buyers.value.filter(b => b.status === 'active'))
  const totalBuyers = computed(() => buyers.value.length)
  const totalRevenue = computed(() => buyers.value.reduce((sum, buyer) => sum + (buyer.total_amount || 0), 0))

  // Actions
  const fetchBuyers = async () => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      buyers.value = dummyBuyers
    }
    catch (err) {
      error.value = err.message
    }
    finally {
      loading.value = false
    }
  }

  const getBuyerById = (id) => {
    return buyers.value.find(buyer => buyer.id === id)
  }

  const createBuyer = async (buyerData) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const newBuyer = {
        id: Date.now(),
        ...buyerData,
        created_at: new Date().toISOString().split('T')[0],
        total_orders: 0,
        total_amount: 0,
        status: 'active',
      }
      buyers.value.push(newBuyer)
      return newBuyer
    }
    catch (err) {
      error.value = err.message
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = buyers.value.findIndex(buyer => buyer.id === id)
      if (index !== -1) {
        buyers.value[index] = { ...buyers.value[index], ...buyerData }
        return buyers.value[index]
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

  const deleteBuyer = async (id) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = buyers.value.findIndex(buyer => buyer.id === id)
      if (index !== -1) {
        buyers.value.splice(index, 1)
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
    buyers,
    loading,
    error,

    // Computed
    activeBuyers,
    totalBuyers,
    totalRevenue,

    // Actions
    fetchBuyers,
    getBuyerById,
    createBuyer,
    updateBuyer,
    deleteBuyer,
  }
}, {
  persist: {
    key: 'buyer-store',
    storage: localStorage,
    paths: ['buyers'],
  },
})
