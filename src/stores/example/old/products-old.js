import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { productsApi } from '@/services/example/api'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedProduct = ref(null)

  // Computed
  const activeProducts = computed(() =>
    products.value.filter(product => product.status === 'active'),
  )

  const productOptions = computed(() =>
    activeProducts.value.map(product => ({
      value: product.id,
      label: `${product.productCode} - ${product.productName}`,
    })),
  )

  const productsByCategory = computed(() => {
    const categories = {}
    products.value.forEach((product) => {
      if (!categories[product.category]) {
        categories[product.category] = []
      }
      categories[product.category].push(product)
    })
    return categories
  })

  const lowStockProducts = computed(() =>
    products.value.filter(product => product.stockQuantity <= product.minStockLevel),
  )

  // Actions
  const fetchProducts = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const data = await productsApi.getAll(params)
      products.value = data.data || data
    }
    catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch products'
      console.error('Error fetching products:', err)
    }
    finally {
      loading.value = false
    }
  }

  const fetchProductById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const data = await productsApi.getById(id)
      selectedProduct.value = data.data || data
      return selectedProduct.value
    }
    catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch product'
      console.error('Error fetching product:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const createProduct = async (productData) => {
    loading.value = true
    error.value = null
    try {
      const data = await productsApi.create(productData)
      const newProduct = data.data || data
      products.value.push(newProduct)
      return newProduct
    }
    catch (err) {
      error.value = err.response?.data?.message || 'Failed to create product'
      console.error('Error creating product:', err)
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
      const data = await productsApi.update(id, productData)
      const updatedProduct = data.data || data
      const index = products.value.findIndex(product => product.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
      if (selectedProduct.value?.id === id) {
        selectedProduct.value = updatedProduct
      }
      return updatedProduct
    }
    catch (err) {
      error.value = err.response?.data?.message || 'Failed to update product'
      console.error('Error updating product:', err)
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
      await productsApi.delete(id)
      products.value = products.value.filter(product => product.id !== id)
      if (selectedProduct.value?.id === id) {
        selectedProduct.value = null
      }
    }
    catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete product'
      console.error('Error deleting product:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedProduct = () => {
    selectedProduct.value = null
  }

  // Load dummy data for development
  function loadDummyData() {
    products.value = [
      {
        id: 1,
        productCode: 'TXT-001',
        productName: 'Premium Cotton T-Shirt',
        category: 'Apparel',
        description: 'High-quality 100% cotton t-shirt with premium finish',
        material: '100% Cotton',
        color: 'White',
        size: 'S, M, L, XL',
        unitPrice: 15.5,
        costPrice: 8.75,
        stockQuantity: 150,
        minStockLevel: 50,
        unit: 'pieces',
        weight: 0.2,
        dimensions: '30x40x2 cm',
        supplier: 'Cotton Mills Ltd.',
        status: 'active',
        imageUrl: '/placeholder.png',
        createdAt: '2024-01-15T08:00:00Z',
      },
      {
        id: 2,
        productCode: 'DRS-002',
        productName: 'Summer Floral Dress',
        category: 'Apparel',
        description: 'Lightweight summer dress with floral print',
        material: '95% Cotton, 5% Elastane',
        color: 'Multi-color',
        size: 'XS, S, M, L, XL',
        unitPrice: 45.0,
        costPrice: 25.5,
        stockQuantity: 75,
        minStockLevel: 25,
        unit: 'pieces',
        weight: 0.4,
        dimensions: '35x50x3 cm',
        supplier: 'Fashion Forward Co.',
        status: 'active',
        imageUrl: '/placeholder.png',
        createdAt: '2024-01-20T10:30:00Z',
      },
      {
        id: 3,
        productCode: 'JNS-003',
        productName: 'Classic Denim Jeans',
        category: 'Apparel',
        description: 'Classic straight-fit denim jeans',
        material: '98% Cotton, 2% Elastane',
        color: 'Indigo Blue',
        size: '28, 30, 32, 34, 36, 38',
        unitPrice: 65.0,
        costPrice: 35.75,
        stockQuantity: 120,
        minStockLevel: 40,
        unit: 'pieces',
        weight: 0.8,
        dimensions: '40x45x4 cm',
        supplier: 'Denim Works Inc.',
        status: 'active',
        imageUrl: '/placeholder.png',
        createdAt: '2024-02-01T14:15:00Z',
      },
      {
        id: 4,
        productCode: 'BAG-004',
        productName: 'Leather Handbag',
        category: 'Accessories',
        description: 'Genuine leather handbag with multiple compartments',
        material: 'Genuine Leather',
        color: 'Brown',
        size: 'One Size',
        unitPrice: 125.0,
        costPrice: 70.0,
        stockQuantity: 30,
        minStockLevel: 15,
        unit: 'pieces',
        weight: 1.2,
        dimensions: '30x25x15 cm',
        supplier: 'Leather Craft Ltd.',
        status: 'active',
        imageUrl: '/placeholder.png',
        createdAt: '2024-01-25T11:45:00Z',
      },
      {
        id: 5,
        productCode: 'SHO-005',
        productName: 'Running Sneakers',
        category: 'Footwear',
        description: 'Comfortable running sneakers with cushioned sole',
        material: 'Synthetic Upper, Rubber Sole',
        color: 'Black/White',
        size: '6, 7, 8, 9, 10, 11, 12',
        unitPrice: 85.0,
        costPrice: 45.0,
        stockQuantity: 15,
        minStockLevel: 30,
        unit: 'pairs',
        weight: 1.0,
        dimensions: '35x25x12 cm',
        supplier: 'SportShoe Manufacturers',
        status: 'low_stock',
        imageUrl: '/placeholder.png',
        createdAt: '2024-02-10T16:20:00Z',
      },
      {
        id: 6,
        productCode: 'SWR-006',
        productName: 'Wool Sweater',
        category: 'Apparel',
        description: 'Warm wool sweater for winter season',
        material: '100% Merino Wool',
        color: 'Navy Blue',
        size: 'S, M, L, XL',
        unitPrice: 95.0,
        costPrice: 55.0,
        stockQuantity: 0,
        minStockLevel: 20,
        unit: 'pieces',
        weight: 0.6,
        dimensions: '35x45x5 cm',
        supplier: 'Wool Works Co.',
        status: 'out_of_stock',
        imageUrl: '/placeholder.png',
        createdAt: '2024-01-30T09:10:00Z',
      },
    ]
  }

  return {
    // State
    products,
    loading,
    error,
    selectedProduct,

    // Computed
    activeProducts,
    productOptions,
    productsByCategory,
    lowStockProducts,

    // Actions
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError,
    clearSelectedProduct,
    loadDummyData,
  }
})
