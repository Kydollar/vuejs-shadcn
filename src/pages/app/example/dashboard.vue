<script setup>
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Factory,
  Info,
  RefreshCw,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-vue-next'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useERPDashboardStore } from '@/stores/example/erp-dashboard'

useI18n()
const dashboardStore = useERPDashboardStore()

const loading = computed(() => dashboardStore.loading)

function getIcon(iconName) {
  const icons = {
    ShoppingCart,
    Users,
    Activity,
    CheckCircle,
    Factory,
    Truck,
  }
  return icons[iconName] || Activity
}

function getStatusVariant(status) {
  const variants = {
    pending: 'secondary',
    inProduction: 'default',
    qcCheck: 'outline',
    completed: 'success',
    shipped: 'success',
  }
  return variants[status] || 'secondary'
}

function getAlertClass(type) {
  const classes = {
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
  }
  return classes[type] || classes.info
}

function getAlertIcon(type) {
  const icons = {
    warning: AlertTriangle,
    info: Info,
    error: AlertCircle,
  }
  return icons[type] || Info
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString()
}

async function refreshDashboard() {
  await dashboardStore.refreshDashboard()
}

onMounted(async () => {
  await dashboardStore.initializeDashboard()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('dashboard.title') }}
        </h1>
        <p class="text-muted-foreground">
          {{ $t('dashboard.welcome') }}
        </p>
      </div>
      <Button :disabled="loading" variant="outline" @click="refreshDashboard">
        <RefreshCw :class="{ 'animate-spin': loading }" class="mr-2 h-4 w-4" />
        {{ $t('common.refresh') }}
      </Button>
    </div>

    <!-- Metrics Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="widget in dashboardStore.getWidgetsData" :key="widget.title">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            {{ widget.title }}
          </CardTitle>
          <component :is="getIcon(widget.icon)" class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ widget.value }}
          </div>
          <p class="text-xs text-muted-foreground">
            <span :class="widget.trend === 'up' ? 'text-green-600' : 'text-red-600'">
              {{ widget.change }}
            </span>
            from last month
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Charts and Recent Activity -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <!-- Orders Overview Chart -->
      <Card class="col-span-4">
        <CardHeader>
          <CardTitle>{{ $t('erp.orders.title') }} Overview</CardTitle>
        </CardHeader>
        <CardContent class="pl-2">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm">{{ $t('erp.orders.pending') }}</span>
              <span class="font-medium">{{ dashboardStore.ordersByStatus.pending }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">{{ $t('erp.orders.inProduction') }}</span>
              <span class="font-medium">{{ dashboardStore.ordersByStatus.inProduction }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">{{ $t('erp.orders.completed') }}</span>
              <span class="font-medium">{{ dashboardStore.ordersByStatus.completed }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">{{ $t('erp.orders.shipped') }}</span>
              <span class="font-medium">{{ dashboardStore.ordersByStatus.shipped }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Orders -->
      <Card class="col-span-3">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Latest order updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="order in dashboardStore.recentOrders"
              :key="order.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-4">
                <div class="flex-1 space-y-1">
                  <p class="text-sm font-medium leading-none">
                    {{ order.orderNumber }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {{ order.buyer }}
                  </p>
                </div>
              </div>
              <Badge :variant="getStatusVariant(order.status)">
                {{ $t(`erp.orders.${order.status}`) }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Production and Quality Metrics -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Production Metrics -->
      <Card>
        <CardHeader>
          <CardTitle>{{ $t('erp.production.title') }} Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm">{{ $t('dashboard.dailyOutput') }}</span>
              <span class="text-2xl font-bold">{{ dashboardStore.productionMetrics.dailyOutput }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm">{{ $t('dashboard.productionEfficiency') }}</span>
              <span class="text-2xl font-bold">{{ dashboardStore.productionMetrics.efficiency }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm">Active Lines</span>
              <span class="text-2xl font-bold">{{ dashboardStore.productionMetrics.activeLines }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Quality Metrics -->
      <Card>
        <CardHeader>
          <CardTitle>{{ $t('erp.qc.title') }} Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm">{{ $t('dashboard.qualityRate') }}</span>
              <span class="text-2xl font-bold">{{ dashboardStore.qualityMetrics.qualityRate }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm">Today's Inspections</span>
              <span class="text-2xl font-bold">{{ dashboardStore.qualityMetrics.todayInspections }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm">{{ $t('erp.qc.passed') }}</span>
              <span class="text-2xl font-bold text-green-600">{{ dashboardStore.qualityMetrics.passedInspections }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm">{{ $t('erp.qc.failed') }}</span>
              <span class="text-2xl font-bold text-red-600">{{ dashboardStore.qualityMetrics.failedInspections }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Alerts -->
    <Card v-if="dashboardStore.dashboardData.alerts?.length">
      <CardHeader>
        <CardTitle>System Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div
            v-for="alert in dashboardStore.dashboardData.alerts"
            :key="alert.id"
            class="flex items-center space-x-2 p-2 rounded-md"
            :class="getAlertClass(alert.type)"
          >
            <component :is="getAlertIcon(alert.type)" class="h-4 w-4" />
            <span class="text-sm">{{ alert.message }}</span>
            <span class="text-xs text-muted-foreground ml-auto">
              {{ formatTime(alert.timestamp) }}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
