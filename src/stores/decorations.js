import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import dataService from '@/data/dataService'

export const useDecorationsStore = defineStore('decorations', () => {
  // State
  const decorations = ref([])
  const selectedDecoration = ref(null)
  const loading = ref(false)

  // Computed properties
  const activeDecorations = computed(() =>
    decorations.value.filter(decoration => decoration.status === 'active'),
  )

  const decorationsByCategory = computed(() => {
    const categories = {}
    decorations.value.forEach((decoration) => {
      if (!categories[decoration.category]) {
        categories[decoration.category] = []
      }
      categories[decoration.category].push(decoration)
    })
    return categories
  })

  const decorationsByTechnique = computed(() => {
    const techniques = {}
    decorations.value.forEach((decoration) => {
      if (!techniques[decoration.decorationType]) {
        techniques[decoration.decorationType] = []
      }
      techniques[decoration.decorationType].push(decoration)
    })
    return techniques
  })

  const highComplexityDecorations = computed(() =>
    decorations.value.filter(decoration => decoration.complexity === 'High'),
  )

  const averageSetupTime = computed(() => {
    if (decorations.value.length === 0)
      return 0
    const total = decorations.value.reduce((sum, decoration) => sum + decoration.setupTime, 0)
    return Math.round(total / decorations.value.length)
  })

  const averageCostPerUnit = computed(() => {
    if (decorations.value.length === 0)
      return 0
    const total = decorations.value.reduce((sum, decoration) => sum + decoration.costPerUnit, 0)
    return (total / decorations.value.length).toFixed(2)
  })

  // Actions
  async function fetchDecorations() {
    loading.value = true
    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 400))
      decorations.value = dataService.getDecorations()
    }
    catch (error) {
      console.error('Error fetching decorations:', error)
    }
    finally {
      loading.value = false
    }
  }

  async function createDecoration(decorationData) {
    loading.value = true
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const newDecoration = dataService.createDecoration(decorationData)
      decorations.value.push(newDecoration)
      return newDecoration
    }
    catch (error) {
      console.error('Error creating decoration:', error)
      throw error
    }
    finally {
      loading.value = false
    }
  }

  async function updateDecoration(id, decorationData) {
    loading.value = true
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const updatedDecoration = dataService.updateDecoration(id, decorationData)
      if (updatedDecoration) {
        const index = decorations.value.findIndex(decoration => decoration.id === id)
        if (index !== -1) {
          decorations.value[index] = updatedDecoration
        }
        return updatedDecoration
      }
      throw new Error('Decoration not found')
    }
    catch (error) {
      console.error('Error updating decoration:', error)
      throw error
    }
    finally {
      loading.value = false
    }
  }

  async function deleteDecoration(id) {
    loading.value = true
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const success = dataService.deleteDecoration(id)
      if (success) {
        decorations.value = decorations.value.filter(decoration => decoration.id !== id)
        return true
      }
      throw new Error('Decoration not found')
    }
    catch (error) {
      console.error('Error deleting decoration:', error)
      throw error
    }
    finally {
      loading.value = false
    }
  }

  function getDecorationById(id) {
    return decorations.value.find(decoration => decoration.id === id)
  }

  function getDecorationsByType(type) {
    return decorations.value.filter(decoration => decoration.decorationType === type)
  }

  function getDecorationsByComplexity(complexity) {
    return decorations.value.filter(decoration => decoration.complexity === complexity)
  }

  // Return store interface
  return {
    // State
    decorations,
    selectedDecoration,
    loading,

    // Computed
    activeDecorations,
    decorationsByCategory,
    decorationsByTechnique,
    highComplexityDecorations,
    averageSetupTime,
    averageCostPerUnit,

    // Actions
    fetchDecorations,
    createDecoration,
    updateDecoration,
    deleteDecoration,
    getDecorationById,
    getDecorationsByType,
    getDecorationsByComplexity,
  }
})
