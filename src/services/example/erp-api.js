import { useAxios } from '@/composables/use-axios'

const { axiosInstance } = useAxios()

export const decorationsApi = {
  // Get all decorations
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/decorations', { params })
    return response.data
  },

  // Get decoration by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/decorations/${id}`)
    return response.data
  },

  // Create new decoration
  create: async (data) => {
    const response = await axiosInstance.post('/decorations', data)
    return response.data
  },

  // Update decoration
  update: async (id, data) => {
    const response = await axiosInstance.put(`/decorations/${id}`, data)
    return response.data
  },

  // Delete decoration
  delete: async (id) => {
    const response = await axiosInstance.delete(`/decorations/${id}`)
    return response.data
  },
}

export const productionApi = {
  // Get all production entries
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/production', { params })
    return response.data
  },

  // Get production by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/production/${id}`)
    return response.data
  },

  // Create new production entry
  create: async (data) => {
    const response = await axiosInstance.post('/production', data)
    return response.data
  },

  // Update production entry
  update: async (id, data) => {
    const response = await axiosInstance.put(`/production/${id}`, data)
    return response.data
  },

  // Delete production entry
  delete: async (id) => {
    const response = await axiosInstance.delete(`/production/${id}`)
    return response.data
  },

  // Get hourly production data
  getHourlyData: async (params = {}) => {
    const response = await axiosInstance.get('/production/hourly', { params })
    return response.data
  },

  // Get production efficiency report
  getEfficiencyReport: async (params = {}) => {
    const response = await axiosInstance.get('/production/efficiency', { params })
    return response.data
  },
}

export const qcApi = {
  // Get all QC inspections
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/qc', { params })
    return response.data
  },

  // Get QC inspection by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/qc/${id}`)
    return response.data
  },

  // Create new QC inspection
  create: async (data) => {
    const response = await axiosInstance.post('/qc', data)
    return response.data
  },

  // Update QC inspection
  update: async (id, data) => {
    const response = await axiosInstance.put(`/qc/${id}`, data)
    return response.data
  },

  // Delete QC inspection
  delete: async (id) => {
    const response = await axiosInstance.delete(`/qc/${id}`)
    return response.data
  },

  // Get QC statistics
  getStats: async (params = {}) => {
    const response = await axiosInstance.get('/qc/stats', { params })
    return response.data
  },
}

export const farmOutApi = {
  // Get all farm out results
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/farm-out', { params })
    return response.data
  },

  // Get farm out result by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/farm-out/${id}`)
    return response.data
  },

  // Create new farm out result
  create: async (data) => {
    const response = await axiosInstance.post('/farm-out', data)
    return response.data
  },

  // Update farm out result
  update: async (id, data) => {
    const response = await axiosInstance.put(`/farm-out/${id}`, data)
    return response.data
  },

  // Delete farm out result
  delete: async (id) => {
    const response = await axiosInstance.delete(`/farm-out/${id}`)
    return response.data
  },
}

export const packingListApi = {
  // Get all packing lists
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/packing-lists', { params })
    return response.data
  },

  // Get packing list by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/packing-lists/${id}`)
    return response.data
  },

  // Create new packing list
  create: async (data) => {
    const response = await axiosInstance.post('/packing-lists', data)
    return response.data
  },

  // Update packing list
  update: async (id, data) => {
    const response = await axiosInstance.put(`/packing-lists/${id}`, data)
    return response.data
  },

  // Delete packing list
  delete: async (id) => {
    const response = await axiosInstance.delete(`/packing-lists/${id}`)
    return response.data
  },

  // Generate PDF packing list
  generatePDF: async (id) => {
    const response = await axiosInstance.get(`/packing-lists/${id}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },
}

export const deliveryNoteApi = {
  // Get all delivery notes
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/delivery-notes', { params })
    return response.data
  },

  // Get delivery note by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/delivery-notes/${id}`)
    return response.data
  },

  // Create new delivery note
  create: async (data) => {
    const response = await axiosInstance.post('/delivery-notes', data)
    return response.data
  },

  // Update delivery note
  update: async (id, data) => {
    const response = await axiosInstance.put(`/delivery-notes/${id}`, data)
    return response.data
  },

  // Delete delivery note
  delete: async (id) => {
    const response = await axiosInstance.delete(`/delivery-notes/${id}`)
    return response.data
  },

  // Generate PDF delivery note
  generatePDF: async (id) => {
    const response = await axiosInstance.get(`/delivery-notes/${id}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  // Track shipment
  trackShipment: async (trackingNumber) => {
    const response = await axiosInstance.get(`/delivery-notes/track/${trackingNumber}`)
    return response.data
  },
}
