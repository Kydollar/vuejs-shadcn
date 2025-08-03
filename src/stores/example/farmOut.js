import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useFarmOutStore = defineStore('farmOut', () => {
  // State
  const farmOuts = ref([])
  const selectedFarmOut = ref(null)
  const loading = ref(false)

  // Dummy data
  const dummyFarmOuts = [
    {
      id: 1,
      farmOutNumber: 'FO-2024-001',
      orderNumber: 'ORD-2024-101',
      subcontractor: 'Elite Garments Ltd.',
      productName: 'Classic Cotton T-Shirt',
      productCode: 'TSH-001',
      category: 'T-Shirts',
      style: 'Regular Fit',
      sizes: {
        XS: { sent: 50, received: 48, approved: 45, rejected: 3 },
        S: { sent: 100, received: 98, approved: 95, rejected: 3 },
        M: { sent: 150, received: 148, approved: 145, rejected: 3 },
        L: { sent: 120, received: 118, approved: 115, rejected: 3 },
        XL: { sent: 80, received: 78, approved: 75, rejected: 3 },
      },
      totalSent: 500,
      totalReceived: 490,
      totalApproved: 475,
      totalRejected: 15,
      unitPrice: 12.5,
      totalValue: 6250.0,
      sentDate: '2024-01-15T08:00:00Z',
      expectedDate: '2024-01-25T17:00:00Z',
      receivedDate: '2024-01-24T14:30:00Z',
      status: 'completed',
      qualityGrade: 'A',
      notes: 'Excellent quality, slight delay but within acceptable range',
      subcontractorContact: {
        manager: 'John Smith',
        phone: '+1-555-0123',
        email: 'john@elitegarments.com',
      },
      rejectionReasons: [
        { reason: 'Size inconsistency', quantity: 8 },
        { reason: 'Color variance', quantity: 4 },
        { reason: 'Stitching defect', quantity: 3 },
      ],
      createdAt: '2024-01-15T08:00:00Z',
    },
    {
      id: 2,
      farmOutNumber: 'FO-2024-002',
      orderNumber: 'ORD-2024-102',
      subcontractor: 'Premium Textiles Inc.',
      productName: 'Polo Shirt with Logo',
      productCode: 'POL-002',
      category: 'Polo Shirts',
      style: 'Slim Fit',
      sizes: {
        S: { sent: 75, received: 75, approved: 72, rejected: 3 },
        M: { sent: 125, received: 125, approved: 120, rejected: 5 },
        L: { sent: 100, received: 100, approved: 95, rejected: 5 },
        XL: { sent: 50, received: 50, approved: 48, rejected: 2 },
      },
      totalSent: 350,
      totalReceived: 350,
      totalApproved: 335,
      totalRejected: 15,
      unitPrice: 18.75,
      totalValue: 6562.5,
      sentDate: '2024-01-20T09:30:00Z',
      expectedDate: '2024-02-05T17:00:00Z',
      receivedDate: null,
      status: 'in_production',
      qualityGrade: null,
      notes: 'Premium quality requirements, embroidery must be precise',
      subcontractorContact: {
        manager: 'Sarah Johnson',
        phone: '+1-555-0456',
        email: 'sarah@premiumtextiles.com',
      },
      rejectionReasons: [],
      createdAt: '2024-01-20T09:30:00Z',
    },
    {
      id: 3,
      farmOutNumber: 'FO-2024-003',
      orderNumber: 'ORD-2024-103',
      subcontractor: 'Quick Fashion Co.',
      productName: 'Basic Tank Top',
      productCode: 'TNK-003',
      category: 'Tank Tops',
      style: 'Regular Fit',
      sizes: {
        XS: { sent: 30, received: 29, approved: 25, rejected: 4 },
        S: { sent: 80, received: 78, approved: 70, rejected: 8 },
        M: { sent: 100, received: 98, approved: 88, rejected: 10 },
        L: { sent: 70, received: 68, approved: 60, rejected: 8 },
      },
      totalSent: 280,
      totalReceived: 273,
      totalApproved: 243,
      totalRejected: 30,
      unitPrice: 8.25,
      totalValue: 2310.0,
      sentDate: '2024-02-01T10:15:00Z',
      expectedDate: '2024-02-12T17:00:00Z',
      receivedDate: '2024-02-13T16:45:00Z',
      status: 'completed',
      qualityGrade: 'B',
      notes: 'Higher rejection rate than expected, quality issues noted',
      subcontractorContact: {
        manager: 'Mike Chen',
        phone: '+1-555-0789',
        email: 'mike@quickfashion.com',
      },
      rejectionReasons: [
        { reason: 'Fabric quality', quantity: 15 },
        { reason: 'Size inconsistency', quantity: 10 },
        { reason: 'Poor finishing', quantity: 5 },
      ],
      createdAt: '2024-02-01T10:15:00Z',
    },
    {
      id: 4,
      farmOutNumber: 'FO-2024-004',
      orderNumber: 'ORD-2024-104',
      subcontractor: 'Artisan Crafts Ltd.',
      productName: 'Embroidered Hoodie',
      productCode: 'HOD-004',
      category: 'Hoodies',
      style: 'Oversized',
      sizes: {
        M: { sent: 60, received: 0, approved: 0, rejected: 0 },
        L: { sent: 90, received: 0, approved: 0, rejected: 0 },
        XL: { sent: 75, received: 0, approved: 0, rejected: 0 },
        XXL: { sent: 45, received: 0, approved: 0, rejected: 0 },
      },
      totalSent: 270,
      totalReceived: 0,
      totalApproved: 0,
      totalRejected: 0,
      unitPrice: 35.0,
      totalValue: 9450.0,
      sentDate: '2024-02-10T11:00:00Z',
      expectedDate: '2024-03-01T17:00:00Z',
      receivedDate: null,
      status: 'sent',
      qualityGrade: null,
      notes: 'Complex embroidery work, premium quality expected',
      subcontractorContact: {
        manager: 'Emma Wilson',
        phone: '+1-555-0321',
        email: 'emma@artisancrafts.com',
      },
      rejectionReasons: [],
      createdAt: '2024-02-10T11:00:00Z',
    },
    {
      id: 5,
      farmOutNumber: 'FO-2024-005',
      orderNumber: 'ORD-2024-105',
      subcontractor: 'Global Manufacturing Hub',
      productName: 'Sports Jersey',
      productCode: 'JER-005',
      category: 'Sports Wear',
      style: 'Athletic Fit',
      sizes: {
        S: { sent: 40, received: 39, approved: 37, rejected: 2 },
        M: { sent: 80, received: 78, approved: 75, rejected: 3 },
        L: { sent: 70, received: 68, approved: 65, rejected: 3 },
        XL: { sent: 50, received: 49, approved: 47, rejected: 2 },
      },
      totalSent: 240,
      totalReceived: 234,
      totalApproved: 224,
      totalRejected: 10,
      unitPrice: 28.0,
      totalValue: 6720.0,
      sentDate: '2024-01-25T14:20:00Z',
      expectedDate: '2024-02-08T17:00:00Z',
      receivedDate: '2024-02-07T13:15:00Z',
      status: 'completed',
      qualityGrade: 'A',
      notes: 'Excellent sublimation printing quality, delivered early',
      subcontractorContact: {
        manager: 'David Park',
        phone: '+1-555-0654',
        email: 'david@globalmfg.com',
      },
      rejectionReasons: [
        { reason: 'Minor print alignment', quantity: 6 },
        { reason: 'Fabric thickness', quantity: 4 },
      ],
      createdAt: '2024-01-25T14:20:00Z',
    },
  ]

  // Computed properties
  const activeFarmOuts = computed(() =>
    farmOuts.value.filter(farmOut => farmOut.status !== 'cancelled'),
  )

  const farmOutsByStatus = computed(() => {
    const statuses = {}
    farmOuts.value.forEach((farmOut) => {
      if (!statuses[farmOut.status]) {
        statuses[farmOut.status] = []
      }
      statuses[farmOut.status].push(farmOut)
    })
    return statuses
  })

  const farmOutsBySubcontractor = computed(() => {
    const subcontractors = {}
    farmOuts.value.forEach((farmOut) => {
      if (!subcontractors[farmOut.subcontractor]) {
        subcontractors[farmOut.subcontractor] = []
      }
      subcontractors[farmOut.subcontractor].push(farmOut)
    })
    return subcontractors
  })

  const totalValueSent = computed(() =>
    farmOuts.value.reduce((sum, farmOut) => sum + farmOut.totalValue, 0),
  )

  const averageQualityRate = computed(() => {
    const completed = farmOuts.value.filter(f => f.status === 'completed' && f.totalReceived > 0)
    if (completed.length === 0)
      return 0
    const totalApprovalRate = completed.reduce(
      (sum, farmOut) => sum + (farmOut.totalApproved / farmOut.totalReceived) * 100,
      0,
    )
    return Math.round(totalApprovalRate / completed.length)
  })

  const overdueJobs = computed(() => {
    const now = new Date()
    return farmOuts.value.filter(
      farmOut =>
        farmOut.status !== 'completed'
        && farmOut.status !== 'cancelled'
        && new Date(farmOut.expectedDate) < now,
    )
  })

  // Actions
  async function loadDummyData() {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      farmOuts.value = [...dummyFarmOuts]
    }
    catch (error) {
      console.error('Error loading farm outs:', error)
    }
    finally {
      loading.value = false
    }
  }

  async function createFarmOut(farmOutData) {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const newFarmOut = {
        ...farmOutData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      }

      farmOuts.value.push(newFarmOut)
      return newFarmOut
    }
    catch (error) {
      console.error('Error creating farm out:', error)
      throw error
    }
    finally {
      loading.value = false
    }
  }

  async function updateFarmOut(id, farmOutData) {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const index = farmOuts.value.findIndex(farmOut => farmOut.id === id)
      if (index !== -1) {
        farmOuts.value[index] = { ...farmOuts.value[index], ...farmOutData }
        return farmOuts.value[index]
      }
      throw new Error('Farm out not found')
    }
    catch (error) {
      console.error('Error updating farm out:', error)
      throw error
    }
    finally {
      loading.value = false
    }
  }

  async function deleteFarmOut(id) {
    loading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))

      const index = farmOuts.value.findIndex(farmOut => farmOut.id === id)
      if (index !== -1) {
        farmOuts.value.splice(index, 1)
        return true
      }
      throw new Error('Farm out not found')
    }
    catch (error) {
      console.error('Error deleting farm out:', error)
      throw error
    }
    finally {
      loading.value = false
    }
  }

  function getFarmOutById(id) {
    return farmOuts.value.find(farmOut => farmOut.id === id)
  }

  function getFarmOutsByStatus(status) {
    return farmOuts.value.filter(farmOut => farmOut.status === status)
  }

  function getFarmOutsBySubcontractor(subcontractor) {
    return farmOuts.value.filter(farmOut => farmOut.subcontractor === subcontractor)
  }

  // Return store interface
  return {
    // State
    farmOuts,
    selectedFarmOut,
    loading,

    // Computed
    activeFarmOuts,
    farmOutsByStatus,
    farmOutsBySubcontractor,
    totalValueSent,
    averageQualityRate,
    overdueJobs,

    // Actions
    loadDummyData,
    createFarmOut,
    updateFarmOut,
    deleteFarmOut,
    getFarmOutById,
    getFarmOutsByStatus,
    getFarmOutsBySubcontractor,
  }
})
