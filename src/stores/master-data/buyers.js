import { defineStore } from 'pinia'
import { ref } from 'vue'
import dataService from '@/data/dataService'

export const useBuyersStore = defineStore('buyers', () => {
  // State management untuk data utama pembeli
  const buyers = ref([])
  const loadingBuyers = ref(false) // Loading state khusus untuk data pembeli
  const buyersError = ref(null) // Error state khusus untuk data pembeli

  // State management untuk pagination
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalPages = ref(1)
  const totalItems = ref(0)

  // State management untuk filter dan sorting
  const query = ref('')
  const status = ref('all')
  const country = ref('all')
  const sortBy = ref('createdAt')
  const sortDirection = ref('desc')

  // State management untuk item yang dipilih
  const selectedBuyer = ref(null)
  const selectedIds = ref([])

  // State management untuk data statistik
  const countries = ref([])
  const totalBuyers = ref(0)
  const activeBuyers = ref(0)
  const inactiveBuyers = ref(0)
  const loadingStats = ref(false) // Loading state khusus untuk statistik
  const statsError = ref(null) // Error state khusus untuk statistik

  // Computed untuk mengecek apakah ada lebih banyak data yang bisa dimuat
  const hasMoreBuyers = ref(false)

  // --- Actions ---

  /**
   * Mengambil daftar pembeli dari dataService.
   * Fungsi ini mengatur state `loadingBuyers` dan `buyersError`.
   */
  const fetchBuyers = async () => {
    loadingBuyers.value = true
    buyersError.value = null
    try {
      currentPage.value = 1
      const result = await dataService.getBuyers({
        page: currentPage.value,
        pageSize: pageSize.value,
        query: query.value,
        status: status.value,
        country: country.value,
        sortBy: sortBy.value,
        sortDirection: sortDirection.value,
      })

      buyers.value = result.data
      totalItems.value = result.total
      totalPages.value = result.totalPages
      hasMoreBuyers.value = currentPage.value < totalPages.value
    }
    catch (err) {
      buyersError.value = err
    }
    finally {
      loadingBuyers.value = false
    }
  }

  /**
   * Mengambil data statistik dari dataService.
   * Fungsi ini mengatur state `loadingStats` dan `statsError`.
   */
  const fetchStats = async () => {
    loadingStats.value = true
    statsError.value = null
    try {
      // Mengambil data statistik secara terpisah
      countries.value = dataService.getUniqueCountries()
      totalBuyers.value = dataService.getTotalBuyers()
      activeBuyers.value = dataService.getActiveBuyersCount()
      inactiveBuyers.value = dataService.getInactiveBuyersCount()
    }
    catch (err) {
      statsError.value = err
    }
    finally {
      loadingStats.value = false
    }
  }

  /**
   * Memuat lebih banyak pembeli ke halaman berikutnya.
   */
  const loadMoreBuyers = async () => {
    if (!hasMoreBuyers.value)
      return

    loadingBuyers.value = true
    buyersError.value = null
    try {
      const nextPage = currentPage.value + 1
      const result = await dataService.getBuyers({
        page: nextPage,
        pageSize: pageSize.value,
        query: query.value,
        status: status.value,
        country: country.value,
        sortBy: sortBy.value,
        sortDirection: sortDirection.value,
      })

      buyers.value = [...buyers.value, ...result.data]
      currentPage.value = nextPage
      totalItems.value = result.total
      totalPages.value = result.totalPages
      hasMoreBuyers.value = currentPage.value < totalPages.value
    }
    catch (err) {
      buyersError.value = err
    }
    finally {
      loadingBuyers.value = false
    }
  }

  /**
   * Membuat pembeli baru dan memuat ulang daftar.
   */
  const createBuyer = async (buyerData) => {
    loadingBuyers.value = true
    try {
      const newBuyer = await dataService.create('buyers', buyerData)
      await fetchStats()
      await fetchBuyers()
      return newBuyer
    }
    catch (err) {
      buyersError.value = err
      throw err
    }
    finally {
      loadingBuyers.value = false
    }
  }

  /**
   * Memperbarui pembeli yang sudah ada.
   */
  const updateBuyer = async (id, updates) => {
    loadingBuyers.value = true
    try {
      const updated = await dataService.update('buyers', id, updates)
      await fetchStats()
      await fetchBuyers()
      return updated
    }
    catch (err) {
      buyersError.value = err
      throw err
    }
    finally {
      loadingBuyers.value = false
    }
  }

  /**
   * Menghapus pembeli yang sudah ada.
   */
  const deleteBuyer = async (id) => {
    loadingBuyers.value = true
    try {
      const deleted = await dataService.delete('buyers', id)
      await fetchStats()
      await fetchBuyers()
      return deleted
    }
    catch (err) {
      buyersError.value = err
      throw err
    }
    finally {
      loadingBuyers.value = false
    }
  }

  /**
   * Menghapus beberapa buyers berdasarkan ID.
   */
  const deleteManyBuyers = async (ids) => {
    loadingBuyers.value = true
    try {
      const result = await dataService.deleteMany('buyers', ids)
      if (result.success) {
        await fetchStats()
        await fetchBuyers()
      }
      return result
    }
    catch (err) {
      buyersError.value = err
      throw err
    }
    finally {
      loadingBuyers.value = false
    }
  }

  // Metode untuk memilih dan menghapus pilihan
  const selectBuyer = (buyer) => {
    selectedBuyer.value = buyer
  }

  const isAllSelected = computed(
    () => buyers.value.length > 0 && buyers.value.every(b => selectedIds.value.includes(b.id)),
  )

  function toggleSelectAll() {
    if (isAllSelected.value) {
      selectedIds.value = []
    }
    else {
      selectedIds.value = buyers.value.map(b => b.id)
    }
  }

  function toggleRowSelect(id) {
    if (selectedIds.value.includes(id)) {
      selectedIds.value = selectedIds.value.filter(i => i !== id)
    }
    else {
      selectedIds.value.push(id)
    }
  }

  // Mengembalikan semua state dan actions yang diperlukan
  return {
    // Pembeli
    buyers,
    loadingBuyers,
    buyersError,
    // Pagination
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    hasMoreBuyers,
    // Filter dan Sorting
    query,
    status,
    country,
    sortBy,
    sortDirection,
    // Item yang dipilih
    selectedBuyer,
    // Statistik
    countries,
    totalBuyers,
    activeBuyers,
    inactiveBuyers,
    loadingStats,
    statsError,
    // Actions
    fetchBuyers,
    fetchStats,
    loadMoreBuyers,
    createBuyer,
    updateBuyer,
    deleteBuyer,
    deleteManyBuyers,
    selectBuyer,

    // select and deselect
    selectedIds,
    isAllSelected,
    toggleSelectAll,
    toggleRowSelect,
  }
})
