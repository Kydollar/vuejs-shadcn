import { useAxios } from '@/composables/use-axios'

const { axiosInstance } = useAxios()

export const buyersApi = {
  // Get all buyers
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/buyers', { params })
    return response.data
  },

  // Get buyer by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/buyers/${id}`)
    return response.data
  },

  // Create new buyer
  create: async (data) => {
    const response = await axiosInstance.post('/buyers', data)
    return response.data
  },

  // Update buyer
  update: async (id, data) => {
    const response = await axiosInstance.put(`/buyers/${id}`, data)
    return response.data
  },

  // Delete buyer
  delete: async (id) => {
    const response = await axiosInstance.delete(`/buyers/${id}`)
    return response.data
  },
}

export const factoriesApi = {
  // Get all factories
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/factories', { params })
    return response.data
  },

  // Get factory by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/factories/${id}`)
    return response.data
  },

  // Create new factory
  create: async (data) => {
    const response = await axiosInstance.post('/factories', data)
    return response.data
  },

  // Update factory
  update: async (id, data) => {
    const response = await axiosInstance.put(`/factories/${id}`, data)
    return response.data
  },

  // Delete factory
  delete: async (id) => {
    const response = await axiosInstance.delete(`/factories/${id}`)
    return response.data
  },
}

export const productsApi = {
  // Get all products
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/products', { params })
    return response.data
  },

  // Get product by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/products/${id}`)
    return response.data
  },

  // Create new product
  create: async (data) => {
    const response = await axiosInstance.post('/products', data)
    return response.data
  },

  // Update product
  update: async (id, data) => {
    const response = await axiosInstance.put(`/products/${id}`, data)
    return response.data
  },

  // Delete product
  delete: async (id) => {
    const response = await axiosInstance.delete(`/products/${id}`)
    return response.data
  },

  // Upload product image
  uploadImage: async (id, file) => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await axiosInstance.post(`/products/${id}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

export const ordersApi = {
  // Get all orders
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/orders', { params })
    return response.data
  },

  // Get order by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}`)
    return response.data
  },

  // Create new order
  create: async (data) => {
    const response = await axiosInstance.post('/orders', data)
    return response.data
  },

  // Update order
  update: async (id, data) => {
    const response = await axiosInstance.put(`/orders/${id}`, data)
    return response.data
  },

  // Delete order
  delete: async (id) => {
    const response = await axiosInstance.delete(`/orders/${id}`)
    return response.data
  },

  // Upload graphic file
  uploadGraphic: async (id, file) => {
    const formData = new FormData()
    formData.append('graphic', file)
    const response = await axiosInstance.post(`/orders/${id}/upload-graphic`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get order progress tracking
  getProgress: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}/progress`)
    return response.data
  },
}
