import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Dummy data
  const dummyProducts = [
    {
      id: 1,
      style_no: 'TS-001',
      name: 'Basic Cotton T-Shirt',
      body_color: 'White',
      graphic_no: 'GR-001',
      tech_description: '100% Cotton, Single Jersey, 180 GSM',
      price: 12.50,
      category: 'T-Shirt',
      size_range: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      material: '100% Cotton',
      weight: 180,
      created_at: '2024-01-15',
      status: 'active',
      images: ['/placeholder.png'],
      specifications: {
        fabric_type: 'Single Jersey',
        gsm: 180,
        shrinkage: '3-5%',
        color_fastness: 'Grade 4-5',
      },
    },
    {
      id: 2,
      style_no: 'PL-002',
      name: 'Premium Polo Shirt',
      body_color: 'Navy Blue',
      graphic_no: 'GR-002',
      tech_description: '95% Cotton, 5% Elastane, Pique, 220 GSM',
      price: 18.75,
      category: 'Polo Shirt',
      size_range: ['S', 'M', 'L', 'XL', 'XXL'],
      material: '95% Cotton, 5% Elastane',
      weight: 220,
      created_at: '2024-01-20',
      status: 'active',
      images: ['/placeholder.png'],
      specifications: {
        fabric_type: 'Pique',
        gsm: 220,
        shrinkage: '2-3%',
        color_fastness: 'Grade 4-5',
      },
    },
    {
      id: 3,
      style_no: 'HD-003',
      name: 'Classic Hoodie',
      body_color: 'Heather Grey',
      graphic_no: 'GR-003',
      tech_description: '80% Cotton, 20% Polyester, Fleece, 320 GSM',
      price: 32.00,
      category: 'Hoodie',
      size_range: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
      material: '80% Cotton, 20% Polyester',
      weight: 320,
      created_at: '2024-02-01',
      status: 'active',
      images: ['/placeholder.png'],
      specifications: {
        fabric_type: 'Fleece',
        gsm: 320,
        shrinkage: '3-5%',
        color_fastness: 'Grade 4',
      },
    },
    {
      id: 4,
      style_no: 'JS-004',
      name: 'Slim Fit Jeans',
      body_color: 'Dark Blue',
      graphic_no: 'GR-004',
      tech_description: '98% Cotton, 2% Elastane, Denim, 12 OZ',
      price: 45.50,
      category: 'Jeans',
      size_range: ['28', '30', '32', '34', '36', '38', '40'],
      material: '98% Cotton, 2% Elastane',
      weight: 340,
      created_at: '2024-02-10',
      status: 'active',
      images: ['/placeholder.png'],
      specifications: {
        fabric_type: 'Denim',
        weight_oz: 12,
        shrinkage: '2-3%',
        color_fastness: 'Grade 4-5',
      },
    },
    {
      id: 5,
      style_no: 'DR-005',
      name: 'Summer Dress',
      body_color: 'Floral Print',
      graphic_no: 'GR-005',
      tech_description: '100% Viscose, Woven, 140 GSM',
      price: 28.90,
      category: 'Dress',
      size_range: ['XS', 'S', 'M', 'L', 'XL'],
      material: '100% Viscose',
      weight: 140,
      created_at: '2024-02-15',
      status: 'active',
      images: ['/placeholder.png'],
      specifications: {
        fabric_type: 'Woven',
        gsm: 140,
        shrinkage: '3-5%',
        color_fastness: 'Grade 4',
      },
    },
    {
      id: 6,
      style_no: 'SW-006',
      name: 'Athletic Sweatshirt',
      body_color: 'Black',
      graphic_no: 'GR-006',
      tech_description: '60% Cotton, 40% Polyester, French Terry, 280 GSM',
      price: 25.60,
      category: 'Sweatshirt',
      size_range: ['S', 'M', 'L', 'XL', 'XXL'],
      material: '60% Cotton, 40% Polyester',
      weight: 280,
      created_at: '2024-03-01',
      status: 'active',
      images: ['/placeholder.png'],
      specifications: {
        fabric_type: 'French Terry',
        gsm: 280,
        shrinkage: '3-5%',
        color_fastness: 'Grade 4-5',
      },
    },
  ]

  // Computed
  const activeProducts = computed(() => products.value.filter(p => p.status === 'active'))
  const totalProducts = computed(() => products.value.length)
  const productsByCategory = computed(() => {
    const grouped = {}
    products.value.forEach((product) => {
      if (!grouped[product.category]) {
        grouped[product.category] = []
      }
      grouped[product.category].push(product)
    })
    return grouped
  })
  const averagePrice = computed(() => {
    if (products.value.length === 0)
      return 0
    return products.value.reduce((sum, product) => sum + (product.price || 0), 0) / products.value.length
  })

  // Actions
  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      products.value = dummyProducts
    }
    catch (err) {
      error.value = err.message
    }
    finally {
      loading.value = false
    }
  }

  const getProductById = (id) => {
    return products.value.find(product => product.id === id)
  }

  const getProductByStyleNo = (styleNo) => {
    return products.value.find(product => product.style_no === styleNo)
  }

  const getProductsByCategory = (category) => {
    return products.value.filter(product => product.category === category)
  }

  const searchProducts = (query) => {
    const searchTerm = query.toLowerCase()
    return products.value.filter(product =>
      product.name.toLowerCase().includes(searchTerm)
      || product.style_no.toLowerCase().includes(searchTerm)
      || product.body_color.toLowerCase().includes(searchTerm)
      || product.category.toLowerCase().includes(searchTerm),
    )
  }

  const createProduct = async (productData) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const newProduct = {
        id: Date.now(),
        ...productData,
        created_at: new Date().toISOString().split('T')[0],
        status: 'active',
        images: ['/placeholder.png'],
      }
      products.value.push(newProduct)
      return newProduct
    }
    catch (err) {
      error.value = err.message
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const updateProduct = async (id, productData) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = products.value.findIndex(product => product.id === id)
      if (index !== -1) {
        products.value[index] = { ...products.value[index], ...productData }
        return products.value[index]
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

  const deleteProduct = async (id) => {
    loading.value = true
    error.value = null
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = products.value.findIndex(product => product.id === id)
      if (index !== -1) {
        products.value.splice(index, 1)
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
    products,
    loading,
    error,

    // Computed
    activeProducts,
    totalProducts,
    productsByCategory,
    averagePrice,

    // Actions
    fetchProducts,
    getProductById,
    getProductByStyleNo,
    getProductsByCategory,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  }
}, {
  persist: {
    key: 'product-store',
    storage: localStorage,
    paths: ['products'],
  },
})
