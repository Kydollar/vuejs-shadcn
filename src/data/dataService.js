// Data Service untuk mengelola semua data JSON
import { v4 as uuidv4 } from 'uuid'
import buyersData from './master-data/buyers.json'

// Helper function untuk simulasi latency API
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// Helper function untuk mengakses properti nested pada objek
function getNestedProperty(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

class DataService {
  constructor() {
    this.data = {
      buyers: [...buyersData],
    }
    this.loadFromLocalStorage()
  }

  // ============ GENERIC CRUD OPERATIONS ============

  // Get all items from a collection
  getAll(collection) {
    return [...this.data[collection]]
  }

  // Get item by ID
  async getById(collection, id) {
    await delay(200) // Simulate network delay
    return this.data[collection].find(item => item.id === id)
  }

  // Create new item
  async create(collection, item) {
    await delay(500) // Simulate network delay
    // Menggunakan UUID untuk ID, lebih robust daripada Math.max
    const newId = uuidv4()
    const newItem = {
      ...item,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.data[collection].push(newItem)
    this.saveToLocalStorage()
    return newItem
  }

  // Update existing item
  async update(collection, id, updates) {
    await delay(500) // Simulate network delay
    const index = this.data[collection].findIndex(item => item.id === id)
    if (index === -1)
      return null

    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.saveToLocalStorage()
    return this.data[collection][index]
  }

  // Delete item
  async delete(collection, id) {
    await delay(500) // Simulate network delay
    const initialLength = this.data[collection].length
    this.data[collection] = this.data[collection].filter(item => item.id !== id)
    this.saveToLocalStorage()
    return this.data[collection].length < initialLength
  }

  // Bulk delete items by array of IDs
  async deleteMany(collection, ids) {
    await delay(500) // Simulate network delay
    const initialLength = this.data[collection].length

    this.data[collection] = this.data[collection].filter(item => !ids.includes(item.id))
    this.saveToLocalStorage()

    const deletedCount = initialLength - this.data[collection].length
    return {
      success: deletedCount > 0,
      deletedCount,
    }
  }

  // ============ BUYERS SPECIFIC METHODS ============

  /**
   * Mengambil data buyers dengan dukungan filter, sort, dan pagination.
   * @param {object} params - Objek parameter untuk query.
   * @param {number} params.page - Nomor halaman.
   * @param {number} params.pageSize - Jumlah item per halaman.
   * @param {string} params.query - Keyword pencarian.
   * @param {string} params.status - Filter berdasarkan status ('active'/'inactive'/'all').
   * @param {string} params.country - Filter berdasarkan negara.
   * @param {string} params.sortBy - Kolom untuk sorting.
   * @param {string} params.sortDirection - Arah sorting ('asc'/'desc').
   */
  async getBuyers({
    page = 1,
    pageSize = 10,
    query = '',
    status = 'all',
    country = 'all',
    sortBy = 'createdAt',
    sortDirection = 'desc',
  } = {}) {
    await delay(300) // Simulasi latency API

    let result = [...this.data.buyers]

    // Filter
    if (status !== 'all')
      result = result.filter(b => b.status === status)

    if (country !== 'all')
      result = result.filter(b => b.country === country)

    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        b =>
          b.buyerName.toLowerCase().includes(q)
          || b.contactPerson.toLowerCase().includes(q)
          || b.email.toLowerCase().includes(q)
          || b.country.toLowerCase().includes(q),
      )
    }

    // Sort
    result.sort((a, b) => {
      const aVal = getNestedProperty(a, sortBy)
      const bVal = getNestedProperty(b, sortBy)

      if (aVal < bVal)
        return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal)
        return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    // Pagination
    const total = result.length
    const totalPages = Math.ceil(total / pageSize)
    const paginated = result.slice((page - 1) * pageSize, page * pageSize)

    return {
      data: paginated,
      total,
      currentPage: page,
      pageSize,
      totalPages,
    }
  }

  getTotalBuyers() {
    return this.data.buyers.length
  }

  getActiveBuyersCount() {
    return this.data.buyers.filter(b => b.status === 'active').length
  }

  getInactiveBuyersCount() {
    return this.data.buyers.filter(b => b.status === 'inactive').length
  }

  getUniqueCountries() {
    return [...new Set(this.data.buyers.map(b => b.country))].sort()
  }

  createBuyer(buyerData) {
    const newBuyer = {
      id: uuidv4(),
      ...buyerData,
      createdAt: new Date().toISOString(),
    }
    this.data.buyers.push(newBuyer)
    return newBuyer
  }

  updateBuyer(id, updates) {
    const index = this.data.buyers.findIndex(b => b.id === id)
    if (index === -1)
      throw new Error('Buyer not found')

    const updatedBuyer = {
      ...this.data.buyers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.data.buyers[index] = updatedBuyer
    return updatedBuyer
  }

  deleteBuyer(id) {
    const index = this.data.buyers.findIndex(b => b.id === id)
    if (index === -1)
      throw new Error('Buyer not found')
    return this.data.buyers.splice(index, 1)[0]
  }

  deleteManyBuyers(ids) {
    const initialLength = this.data.buyers.length
    this.data.buyers = this.data.buyers.filter(b => !ids.includes(b.id))
    const deletedCount = initialLength - this.data.buyers.length
    return {
      success: deletedCount > 0,
      deletedCount,
    }
  }

  // ============ PERSISTENCE ============

  saveToLocalStorage() {
    try {
      localStorage.setItem('erp_data', JSON.stringify(this.data))
    }
    catch (error) {
      console.warn('Could not save to localStorage:', error)
    }
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('erp_data')
      if (saved) {
        const parsedData = JSON.parse(saved)
        // Merge with default data to ensure all collections exist
        this.data = {
          ...this.data,
          ...parsedData,
        }
      }
    }
    catch (error) {
      console.warn('Could not load from localStorage:', error)
    }
  }

  // Reset to default data
  resetData() {
    this.data = {
      buyers: [...buyersData],
    }
    this.saveToLocalStorage()
  }

  // Export data
  exportData() {
    return JSON.stringify(this.data, null, 2)
  }

  // Import data
  importData(jsonData) {
    try {
      const imported = JSON.parse(jsonData)
      this.data = imported
      this.saveToLocalStorage()
      return true
    }
    catch (error) {
      console.error('Invalid JSON data:', error)
      return false
    }
  }
}

// Create singleton instance
const dataService = new DataService()

export default dataService
