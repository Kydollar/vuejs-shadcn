// Data Service untuk mengelola semua data JSON
import buyersData from './buyers.json'
import decorationsData from './decorations.json'
import factoriesData from './factories.json'
import hourlyOutputReportData from './hourlyOutputReport.json'
import hourlyProductionData from './hourlyProduction.json'
import orderRecapData from './orderRecap.json'
import ordersData from './orders.json'
import productsData from './products.json'

class DataService {
  constructor() {
    this.data = {
      buyers: [...buyersData],
      factories: [...factoriesData],
      products: [...productsData],
      orders: [...ordersData],
      decorations: [...decorationsData],
      orderRecap: [...orderRecapData],
      hourlyOutputReport: [...hourlyOutputReportData],
      hourlyProduction: [...hourlyProductionData],
    }
    this.loadFromLocalStorage()
  }

  // ============ GENERIC CRUD OPERATIONS ============

  // Get all items from a collection
  getAll(collection) {
    return [...this.data[collection]]
  }

  // Get item by ID
  getById(collection, id) {
    return this.data[collection].find(item => item.id === id)
  }

  // Create new item
  create(collection, item) {
    const newId = Math.max(...this.data[collection].map(i => i.id), 0) + 1
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
  update(collection, id, updates) {
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
  delete(collection, id) {
    const index = this.data[collection].findIndex(item => item.id === id)
    if (index === -1)
      return false

    this.data[collection].splice(index, 1)
    this.saveToLocalStorage()
    return true
  }

  // ============ BUYERS SPECIFIC METHODS ============

  getBuyers() {
    return this.getAll('buyers')
  }

  getActiveBuyers() {
    return this.data.buyers.filter(buyer => buyer.status === 'active')
  }

  createBuyer(buyerData) {
    return this.create('buyers', {
      ...buyerData,
      totalOrders: 0,
      totalValue: 0,
      rating: 0,
    })
  }

  updateBuyer(id, updates) {
    return this.update('buyers', id, updates)
  }

  deleteBuyer(id) {
    return this.delete('buyers', id)
  }

  searchBuyers(query) {
    const searchTerm = query.toLowerCase()
    return this.data.buyers.filter(buyer =>
      buyer.buyerName.toLowerCase().includes(searchTerm)
      || buyer.contactPerson.toLowerCase().includes(searchTerm)
      || buyer.email.toLowerCase().includes(searchTerm)
      || buyer.country.toLowerCase().includes(searchTerm),
    )
  }

  // ============ FACTORIES SPECIFIC METHODS ============

  getFactories() {
    return this.getAll('factories')
  }

  getActiveFactories() {
    return this.data.factories.filter(factory => factory.status === 'active')
  }

  createFactory(factoryData) {
    return this.create('factories', {
      ...factoryData,
      totalProduction: 0,
      onTimeDelivery: 100,
      qualityScore: 4.0,
      rating: 4.0,
    })
  }

  updateFactory(id, updates) {
    return this.update('factories', id, updates)
  }

  deleteFactory(id) {
    return this.delete('factories', id)
  }

  // ============ PRODUCTS SPECIFIC METHODS ============

  getProducts() {
    return this.getAll('products')
  }

  getActiveProducts() {
    return this.data.products.filter(product => product.status === 'active')
  }

  getProductsByCategory(category) {
    return this.data.products.filter(product => product.category === category)
  }

  createProduct(productData) {
    const productCode = this.generateProductCode(productData.category)
    return this.create('products', {
      ...productData,
      productCode,
      totalSold: 0,
      rating: 4.0,
    })
  }

  updateProduct(id, updates) {
    return this.update('products', id, updates)
  }

  deleteProduct(id) {
    return this.delete('products', id)
  }

  generateProductCode(category) {
    const prefix = category.substring(0, 3).toUpperCase()
    const count = this.data.products.filter(p => p.category === category).length + 1
    return `${prefix}-${String(count).padStart(3, '0')}`
  }

  // ============ ORDERS SPECIFIC METHODS ============

  getOrders() {
    return this.getAll('orders')
  }

  getOrdersByStatus(status) {
    return this.data.orders.filter(order => order.status === status)
  }

  getOrdersByBuyer(buyerId) {
    return this.data.orders.filter(order => order.buyerId === buyerId)
  }

  createOrder(orderData) {
    const orderNumber = this.generateOrderNumber()
    return this.create('orders', {
      ...orderData,
      orderNumber,
      paymentStatus: 'pending',
    })
  }

  updateOrder(id, updates) {
    return this.update('orders', id, updates)
  }

  deleteOrder(id) {
    return this.delete('orders', id)
  }

  generateOrderNumber() {
    const year = new Date().getFullYear()
    const count = this.data.orders.length + 1
    return `ORD-${year}-${String(count).padStart(3, '0')}`
  }

  // ============ DECORATIONS SPECIFIC METHODS ============

  getDecorations() {
    return this.getAll('decorations')
  }

  getActiveDecorations() {
    return this.data.decorations.filter(decoration => decoration.status === 'active')
  }

  getDecorationsByType(type) {
    return this.data.decorations.filter(decoration => decoration.decorationType === type)
  }

  createDecoration(decorationData) {
    return this.create('decorations', {
      ...decorationData,
      totalJobs: 0,
      rating: 4.0,
    })
  }

  updateDecoration(id, updates) {
    return this.update('decorations', id, updates)
  }

  deleteDecoration(id) {
    return this.delete('decorations', id)
  }

  // ============ ORDER RECAP SPECIFIC METHODS ============

  getOrderRecap() {
    return this.getAll('orderRecap')
  }

  getOrderRecapByBuyer(buyer) {
    return this.data.orderRecap.filter(recap => recap.buyer === buyer)
  }

  getOrderRecapByFactory(factory) {
    return this.data.orderRecap.filter(recap => recap.factory === factory)
  }

  createOrderRecap(recapData) {
    return this.create('orderRecap', recapData)
  }

  updateOrderRecap(id, updates) {
    return this.update('orderRecap', id, updates)
  }

  deleteOrderRecap(id) {
    return this.delete('orderRecap', id)
  }

  getOrderRecapStatistics() {
    const recaps = this.data.orderRecap
    return {
      totalOrders: recaps.length,
      totalQuantity: recaps.reduce((sum, r) => sum + r.orderQuantity, 0),
      totalAmount: recaps.reduce((sum, r) => sum + r.amount, 0),
      averagePrice: recaps.length > 0 ? recaps.reduce((sum, r) => sum + r.price, 0) / recaps.length : 0,
      buyers: [...new Set(recaps.map(r => r.buyer))].length,
      factories: [...new Set(recaps.map(r => r.factory))].length,
    }
  }

  // ============ HOURLY OUTPUT REPORT SPECIFIC METHODS ============

  getHourlyOutputReport() {
    return this.getAll('hourlyOutputReport')
  }

  getHourlyOutputByDate(date) {
    return this.data.hourlyOutputReport.filter(report => report.date === date)
  }

  getHourlyOutputByShift(shift) {
    return this.data.hourlyOutputReport.filter(report => report.shift === shift)
  }

  getHourlyOutputByDateRange(startDate, endDate) {
    return this.data.hourlyOutputReport.filter(report =>
      report.date >= startDate && report.date <= endDate,
    )
  }

  createHourlyOutputReport(reportData) {
    return this.create('hourlyOutputReport', reportData)
  }

  updateHourlyOutputReport(id, updates) {
    return this.update('hourlyOutputReport', id, updates)
  }

  deleteHourlyOutputReport(id) {
    return this.delete('hourlyOutputReport', id)
  }

  getHourlyOutputStatistics() {
    const reports = this.data.hourlyOutputReport
    const dayShifts = reports.filter(r => r.shift === 'day')
    const nightShifts = reports.filter(r => r.shift === 'night')

    return {
      totalOutput: reports.reduce((sum, r) => sum + r.dailyOutput, 0),
      totalAmount: reports.reduce((sum, r) => sum + r.dailyAmount, 0),
      averageOutput: reports.length > 0 ? reports.reduce((sum, r) => sum + r.dailyOutput, 0) / reports.length : 0,
      dayShift: {
        totalOutput: dayShifts.reduce((sum, r) => sum + r.dailyOutput, 0),
        totalAmount: dayShifts.reduce((sum, r) => sum + r.dailyAmount, 0),
        averageOutput: dayShifts.length > 0 ? dayShifts.reduce((sum, r) => sum + r.dailyOutput, 0) / dayShifts.length : 0,
      },
      nightShift: {
        totalOutput: nightShifts.reduce((sum, r) => sum + r.dailyOutput, 0),
        totalAmount: nightShifts.reduce((sum, r) => sum + r.dailyAmount, 0),
        averageOutput: nightShifts.length > 0 ? nightShifts.reduce((sum, r) => sum + r.dailyOutput, 0) / nightShifts.length : 0,
      },
    }
  }

  // ============ HOURLY PRODUCTION SPECIFIC METHODS ============

  getHourlyProduction() {
    return this.getAll('hourlyProduction')
  }

  getHourlyProductionByTeam(team) {
    return this.data.hourlyProduction.filter(production => production.team === team)
  }

  getHourlyProductionByStyle(style) {
    return this.data.hourlyProduction.filter(production => production.style === style)
  }

  createHourlyProduction(productionData) {
    return this.create('hourlyProduction', productionData)
  }

  updateHourlyProduction(id, updates) {
    return this.update('hourlyProduction', id, updates)
  }

  deleteHourlyProduction(id) {
    return this.delete('hourlyProduction', id)
  }

  getHourlyProductionStatistics() {
    const productions = this.data.hourlyProduction
    return {
      totalTeams: productions.length,
      totalOutput: productions.reduce((sum, p) => sum + p.total.output, 0),
      totalAmount: productions.reduce((sum, p) => sum + p.total.amount, 0),
      teams: [...new Set(productions.map(p => p.team))],
      styles: [...new Set(productions.map(p => p.style))],
      colors: [...new Set(productions.map(p => p.color))],
    }
  }

  // ============ STATISTICS & ANALYTICS ============

  getStatistics() {
    return {
      buyers: {
        total: this.data.buyers.length,
        active: this.data.buyers.filter(b => b.status === 'active').length,
        countries: [...new Set(this.data.buyers.map(b => b.country))].length,
      },
      factories: {
        total: this.data.factories.length,
        active: this.data.factories.filter(f => f.status === 'active').length,
        totalCapacity: this.data.factories.reduce((sum, f) => sum + f.capacity, 0),
      },
      products: {
        total: this.data.products.length,
        active: this.data.products.filter(p => p.status === 'active').length,
        categories: [...new Set(this.data.products.map(p => p.category))].length,
        totalStock: this.data.products.reduce((sum, p) => sum + p.stock, 0),
      },
      orders: {
        total: this.data.orders.length,
        pending: this.data.orders.filter(o => o.status === 'pending').length,
        inProduction: this.data.orders.filter(o => o.status === 'in_production').length,
        totalValue: this.data.orders.reduce((sum, o) => sum + o.totalAmount, 0),
      },
      decorations: {
        total: this.data.decorations.length,
        active: this.data.decorations.filter(d => d.status === 'active').length,
        types: [...new Set(this.data.decorations.map(d => d.decorationType))].length,
      },
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
      factories: [...factoriesData],
      products: [...productsData],
      orders: [...ordersData],
      decorations: [...decorationsData],
      orderRecap: [...orderRecapData],
      hourlyOutputReport: [...hourlyOutputReportData],
      hourlyProduction: [...hourlyProductionData],
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
