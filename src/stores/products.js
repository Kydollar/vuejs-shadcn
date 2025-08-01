import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import dataService from '@/data/dataService'

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

  const uniqueCategories = computed(() =>
    [...new Set(products.value.map(product => product.category))].sort(),
  )

  const lowStockProducts = computed(() =>
    products.value.filter(product =>
      product.stock <= product.minOrder && product.stock > 0,
    ),
  )

  const statistics = computed(() => ({
    total: products.value.length,
    active: activeProducts.value.length,
    lowStock: lowStockProducts.value.length,
    categories: uniqueCategories.value.length,
    totalStock: products.value.reduce((sum, p) => sum + (p.stock || 0), 0),
    totalValue: products.value.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0),
  }))

  // Actions
  const fetchProducts = async (_params = {}) => {
    loading.value = true
    error.value = null
    try {
      // Reduced loading delay to prevent blank screens on fast navigation
      await new Promise(resolve => setTimeout(resolve, 400))
      products.value = dataService.getProducts()
    }
    catch (err) {
      error.value = 'Failed to fetch products'
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
      const product = dataService.getById('products', id)
      if (product) {
        selectedProduct.value = product
        return product
      }
      else {
        throw new Error('Product not found')
      }
    }
    catch (err) {
      error.value = 'Failed to fetch product'
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const newProduct = dataService.createProduct(productData)
      // Immediately update the reactive array
      products.value.push(newProduct)
      return newProduct
    }
    catch (err) {
      error.value = 'Failed to create product'
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const updatedProduct = dataService.updateProduct(id, productData)
      if (updatedProduct) {
        const index = products.value.findIndex(product => product.id === id)
        if (index !== -1) {
          // Update the reactive array immediately
          products.value[index] = updatedProduct
        }
        if (selectedProduct.value?.id === id) {
          selectedProduct.value = updatedProduct
        }
        return updatedProduct
      }
      else {
        throw new Error('Product not found')
      }
    }
    catch (err) {
      error.value = 'Failed to update product'
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      const success = dataService.deleteProduct(id)
      if (success) {
        // Immediately update the reactive array
        products.value = products.value.filter(product => product.id !== id)
        if (selectedProduct.value?.id === id) {
          selectedProduct.value = null
        }
      }
      else {
        throw new Error('Product not found')
      }
    }
    catch (err) {
      error.value = 'Failed to delete product'
      console.error('Error deleting product:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const searchProducts = (query) => {
    return dataService.searchProducts(query)
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedProduct = () => {
    selectedProduct.value = null
  }

  // // Load dummy data for development
  // const loadDummyData = async () => {
  //   // Prevent duplicate loading dan race condition
  //   if (loading.value || products.value.length > 0) {
  //     return
  //   }
  //   await fetchProducts()
  // }

  // Refresh data
  const refreshData = () => {
    fetchProducts()
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
    uniqueCategories,
    lowStockProducts,
    statistics,

    // Actions
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    clearError,
    clearSelectedProduct,
    // loadDummyData,
    refreshData,
  }
})
