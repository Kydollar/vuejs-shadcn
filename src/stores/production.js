import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { productionApi } from '@/services/erp-api'

export const useProductionStore = defineStore('production', () => {
  const productionEntries = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedEntry = ref(null)
  const hourlyData = ref([])
  const efficiencyReport = ref(null)

  // Computed
  const entriesByLine = computed(() => {
    const grouped = {}
    productionEntries.value.forEach(entry => {
      if (!grouped[entry.line]) {
        grouped[entry.line] = []
      }
      grouped[entry.line].push(entry)
    })
    return grouped
  })

  const todayEntries = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return productionEntries.value.filter(entry => 
      entry.date === today
    )
  })

  const totalProducedToday = computed(() => {
    return todayEntries.value.reduce((total, entry) => 
      total + (entry.actualProduction || 0), 0
    )
  })

  const averageEfficiency = computed(() => {
    const entries = todayEntries.value.filter(entry => entry.efficiency)
    if (entries.length === 0) return 0
    const totalEfficiency = entries.reduce((sum, entry) => sum + entry.efficiency, 0)
    return Math.round(totalEfficiency / entries.length)
  })

  // Actions
  const fetchProductionEntries = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const data = await productionApi.getAll(params)
      productionEntries.value = data.data || data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch production entries'
      console.error('Error fetching production entries:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchEntryById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const data = await productionApi.getById(id)
      selectedEntry.value = data.data || data
      return selectedEntry.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch production entry'
      console.error('Error fetching production entry:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createEntry = async (entryData) => {
    loading.value = true
    error.value = null
    try {
      const data = await productionApi.create(entryData)
      const newEntry = data.data || data
      productionEntries.value.push(newEntry)
      return newEntry
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create production entry'
      console.error('Error creating production entry:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEntry = async (id, entryData) => {
    loading.value = true
    error.value = null
    try {
      const data = await productionApi.update(id, entryData)
      const updatedEntry = data.data || data
      const index = productionEntries.value.findIndex(entry => entry.id === id)
      if (index !== -1) {
        productionEntries.value[index] = updatedEntry
      }
      if (selectedEntry.value?.id === id) {
        selectedEntry.value = updatedEntry
      }
      return updatedEntry
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update production entry'
      console.error('Error updating production entry:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEntry = async (id) => {
    loading.value = true
    error.value = null
    try {
      await productionApi.delete(id)
      productionEntries.value = productionEntries.value.filter(entry => entry.id !== id)
      if (selectedEntry.value?.id === id) {
        selectedEntry.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete production entry'
      console.error('Error deleting production entry:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchHourlyData = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const data = await productionApi.getHourlyData(params)
      hourlyData.value = data.data || data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch hourly data'
      console.error('Error fetching hourly data:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchEfficiencyReport = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const data = await productionApi.getEfficiencyReport(params)
      efficiencyReport.value = data.data || data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch efficiency report'
      console.error('Error fetching efficiency report:', err)
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedEntry = () => {
    selectedEntry.value = null
  }

  // Load dummy data for development
  const loadDummyData = () => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    productionEntries.value = [
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        line: 'Line A',
        shift: 'morning',
        operator: 'Ahmad Faisal',
        date: today,
        hour: 8,
        targetPerHour: 50,
        actualProduction: 48,
        rejected: 2,
        rework: 1,
        efficiency: 94,
        remarks: 'Good performance'
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-001',
        line: 'Line A',
        shift: 'morning',
        operator: 'Ahmad Faisal',
        date: today,
        hour: 9,
        targetPerHour: 50,
        actualProduction: 52,
        rejected: 1,
        rework: 0,
        efficiency: 102,
        remarks: 'Exceeded target'
      },
      {
        id: 3,
        orderNumber: 'ORD-2024-002',
        line: 'Line B',
        shift: 'morning',
        operator: 'Siti Nurhaliza',
        date: today,
        hour: 8,
        targetPerHour: 45,
        actualProduction: 43,
        rejected: 3,
        rework: 2,
        efficiency: 89,
        remarks: 'Some quality issues'
      },
      {
        id: 4,
        orderNumber: 'ORD-2024-003',
        line: 'Line C',
        shift: 'afternoon',
        operator: 'Budi Santoso',
        date: today,
        hour: 13,
        targetPerHour: 40,
        actualProduction: 42,
        rejected: 1,
        rework: 0,
        efficiency: 103,
        remarks: 'Excellent work'
      },
      {
        id: 5,
        orderNumber: 'ORD-2024-001',
        line: 'Line A',
        shift: 'afternoon',
        operator: 'Dewi Sari',
        date: yesterday,
        hour: 14,
        targetPerHour: 50,
        actualProduction: 47,
        rejected: 4,
        rework: 2,
        efficiency: 88,
        remarks: 'Need attention to quality'
      }
    ]

    // Generate hourly data for charts
    hourlyData.value = [
      { hour: 8, target: 50, actual: 48, efficiency: 96 },
      { hour: 9, target: 50, actual: 52, efficiency: 104 },
      { hour: 10, target: 50, actual: 49, efficiency: 98 },
      { hour: 11, target: 50, actual: 51, efficiency: 102 },
      { hour: 13, target: 45, actual: 43, efficiency: 96 },
      { hour: 14, target: 45, actual: 46, efficiency: 102 },
      { hour: 15, target: 45, actual: 44, efficiency: 98 }
    ]
  }

  return {
    // State
    productionEntries,
    loading,
    error,
    selectedEntry,
    hourlyData,
    efficiencyReport,
    
    // Computed
    entriesByLine,
    todayEntries,
    totalProducedToday,
    averageEfficiency,
    
    // Actions
    fetchProductionEntries,
    fetchEntryById,
    createEntry,
    updateEntry,
    deleteEntry,
    fetchHourlyData,
    fetchEfficiencyReport,
    clearError,
    clearSelectedEntry,
    loadDummyData
  }
})
