import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useDecorationStore = defineStore('decoration', () => {
  const decorations = ref([])
  const decorationTypes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Dummy decoration types
  const dummyDecorationTypes = [
    {
      id: 1,
      name: 'Rhinestone',
      unit: 'pieces',
      weight_per_unit: 0.001, // kg per piece
      cost_per_unit: 0.05,
    },
    {
      id: 2,
      name: 'Nailhead',
      unit: 'pieces',
      weight_per_unit: 0.002,
      cost_per_unit: 0.03,
    },
    {
      id: 3,
      name: 'Dome Stud',
      unit: 'pieces',
      weight_per_unit: 0.003,
      cost_per_unit: 0.08,
    },
    {
      id: 4,
      name: 'Embroidery',
      unit: 'pieces',
      weight_per_unit: 0.001,
      cost_per_unit: 1.50,
    },
    {
      id: 5,
      name: 'Screen Print',
      unit: 'pieces',
      weight_per_unit: 0.002,
      cost_per_unit: 0.75,
    },
    {
      id: 6,
      name: 'Heat Transfer',
      unit: 'pieces',
      weight_per_unit: 0.001,
      cost_per_unit: 0.45,
    },
    {
      id: 7,
      name: 'Applique',
      unit: 'pieces',
      weight_per_unit: 0.005,
      cost_per_unit: 2.20,
    },
    {
      id: 8,
      name: 'Laser Cut',
      unit: 'pieces',
      weight_per_unit: 0.000,
      cost_per_unit: 0.25,
    },
  ]

  // Dummy decorations data
  const dummyDecorations = [
    {
      id: 1,
      order_id: 1,
      type_id: 1,
      type: 'Rhinestone',
      description: 'Silver rhinestone logo on front chest',
      color: 'Silver',
      size: '3mm',
      quantity: 5000,
      weight_per_unit: 0.001,
      total_weight: 5.0,
      cost_per_unit: 0.05,
      total_cost: 250.00,
      placement: 'Front chest',
      design_file: 'logo-rhinestone.svg',
      status: 'confirmed',
      created_at: '2024-01-15',
    },
    {
      id: 2,
      order_id: 2,
      type_id: 4,
      type: 'Embroidery',
      description: 'Company logo embroidery',
      color: 'Navy Blue',
      size: '50mm x 30mm',
      quantity: 3000,
      weight_per_unit: 0.001,
      total_weight: 3.0,
      cost_per_unit: 1.50,
      total_cost: 4500.00,
      placement: 'Left chest',
      design_file: 'company-logo.dst',
      status: 'in_production',
      created_at: '2024-01-20',
    },
    {
      id: 3,
      order_id: 3,
      type_id: 5,
      type: 'Screen Print',
      description: 'Multi-color screen print design',
      color: 'Multi-color',
      size: '200mm x 150mm',
      quantity: 2500,
      weight_per_unit: 0.002,
      total_weight: 5.0,
      cost_per_unit: 0.75,
      total_cost: 1875.00,
      placement: 'Front center',
      design_file: 'graphic-design.ai',
      status: 'completed',
      created_at: '2024-02-01',
    },
    {
      id: 4,
      order_id: 4,
      type_id: 8,
      type: 'Laser Cut',
      description: 'Laser cut pocket details',
      color: 'N/A',
      size: 'Various',
      quantity: 4000,
      weight_per_unit: 0.000,
      total_weight: 0.0,
      cost_per_unit: 0.25,
      total_cost: 1000.00,
      placement: 'Pocket details',
      design_file: 'pocket-design.dxf',
      status: 'pending',
      created_at: '2024-02-10',
    },
    {
      id: 5,
      order_id: 5,
      type_id: 7,
      type: 'Applique',
      description: 'Floral applique details',
      color: 'Multi-color',
      size: '80mm x 60mm',
      quantity: 1800,
      weight_per_unit: 0.005,
      total_weight: 9.0,
      cost_per_unit: 2.20,
      total_cost: 3960.00,
      placement: 'Front and sleeves',
      design_file: 'floral-applique.svg',
      status: 'confirmed',
      created_at: '2024-02-15',
    },
    {
      id: 6,
      order_id: 6,
      type_id: 6,
      type: 'Heat Transfer',
      description: 'Heat transfer vinyl logo',
      color: 'White',
      size: '100mm x 40mm',
      quantity: 3500,
      weight_per_unit: 0.001,
      total_weight: 3.5,
      cost_per_unit: 0.45,
      total_cost: 1575.00,
      placement: 'Front chest',
      design_file: 'logo-htv.svg',
      status: 'in_production',
      created_at: '2024-03-01',
    },
  ]

  // Computed
  const totalDecorations = computed(() => decorations.value.length)
  const totalDecorationCost = computed(() => decorations.value.reduce((sum, decoration) => sum + (decoration.total_cost || 0), 0))
  const totalDecorationWeight = computed(() => decorations.value.reduce((sum, decoration) => sum + (decoration.total_weight || 0), 0))

  const decorationsByType = computed(() => {
    const grouped = {}
    decorations.value.forEach((decoration) => {
      if (!grouped[decoration.type]) {
        grouped[decoration.type] = []
      }
      grouped[decoration.type].push(decoration)
    })
    return grouped
  })

  const decorationsByStatus = computed(() => {
    const grouped = {}
    decorations.value.forEach((decoration) => {
      if (!grouped[decoration.status]) {
        grouped[decoration.status] = []
      }
      grouped[decoration.status].push(decoration)
    })
    return grouped
  })

  // Actions
  const fetchDecorations = async () => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      decorations.value = dummyDecorations
    }
    catch (err) {
      error.value = err.message
    }
    finally {
      loading.value = false
    }
  }

  const fetchDecorationTypes = async () => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      decorationTypes.value = dummyDecorationTypes
    }
    catch (err) {
      error.value = err.message
    }
    finally {
      loading.value = false
    }
  }

  const getDecorationById = (id) => {
    return decorations.value.find(decoration => decoration.id === id)
  }

  const getDecorationsByOrder = (orderId) => {
    return decorations.value.filter(decoration => decoration.order_id === orderId)
  }

  const getDecorationsByType = (type) => {
    return decorations.value.filter(decoration => decoration.type === type)
  }

  const getDecorationTypeById = (id) => {
    return decorationTypes.value.find(type => type.id === id)
  }

  const calculateDecorationCost = (typeId, quantity) => {
    const decorationType = getDecorationTypeById(typeId)
    if (decorationType) {
      return quantity * decorationType.cost_per_unit
    }
    return 0
  }

  const calculateDecorationWeight = (typeId, quantity) => {
    const decorationType = getDecorationTypeById(typeId)
    if (decorationType) {
      return quantity * decorationType.weight_per_unit
    }
    return 0
  }

  const createDecoration = async (decorationData) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const decorationType = getDecorationTypeById(decorationData.type_id)
      const totalCost = calculateDecorationCost(decorationData.type_id, decorationData.quantity)
      const totalWeight = calculateDecorationWeight(decorationData.type_id, decorationData.quantity)

      const newDecoration = {
        id: Date.now(),
        ...decorationData,
        type: decorationType?.name || '',
        weight_per_unit: decorationType?.weight_per_unit || 0,
        cost_per_unit: decorationType?.cost_per_unit || 0,
        total_cost: totalCost,
        total_weight: totalWeight,
        status: 'pending',
        created_at: new Date().toISOString().split('T')[0],
      }
      decorations.value.push(newDecoration)
      return newDecoration
    }
    catch (err) {
      error.value = err.message
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const updateDecoration = async (id, decorationData) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = decorations.value.findIndex(decoration => decoration.id === id)
      if (index !== -1) {
        const updatedDecoration = { ...decorations.value[index], ...decorationData }

        // Recalculate cost and weight if quantity or type changed
        if (decorationData.quantity || decorationData.type_id) {
          const typeId = decorationData.type_id || updatedDecoration.type_id
          const quantity = decorationData.quantity || updatedDecoration.quantity
          updatedDecoration.total_cost = calculateDecorationCost(typeId, quantity)
          updatedDecoration.total_weight = calculateDecorationWeight(typeId, quantity)
        }

        decorations.value[index] = updatedDecoration
        return decorations.value[index]
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

  const deleteDecoration = async (id) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = decorations.value.findIndex(decoration => decoration.id === id)
      if (index !== -1) {
        decorations.value.splice(index, 1)
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
    decorations,
    decorationTypes,
    loading,
    error,

    // Computed
    totalDecorations,
    totalDecorationCost,
    totalDecorationWeight,
    decorationsByType,
    decorationsByStatus,

    // Actions
    fetchDecorations,
    fetchDecorationTypes,
    getDecorationById,
    getDecorationsByOrder,
    getDecorationsByType,
    getDecorationTypeById,
    calculateDecorationCost,
    calculateDecorationWeight,
    createDecoration,
    updateDecoration,
    deleteDecoration,
  }
}, {
  persist: {
    key: 'decoration-store',
    storage: localStorage,
    paths: ['decorations', 'decorationTypes'],
  },
})
