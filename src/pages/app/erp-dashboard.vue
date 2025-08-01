<script setup>
import {
  Building,
  DollarSign,
  Download,
  RefreshCw,
  ShoppingCart,
  Users,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBuyerStore } from '@/stores/buyer'
import { useFactoryStore } from '@/stores/factory'
import { useOrderStore } from '@/stores/order'
import { useReportStore } from '@/stores/report'

// Stores
const buyerStore = useBuyerStore()
const factoryStore = useFactoryStore()
const orderStore = useOrderStore()
const reportStore = useReportStore()

// Reactive data
const loading = ref(false)

// Computed properties
const stats = computed(() => reportStore.dashboardStats)
const orderStatusData = computed(() => reportStore.orderStatusDistribution)
const topBuyers = computed(() => reportStore.topPerformers.topBuyers)
const topProducts = computed(() => reportStore.topPerformers.topProducts)
const cmtStatus = computed(() => reportStore.cmtStatusReport)

const recentOrders = computed(() => {
  return orderStore.orders
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
})

// Methods
function formatNumber(num) {
  return new Intl.NumberFormat().format(num)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-500',
    in_progress: 'bg-orange-500',
    in_production: 'bg-purple-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
  }
  return colors[status] || 'bg-gray-500'
}

function getBuyerName(buyerId) {
  const buyer = buyerStore.getBuyerById(buyerId)
  return buyer ? buyer.name : 'Unknown Buyer'
}

function getTotalOrders(stage) {
  return stage.pending + stage.in_progress + stage.completed
}

function getCompletionPercentage(stage) {
  const total = getTotalOrders(stage)
  return total > 0 ? (stage.completed / total) * 100 : 0
}

async function refreshData() {
  loading.value = true
  try {
    await Promise.all([
      buyerStore.fetchBuyers(),
      factoryStore.fetchFactories(),
      orderStore.fetchOrders(),
    ])
  }
  catch (error) {
    console.error('Error refreshing data:', error)
  }
  finally {
    loading.value = false
  }
}

async function exportDashboard() {
  try {
    const report = await reportStore.generateReport('dashboard')
    await reportStore.exportReport(report, 'xlsx')
  }
  catch (error) {
    console.error('Error exporting dashboard:', error)
  }
}

// Initialize data
onMounted(async () => {
  await refreshData()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p class="text-muted-foreground">
          Welcome back! Here's what's happening with your ERP system.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="refreshData">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" @click="exportDashboard">
          <Download class="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span class="text-sm text-muted-foreground">Loading dashboard data...</span>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-6">
      <!-- Quick Stats Cards -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">
              Total Orders
            </CardTitle>
            <ShoppingCart class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ formatNumber(stats.totalOrders) }}
            </div>
            <p class="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              ${{ formatNumber(stats.totalOrderAmount) }}
            </div>
            <p class="text-xs text-muted-foreground">
              +8% from last month
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
              {{ formatNumber(stats.totalBuyers) }}
            </div>
            <p class="text-xs text-muted-foreground">
              +2 new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">
              Factories
            </CardTitle>
            <Building class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ formatNumber(stats.totalFactories) }}
            </div>
            <p class="text-xs text-muted-foreground">
              {{ factoryStore.averageEfficiency.toFixed(1) }}% avg efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Order Status Chart -->
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Current status of all orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="status in orderStatusData" :key="status.status" class="flex items-center">
                <div class="flex items-center space-x-2 flex-1">
                  <div :class="getStatusColor(status.status)" class="w-3 h-3 rounded-full"></div>
                  <span class="text-sm font-medium capitalize">{{ status.status.replace('_', ' ') }}</span>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold">
                    {{ status.count }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ status.percentage.toFixed(1) }}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Recent Orders -->
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from buyers</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                class="flex items-center justify-between p-3 rounded-lg border"
              >
                <div class="flex items-center space-x-3">
                  <div :class="getStatusColor(order.status)" class="w-2 h-2 rounded-full"></div>
                  <div>
                    <p class="text-sm font-medium">
                      {{ order.order_number }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ getBuyerName(order.buyer_id) }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold">
                    ${{ formatNumber(order.amount) }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatDate(order.order_date) }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Top Buyers -->
        <Card>
          <CardHeader>
            <CardTitle>Top Buyers</CardTitle>
            <CardDescription>By total order value</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="(buyer, index) in topBuyers"
                :key="buyer.buyer_code"
                class="flex items-center space-x-3"
              >
                <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span class="text-xs font-bold">{{ index + 1 }}</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">
                    {{ buyer.buyer_name }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ buyer.total_orders }} orders
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold">
                    ${{ formatNumber(buyer.total_amount) }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Top Products -->
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>By quantity ordered</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="(product, index) in topProducts"
                :key="product.style_no"
                class="flex items-center space-x-3"
              >
                <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span class="text-xs font-bold">{{ index + 1 }}</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">
                    {{ product.style_no }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ product.category }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold">
                    {{ formatNumber(product.total_quantity) }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Production Status -->
        <Card>
          <CardHeader>
            <CardTitle>Production Status</CardTitle>
            <CardDescription>CMT process overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div v-for="(stage, key) in cmtStatus" :key="key" class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium capitalize">{{ key.replace('_', ' ') }}</span>
                  <span class="text-xs text-muted-foreground">
                    {{ stage.completed }}/{{ getTotalOrders(stage) }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-primary h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${getCompletionPercentage(stage)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
