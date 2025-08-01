import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { qcApi } from '@/services/erp-api'

export const useQCStore = defineStore('qc', () => {
  const inspections = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedInspection = ref(null)
  const qcStats = ref(null)

  // Computed
  const passedInspections = computed(() => 
    inspections.value.filter(inspection => inspection.qcStatus === 'passed')
  )

  const failedInspections = computed(() => 
    inspections.value.filter(inspection => inspection.qcStatus === 'failed')
  )

  const reworkInspections = computed(() => 
    inspections.value.filter(inspection => inspection.qcStatus === 'rework')
  )

  const todayInspections = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return inspections.value.filter(inspection => 
      inspection.inspectionDate === today
    )
  })

  const qualityRate = computed(() => {
    if (inspections.value.length === 0) return 0
    const totalPassed = passedInspections.value.reduce((sum, inspection) => 
      sum + inspection.passedQty, 0)
    const totalInspected = inspections.value.reduce((sum, inspection) => 
      sum + inspection.sampleSize, 0)
    return totalInspected > 0 ? Math.round((totalPassed / totalInspected) * 100) : 0
  })

  const rejectionReasons = computed(() => {
    const reasons = {}
    inspections.value.forEach(inspection => {
      if (inspection.rejectionReasons && inspection.rejectionReasons.length > 0) {
        inspection.rejectionReasons.forEach(reason => {
          reasons[reason] = (reasons[reason] || 0) + 1
        })
      }
    })
    return reasons
  })

  // Actions
  const fetchInspections = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const data = await qcApi.getAll(params)
      inspections.value = data.data || data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch QC inspections'
      console.error('Error fetching QC inspections:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchInspectionById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const data = await qcApi.getById(id)
      selectedInspection.value = data.data || data
      return selectedInspection.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch QC inspection'
      console.error('Error fetching QC inspection:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createInspection = async (inspectionData) => {
    loading.value = true
    error.value = null
    try {
      const data = await qcApi.create(inspectionData)
      const newInspection = data.data || data
      inspections.value.push(newInspection)
      return newInspection
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create QC inspection'
      console.error('Error creating QC inspection:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateInspection = async (id, inspectionData) => {
    loading.value = true
    error.value = null
    try {
      const data = await qcApi.update(id, inspectionData)
      const updatedInspection = data.data || data
      const index = inspections.value.findIndex(inspection => inspection.id === id)
      if (index !== -1) {
        inspections.value[index] = updatedInspection
      }
      if (selectedInspection.value?.id === id) {
        selectedInspection.value = updatedInspection
      }
      return updatedInspection
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update QC inspection'
      console.error('Error updating QC inspection:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteInspection = async (id) => {
    loading.value = true
    error.value = null
    try {
      await qcApi.delete(id)
      inspections.value = inspections.value.filter(inspection => inspection.id !== id)
      if (selectedInspection.value?.id === id) {
        selectedInspection.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete QC inspection'
      console.error('Error deleting QC inspection:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchQCStats = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const data = await qcApi.getStats(params)
      qcStats.value = data.data || data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch QC statistics'
      console.error('Error fetching QC statistics:', err)
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedInspection = () => {
    selectedInspection.value = null
  }

  // Load dummy data for development
  const loadDummyData = () => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    inspections.value = [
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        inspector: 'QC Inspector 1',
        inspectionDate: today,
        sampleSize: 100,
        passedQty: 95,
        rejectedQty: 5,
        rejectionReasons: ['stitchingDefect', 'colorIssue'],
        qcStatus: 'passed',
        notes: 'Minor defects found, within acceptable range'
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002',
        inspector: 'QC Inspector 2',
        inspectionDate: today,
        sampleSize: 80,
        passedQty: 70,
        rejectedQty: 10,
        rejectionReasons: ['sizeIssue', 'fabricDefect'],
        qcStatus: 'rework',
        notes: 'Size inconsistency detected, requires rework'
      },
      {
        id: 3,
        orderNumber: 'ORD-2024-003',
        inspector: 'QC Inspector 1',
        inspectionDate: yesterday,
        sampleSize: 120,
        passedQty: 118,
        rejectedQty: 2,
        rejectionReasons: ['decorationDefect'],
        qcStatus: 'passed',
        notes: 'Excellent quality, minor decoration issues'
      },
      {
        id: 4,
        orderNumber: 'ORD-2024-004',
        inspector: 'QC Inspector 3',
        inspectionDate: yesterday,
        sampleSize: 90,
        passedQty: 75,
        rejectedQty: 15,
        rejectionReasons: ['stitchingDefect', 'sizeIssue', 'colorIssue'],
        qcStatus: 'failed',
        notes: 'Multiple quality issues, production adjustment needed'
      },
      {
        id: 5,
        orderNumber: 'ORD-2024-005',
        inspector: 'QC Inspector 2',
        inspectionDate: today,
        sampleSize: 60,
        passedQty: 58,
        rejectedQty: 2,
        rejectionReasons: ['other'],
        qcStatus: 'passed',
        notes: 'High quality standard maintained'
      }
    ]

    qcStats.value = {
      totalInspections: inspections.value.length,
      passRate: qualityRate.value,
      commonDefects: rejectionReasons.value,
      inspectionTrend: [
        { date: yesterday, passed: 193, failed: 17, rework: 10 },
        { date: today, passed: 223, failed: 15, rework: 10 }
      ]
    }
  }

  return {
    // State
    inspections,
    loading,
    error,
    selectedInspection,
    qcStats,
    
    // Computed
    passedInspections,
    failedInspections,
    reworkInspections,
    todayInspections,
    qualityRate,
    rejectionReasons,
    
    // Actions
    fetchInspections,
    fetchInspectionById,
    createInspection,
    updateInspection,
    deleteInspection,
    fetchQCStats,
    clearError,
    clearSelectedInspection,
    loadDummyData
  }
})
