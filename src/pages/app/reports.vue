<script setup>
import {
  BarChart3,
  Building,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  Package,
  PieChart,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBuyerStore } from '@/stores/buyer'
import { useDecorationStore } from '@/stores/decoration'
import { useFactoryStore } from '@/stores/factory'
import { useOrderStore } from '@/stores/order'
import { useProductStore } from '@/stores/product'
import { useReportStore } from '@/stores/report'

// Stores
const reportStore = useReportStore()
const buyerStore = useBuyerStore()
const factoryStore = useFactoryStore()
const orderStore = useOrderStore()
const productStore = useProductStore()
const decorationStore = useDecorationStore()

// Reactive data
const loading = ref(false)
const loadingMessage = ref('')
const viewDialogOpen = ref(false)
const selectedReport = ref(null)
const generatedReports = ref([])

// Computed
const dashboardStats = computed(() => reportStore.dashboardStats)

// Methods
function formatNumber(num) {
  return new Intl.NumberFormat().format(num)
}

function formatDateTime(dateTime) {
  return new Date(dateTime).toLocaleString()
}

async function generateReport(reportType) {
  loading.value = true
  loadingMessage.value = `Generating ${reportType.replace('_', ' ')} report...`

  try {
    const report = await reportStore.generateReport(reportType)

    // Add to generated reports list
    generatedReports.value.unshift({
      id: Date.now(),
      ...report,
    })

    // Auto-view the generated report
    selectedReport.value = report
    viewDialogOpen.value = true
  }
  catch (error) {
    console.error('Error generating report:', error)
  }
  finally {
    loading.value = false
    loadingMessage.value = ''
  }
}

async function exportReport(report) {
  loading.value = true
  loadingMessage.value = 'Exporting report to Excel...'

  try {
    const result = await reportStore.exportReport(report, 'xlsx')

    if (result.success) {
      // In a real app, this would trigger a download
      console.warn('Export successful:', result.fileName)
    }
  }
  catch (error) {
    console.error('Error exporting report:', error)
  }
  finally {
    loading.value = false
    loadingMessage.value = ''
  }
}

function viewReport(report) {
  selectedReport.value = report
  viewDialogOpen.value = true
}

async function exportAllReports() {
  loading.value = true
  loadingMessage.value = 'Exporting all reports...'

  try {
    const reportTypes = [
      'dashboard',
      'sales_by_buyer',
      'production_by_factory',
      'product_performance',
      'monthly_trend',
      'category_analysis',
      'cmt_status',
    ]

    for (const reportType of reportTypes) {
      const report = await reportStore.generateReport(reportType)
      await reportStore.exportReport(report, 'xlsx')
    }

    console.warn('All reports exported successfully')
  }
  catch (error) {
    console.error('Error exporting all reports:', error)
  }
  finally {
    loading.value = false
    loadingMessage.value = ''
  }
}

async function refreshAllData() {
  loading.value = true
  loadingMessage.value = 'Refreshing all data...'

  try {
    await Promise.all([
      buyerStore.fetchBuyers(),
      factoryStore.fetchFactories(),
      orderStore.fetchOrders(),
      productStore.fetchProducts(),
      decorationStore.fetchDecorations(),
    ])
  }
  catch (error) {
    console.error('Error refreshing data:', error)
  }
  finally {
    loading.value = false
    loadingMessage.value = ''
  }
}

// Initialize
onMounted(async () => {
  await refreshAllData()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Reports & Analytics
        </h1>
        <p class="text-muted-foreground">
          Generate comprehensive business reports and analytics.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="refreshAllData">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
        <Button size="sm" @click="exportAllReports">
          <Download class="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>
    </div>

    <!-- Quick Stats Overview -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Revenue
          </CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            ${{ formatNumber(dashboardStats.totalOrderAmount) }}
          </div>
          <p class="text-xs text-muted-foreground">
            From {{ dashboardStats.totalOrders }} orders
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Active Buyers
          </CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ dashboardStats.totalBuyers }}
          </div>
          <p class="text-xs text-muted-foreground">
            Across {{ dashboardStats.totalFactories }} factories
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Products
          </CardTitle>
          <Package class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ dashboardStats.totalProducts }}
          </div>
          <p class="text-xs text-muted-foreground">
            In catalog
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            In Production
          </CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ dashboardStats.inProductionOrders }}
          </div>
          <p class="text-xs text-muted-foreground">
            Active orders
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Report Categories -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Sales Reports -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <BarChart3 class="h-5 w-5" />
            <span>Sales Reports</span>
          </CardTitle>
          <CardDescription>Revenue and sales performance analytics</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-3">
            <Button
              variant="outline"
              class="w-full justify-start"
              :disabled="loading"
              @click="generateReport('sales_by_buyer')"
            >
              <Users class="h-4 w-4 mr-2" />
              Sales by Buyer
            </Button>
            <Button
              variant="outline"
              class="w-full justify-start"
              :disabled="loading"
              @click="generateReport('monthly_trend')"
            >
              <TrendingUp class="h-4 w-4 mr-2" />
              Monthly Sales Trend
            </Button>
            <Button
              variant="outline"
              class="w-full justify-start"
              :disabled="loading"
              @click="generateReport('category_analysis')"
            >
              <PieChart class="h-4 w-4 mr-2" />
              Category Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Production Reports -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <Building class="h-5 w-5" />
            <span>Production Reports</span>
          </CardTitle>
          <CardDescription>Factory performance and capacity analytics</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-3">
            <Button
              variant="outline"
              class="w-full justify-start"
              :disabled="loading"
              @click="generateReport('production_by_factory')"
            >
              <Building class="h-4 w-4 mr-2" />
              Production by Factory
            </Button>
            <Button
              variant="outline"
              class="w-full justify-start"
              :disabled="loading"
              @click="generateReport('cmt_status')"
            >
              <Settings class="h-4 w-4 mr-2" />
              CMT Status Overview
            </Button>
            <Button
              variant="outline"
              class="w-full justify-start"
              :disabled="loading"
              @click="generateReport('product_performance')"
            >
              <Package class="h-4 w-4 mr-2" />
              Product Performance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Reports -->
    <Card>
      <CardHeader>
        <CardTitle>Generated Reports</CardTitle>
        <CardDescription>Recent report generations and exports</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="generatedReports.length === 0" class="text-center py-8">
          <FileText class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-lg font-semibold mb-2">
            No reports generated yet
          </h3>
          <p class="text-muted-foreground">
            Generate your first report using the options above
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="report in generatedReports"
            :key="report.id"
            class="flex items-center justify-between p-4 border rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <FileText class="h-8 w-8 text-primary" />
              <div>
                <h4 class="font-semibold capitalize">
                  {{ report.type.replace('_', ' ') }} Report
                </h4>
                <p class="text-sm text-muted-foreground">
                  Generated on {{ formatDateTime(report.generated_at) }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ report.total_records }} records
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Button variant="outline" size="sm" @click="viewReport(report)">
                <Eye class="h-4 w-4 mr-2" />
                View
              </Button>
              <Button variant="outline" size="sm" @click="exportReport(report)">
                <Download class="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-80">
        <CardContent class="p-6">
          <div class="flex items-center space-x-3">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <div>
              <p class="font-semibold">
                Generating Report
              </p>
              <p class="text-sm text-muted-foreground">
                {{ loadingMessage }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Report View Dialog -->
    <Dialog :open="viewDialogOpen" @update:open="viewDialogOpen = $event">
      <DialogContent class="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle v-if="selectedReport">
            {{ selectedReport.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }} Report
          </DialogTitle>
          <DialogDescription v-if="selectedReport">
            Generated on {{ formatDateTime(selectedReport.generated_at) }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedReport" class="space-y-6">
          <!-- Sales by Buyer Report -->
          <div v-if="selectedReport.type === 'sales_by_buyer'">
            <div class="space-y-4">
              <div
                v-for="buyer in selectedReport.data"
                :key="buyer.buyer_code"
                class="p-4 border rounded-lg"
              >
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold">
                    {{ buyer.buyer_name }}
                  </h4>
                  <Badge>{{ buyer.buyer_code }}</Badge>
                </div>
                <div class="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p class="text-muted-foreground">
                      Total Orders
                    </p>
                    <p class="font-bold">
                      {{ buyer.total_orders }}
                    </p>
                  </div>
                  <div>
                    <p class="text-muted-foreground">
                      Total Quantity
                    </p>
                    <p class="font-bold">
                      {{ formatNumber(buyer.total_quantity) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-muted-foreground">
                      Total Amount
                    </p>
                    <p class="font-bold">
                      ${{ formatNumber(buyer.total_amount) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Production by Factory Report -->
          <div v-else-if="selectedReport.type === 'production_by_factory'">
            <div class="space-y-4">
              <div
                v-for="factory in selectedReport.data"
                :key="factory.factory_code"
                class="p-4 border rounded-lg"
              >
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold">
                    {{ factory.factory_name }}
                  </h4>
                  <Badge>{{ factory.factory_code }}</Badge>
                </div>
                <div class="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p class="text-muted-foreground">
                      Total Orders
                    </p>
                    <p class="font-bold">
                      {{ factory.total_orders }}
                    </p>
                  </div>
                  <div>
                    <p class="text-muted-foreground">
                      Total Quantity
                    </p>
                    <p class="font-bold">
                      {{ formatNumber(factory.total_quantity) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-muted-foreground">
                      Total Value
                    </p>
                    <p class="font-bold">
                      ${{ formatNumber(factory.total_amount) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-muted-foreground">
                      Capacity Util.
                    </p>
                    <p class="font-bold">
                      {{ factory.capacity_utilization.toFixed(1) }}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Generic JSON Data Display -->
          <div v-else>
            <pre class="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">{{ JSON.stringify(selectedReport.data, null, 2) }}</pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
