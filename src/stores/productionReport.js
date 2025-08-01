import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import dataService from '@/data/dataService'

export const useProductionReportStore = defineStore('productionReport', () => {
  const hourlyOutputReports = ref([])
  const hourlyProductionReports = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed for Hourly Output
  const outputByDate = computed(() => {
    const grouped = {}
    hourlyOutputReports.value.forEach((report) => {
      if (!grouped[report.date]) {
        grouped[report.date] = { day: null, night: null }
      }
      grouped[report.date][report.shift] = report
    })
    return grouped
  })

  const outputStatistics = computed(() => {
    const reports = hourlyOutputReports.value
    const dayShifts = reports.filter(r => r.shift === 'day')
    const nightShifts = reports.filter(r => r.shift === 'night')

    return {
      totalOutput: reports.reduce((sum, r) => sum + (r.dailyOutput || 0), 0),
      totalAmount: reports.reduce((sum, r) => sum + (r.dailyAmount || 0), 0),
      totalTarget: reports.reduce((sum, r) => sum + (r.target || 0), 0),
      averageOutput: reports.length > 0 ? (reports.reduce((sum, r) => sum + (r.dailyOutput || 0), 0) / reports.length).toFixed(0) : 0,
      efficiencyRate: reports.length > 0
        ? ((reports.reduce((sum, r) => sum + (r.dailyOutput || 0), 0) / reports.reduce((sum, r) => sum + (r.target || 0), 1)) * 100).toFixed(1)
        : 0,
      dayShift: {
        totalOutput: dayShifts.reduce((sum, r) => sum + (r.dailyOutput || 0), 0),
        totalAmount: dayShifts.reduce((sum, r) => sum + (r.dailyAmount || 0), 0),
        averageOutput: dayShifts.length > 0 ? (dayShifts.reduce((sum, r) => sum + (r.dailyOutput || 0), 0) / dayShifts.length).toFixed(0) : 0,
      },
      nightShift: {
        totalOutput: nightShifts.reduce((sum, r) => sum + (r.dailyOutput || 0), 0),
        totalAmount: nightShifts.reduce((sum, r) => sum + (r.dailyAmount || 0), 0),
        averageOutput: nightShifts.length > 0 ? (nightShifts.reduce((sum, r) => sum + (r.dailyOutput || 0), 0) / nightShifts.length).toFixed(0) : 0,
      },
    }
  })

  // Computed for Hourly Production
  const productionByTeam = computed(() => {
    const grouped = {}
    hourlyProductionReports.value.forEach((production) => {
      if (!grouped[production.team]) {
        grouped[production.team] = []
      }
      grouped[production.team].push(production)
    })
    return grouped
  })

  const productionStatistics = computed(() => {
    const productions = hourlyProductionReports.value
    return {
      totalTeams: productions.length,
      totalOutput: productions.reduce((sum, p) => sum + (p.total?.output || 0), 0),
      totalAmount: productions.reduce((sum, p) => sum + (p.total?.amount || 0), 0),
      teams: [...new Set(productions.map(p => p.team))],
      styles: [...new Set(productions.map(p => p.style))],
      colors: [...new Set(productions.map(p => p.color))],
      averageTeamOutput: productions.length > 0
        ? (productions.reduce((sum, p) => sum + (p.total?.output || 0), 0) / productions.length).toFixed(0)
        : 0,
    }
  })

  // Actions
  const fetchHourlyOutputReports = async () => {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      hourlyOutputReports.value = dataService.getHourlyOutputReport()
    }
    catch (err) {
      error.value = 'Failed to fetch hourly output reports'
      console.error('Error fetching hourly output reports:', err)
    }
    finally {
      loading.value = false
    }
  }

  const fetchHourlyProductionReports = async () => {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      hourlyProductionReports.value = dataService.getHourlyProduction()
    }
    catch (err) {
      error.value = 'Failed to fetch hourly production reports'
      console.error('Error fetching hourly production reports:', err)
    }
    finally {
      loading.value = false
    }
  }

  const fetchAllReports = async () => {
    await Promise.all([
      fetchHourlyOutputReports(),
      fetchHourlyProductionReports(),
    ])
  }

  const createHourlyOutputReport = async (reportData) => {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      const newReport = dataService.createHourlyOutputReport(reportData)
      hourlyOutputReports.value.push(newReport)
      return newReport
    }
    catch (err) {
      error.value = 'Failed to create hourly output report'
      console.error('Error creating hourly output report:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const updateHourlyOutputReport = async (id, reportData) => {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      const updatedReport = dataService.updateHourlyOutputReport(id, reportData)
      if (updatedReport) {
        const index = hourlyOutputReports.value.findIndex(report => report.id === id)
        if (index !== -1) {
          hourlyOutputReports.value[index] = updatedReport
        }
        return updatedReport
      }
      else {
        throw new Error('Hourly output report not found')
      }
    }
    catch (err) {
      error.value = 'Failed to update hourly output report'
      console.error('Error updating hourly output report:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const createHourlyProductionReport = async (productionData) => {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      const newProduction = dataService.createHourlyProduction(productionData)
      hourlyProductionReports.value.push(newProduction)
      return newProduction
    }
    catch (err) {
      error.value = 'Failed to create hourly production report'
      console.error('Error creating hourly production report:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const updateHourlyProductionReport = async (id, productionData) => {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      const updatedProduction = dataService.updateHourlyProduction(id, productionData)
      if (updatedProduction) {
        const index = hourlyProductionReports.value.findIndex(production => production.id === id)
        if (index !== -1) {
          hourlyProductionReports.value[index] = updatedProduction
        }
        return updatedProduction
      }
      else {
        throw new Error('Hourly production report not found')
      }
    }
    catch (err) {
      error.value = 'Failed to update hourly production report'
      console.error('Error updating hourly production report:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const getOutputByDateRange = (startDate, endDate) => {
    return hourlyOutputReports.value.filter(report =>
      report.date >= startDate && report.date <= endDate,
    )
  }

  const getOutputByShift = (shift) => {
    return hourlyOutputReports.value.filter(report => report.shift === shift)
  }

  const getProductionByTeam = (team) => {
    return hourlyProductionReports.value.filter(production => production.team === team)
  }

  const getProductionByStyle = (style) => {
    return hourlyProductionReports.value.filter(production => production.style === style)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    hourlyOutputReports,
    hourlyProductionReports,
    loading,
    error,

    // Computed
    outputByDate,
    outputStatistics,
    productionByTeam,
    productionStatistics,

    // Actions
    fetchHourlyOutputReports,
    fetchHourlyProductionReports,
    fetchAllReports,
    createHourlyOutputReport,
    updateHourlyOutputReport,
    createHourlyProductionReport,
    updateHourlyProductionReport,
    getOutputByDateRange,
    getOutputByShift,
    getProductionByTeam,
    getProductionByStyle,
    clearError,
  }
})
