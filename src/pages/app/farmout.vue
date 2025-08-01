<script setup>
import {
  ArrowLeftCircle,
  Clock,
  Edit,
  Eye,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  Truck,
  Users,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const dialogOpen = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const vendorFilter = ref('all')
const statusFilter = ref('all')

// Form data
const formData = ref({
  order_id: '',
  vendor_id: '',
  size: '',
  quantity: '',
  unit_cost: '',
  farm_out_date: new Date().toISOString().split('T')[0],
  expected_return_date: '',
  process_type: '',
  priority: 'normal',
  instructions: '',
})

// Quick entry
const quickEntry = ref({
  order_id: '',
  vendor_id: '',
  size: '',
  quantity: '',
  expected_return_date: '',
})

// Constants
const garmentSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

// Mock data
const activeOrders = ref([
  { id: 1, order_number: 'ORD-001', product_name: 'Basic Tee - Red' },
  { id: 2, order_number: 'ORD-002', product_name: 'Premium Polo - Blue' },
  { id: 3, order_number: 'ORD-003', product_name: 'Hoodie - Black' },
])

const farmOutVendors = ref([
  { id: 1, name: 'PT Bordir Mandiri', specialization: 'Embroidery', initials: 'BM' },
  { id: 2, name: 'CV Sablon Jaya', specialization: 'Printing', initials: 'SJ' },
  { id: 3, name: 'UD Cuci Bersih', specialization: 'Washing', initials: 'CB' },
  { id: 4, name: 'PT Finishing Prima', specialization: 'Finishing', initials: 'FP' },
])

const farmOutEntries = ref([
  {
    id: 1,
    farm_out_date: '2025-07-30',
    order_id: 1,
    order_number: 'ORD-001',
    style_name: 'Basic Tee - Red',
    vendor_id: 1,
    vendor_name: 'PT Bordir Mandiri',
    size: 'M',
    quantity: 500,
    unit_cost: 2.50,
    expected_return_date: '2025-08-05',
    actual_return_date: null,
    status: 'in_progress',
    process_type: 'embroidery',
    priority: 'normal',
    instructions: 'Logo embroidery on left chest',
  },
  {
    id: 2,
    farm_out_date: '2025-07-31',
    order_id: 2,
    order_number: 'ORD-002',
    style_name: 'Premium Polo - Blue',
    vendor_id: 2,
    vendor_name: 'CV Sablon Jaya',
    size: 'L',
    quantity: 300,
    unit_cost: 1.75,
    expected_return_date: '2025-08-03',
    actual_return_date: '2025-08-02',
    status: 'completed',
    process_type: 'printing',
    priority: 'high',
    instructions: 'Screen print on back',
  },
  {
    id: 3,
    farm_out_date: '2025-08-01',
    order_id: 1,
    order_number: 'ORD-001',
    style_name: 'Basic Tee - Red',
    vendor_id: 3,
    vendor_name: 'UD Cuci Bersih',
    size: 'S',
    quantity: 200,
    unit_cost: 0.80,
    expected_return_date: '2025-08-04',
    actual_return_date: null,
    status: 'sent',
    process_type: 'washing',
    priority: 'normal',
    instructions: 'Stone wash treatment',
  },
])

// Computed properties
const todayFarmOut = computed(() => {
  return farmOutEntries.value
    .filter(entry => entry.farm_out_date === new Date().toISOString().split('T')[0])
    .reduce((sum, entry) => sum + entry.quantity, 0)
})

const expectedReturns = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return farmOutEntries.value
    .filter(entry => entry.expected_return_date === today && !entry.actual_return_date)
    .reduce((sum, entry) => sum + entry.quantity, 0)
})

const activeVendors = computed(() => {
  const activeVendorIds = new Set(
    farmOutEntries.value
      .filter(entry => ['sent', 'in_progress'].includes(entry.status))
      .map(entry => entry.vendor_id),
  )
  return farmOutVendors.value.filter(vendor => activeVendorIds.has(vendor.id))
})

const onTimeRate = computed(() => {
  const completedEntries = farmOutEntries.value.filter(entry => entry.status === 'completed')
  if (completedEntries.length === 0)
    return 100

  const onTimeEntries = completedEntries.filter(entry =>
    entry.actual_return_date && entry.actual_return_date <= entry.expected_return_date,
  )

  return Math.round((onTimeEntries.length / completedEntries.length) * 100)
})

const sizesSummary = computed(() => {
  const sizeCounts = garmentSizes.reduce((acc, size) => {
    acc[size] = 0
    return acc
  }, {})

  farmOutEntries.value
    .filter(entry => ['sent', 'in_progress'].includes(entry.status))
    .forEach((entry) => {
      sizeCounts[entry.size] += entry.quantity
    })

  const totalQty = Object.values(sizeCounts).reduce((sum, count) => sum + count, 0)

  return garmentSizes.map(size => ({
    size,
    total: sizeCounts[size],
    percentage: totalQty > 0 ? ((sizeCounts[size] / totalQty) * 100).toFixed(1) : '0.0',
  }))
})

const vendorPerformance = computed(() => {
  return farmOutVendors.value.map((vendor) => {
    const vendorEntries = farmOutEntries.value.filter(entry => entry.vendor_id === vendor.id)
    const completedEntries = vendorEntries.filter(entry => entry.status === 'completed')

    let onTimeRate = 100
    if (completedEntries.length > 0) {
      const onTimeEntries = completedEntries.filter(entry =>
        entry.actual_return_date && entry.actual_return_date <= entry.expected_return_date,
      )
      onTimeRate = Math.round((onTimeEntries.length / completedEntries.length) * 100)
    }

    return {
      ...vendor,
      total_orders: vendorEntries.length,
      on_time_rate: onTimeRate,
    }
  }).sort((a, b) => b.on_time_rate - a.on_time_rate)
})

const farmOutStatusSummary = computed(() => {
  const statusCounts = { sent: 0, in_progress: 0, completed: 0, returned: 0 }

  farmOutEntries.value.forEach((entry) => {
    statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1
  })

  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)

  return [
    { status: 'sent', label: 'Sent', count: statusCounts.sent, percentage: total > 0 ? ((statusCounts.sent / total) * 100).toFixed(1) : '0.0', color: 'bg-blue-500' },
    { status: 'in_progress', label: 'In Progress', count: statusCounts.in_progress, percentage: total > 0 ? ((statusCounts.in_progress / total) * 100).toFixed(1) : '0.0', color: 'bg-yellow-500' },
    { status: 'completed', label: 'Completed', count: statusCounts.completed, percentage: total > 0 ? ((statusCounts.completed / total) * 100).toFixed(1) : '0.0', color: 'bg-green-500' },
    { status: 'returned', label: 'Returned', count: statusCounts.returned, percentage: total > 0 ? ((statusCounts.returned / total) * 100).toFixed(1) : '0.0', color: 'bg-purple-500' },
  ]
})

const filteredEntries = computed(() => {
  let filtered = farmOutEntries.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(entry =>
      entry.order_number.toLowerCase().includes(query)
      || entry.style_name.toLowerCase().includes(query)
      || entry.vendor_name.toLowerCase().includes(query)
      || entry.size.toLowerCase().includes(query),
    )
  }

  if (vendorFilter.value !== 'all') {
    filtered = filtered.filter(entry => entry.vendor_id === Number.parseInt(vendorFilter.value))
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(entry => entry.status === statusFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.farm_out_date) - new Date(a.farm_out_date))
})

const canSaveEntry = computed(() => {
  return formData.value.order_id && formData.value.vendor_id
    && formData.value.size && formData.value.quantity
    && formData.value.farm_out_date && formData.value.expected_return_date
})

const canSaveQuickEntry = computed(() => {
  return quickEntry.value.order_id && quickEntry.value.vendor_id
    && quickEntry.value.size && quickEntry.value.quantity
    && quickEntry.value.expected_return_date
})

// Methods
function getStatusBadgeVariant(status) {
  const variants = {
    sent: 'secondary',
    in_progress: 'default',
    completed: 'default',
    returned: 'outline',
  }
  return variants[status] || 'secondary'
}

function isOverdue(entry) {
  if (entry.actual_return_date || entry.status === 'completed')
    return false
  const today = new Date().toISOString().split('T')[0]
  return entry.expected_return_date < today
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString()
}

function openAddDialog() {
  isEditing.value = false
  resetForm()
  dialogOpen.value = true
}

function resetForm() {
  formData.value = {
    order_id: '',
    vendor_id: '',
    size: '',
    quantity: '',
    unit_cost: '',
    farm_out_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    process_type: '',
    priority: 'normal',
    instructions: '',
  }
}

function saveEntry() {
  if (!canSaveEntry.value)
    return

  submitting.value = true

  setTimeout(() => {
    const order = activeOrders.value.find(o => o.id === Number.parseInt(formData.value.order_id))
    const vendor = farmOutVendors.value.find(v => v.id === Number.parseInt(formData.value.vendor_id))

    if (isEditing.value) {
      const index = farmOutEntries.value.findIndex(e => e.id === formData.value.id)
      if (index !== -1) {
        farmOutEntries.value[index] = {
          ...formData.value,
          order_number: order?.order_number || '',
          style_name: order?.product_name || '',
          vendor_name: vendor?.name || '',
        }
      }
    }
    else {
      farmOutEntries.value.push({
        id: Date.now(),
        ...formData.value,
        order_number: order?.order_number || '',
        style_name: order?.product_name || '',
        vendor_name: vendor?.name || '',
        actual_return_date: null,
        status: 'sent',
      })
    }

    submitting.value = false
    dialogOpen.value = false
    resetForm()
  }, 1000)
}

function saveQuickEntry() {
  if (!canSaveQuickEntry.value)
    return

  const order = activeOrders.value.find(o => o.id === Number.parseInt(quickEntry.value.order_id))
  const vendor = farmOutVendors.value.find(v => v.id === Number.parseInt(quickEntry.value.vendor_id))

  farmOutEntries.value.push({
    id: Date.now(),
    farm_out_date: new Date().toISOString().split('T')[0],
    order_id: Number.parseInt(quickEntry.value.order_id),
    order_number: order?.order_number || '',
    style_name: order?.product_name || '',
    vendor_id: Number.parseInt(quickEntry.value.vendor_id),
    vendor_name: vendor?.name || '',
    size: quickEntry.value.size,
    quantity: Number.parseInt(quickEntry.value.quantity),
    unit_cost: 0,
    expected_return_date: quickEntry.value.expected_return_date,
    actual_return_date: null,
    status: 'sent',
    process_type: vendor?.specialization.toLowerCase() || 'other',
    priority: 'normal',
    instructions: '',
  })

  // Reset quick entry
  quickEntry.value = {
    order_id: '',
    vendor_id: '',
    size: '',
    quantity: '',
    expected_return_date: '',
  }
}

function updateStatus(entry) {
  // Open dialog to update status
  isEditing.value = true
  formData.value = { ...entry }
  dialogOpen.value = true
}

function viewDetails(entry) {
  // eslint-disable-next-line no-alert
  alert(`Farm Out Details:\n\nOrder: ${entry.order_number}\nVendor: ${entry.vendor_name}\nSize: ${entry.size}\nQuantity: ${entry.quantity}\nStatus: ${entry.status}`)
}

function refreshData() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// Initialize
onMounted(() => {
  // Load data
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Farm Out Management
        </h1>
        <p class="text-muted-foreground">
          Input Farm-Out per Style dan per Size sesuai workflow ERP.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="refreshData">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" @click="openAddDialog">
          <Plus class="h-4 w-4 mr-2" />
          Add Farm Out
        </Button>
      </div>
    </div>

    <!-- Farm Out Summary Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Farm Out Today
          </CardTitle>
          <Truck class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-600">
            {{ todayFarmOut }}
          </div>
          <p class="text-xs text-muted-foreground">
            pieces sent out
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Expected Returns
          </CardTitle>
          <ArrowLeftCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">
            {{ expectedReturns }}
          </div>
          <p class="text-xs text-muted-foreground">
            pieces due back
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Active Vendors
          </CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-purple-600">
            {{ activeVendors.length }}
          </div>
          <p class="text-xs text-muted-foreground">
            vendors working
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            On Time Rate
          </CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600">
            {{ onTimeRate }}%
          </div>
          <p class="text-xs text-muted-foreground">
            delivery performance
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Farm Out Input -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <Package class="h-5 w-5" />
          <span>Quick Farm Out Entry</span>
        </CardTitle>
        <CardDescription>Input Farm-Out per Style dan per Size</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <Label>Style/Order</Label>
            <Select v-model="quickEntry.order_id">
              <SelectTrigger>
                <SelectValue placeholder="Select Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="order in activeOrders" :key="order.id" :value="order.id">
                  {{ order.order_number }} - {{ order.product_name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Vendor</Label>
            <Select v-model="quickEntry.vendor_id">
              <SelectTrigger>
                <SelectValue placeholder="Select Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="vendor in farmOutVendors" :key="vendor.id" :value="vendor.id">
                  {{ vendor.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Size</Label>
            <Select v-model="quickEntry.size">
              <SelectTrigger>
                <SelectValue placeholder="Select Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="size in garmentSizes" :key="size" :value="size">
                  {{ size }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Quantity</Label>
            <Input v-model="quickEntry.quantity" type="number" placeholder="0" />
          </div>

          <div>
            <Label>Expected Return</Label>
            <Input v-model="quickEntry.expected_return_date" type="date" />
          </div>

          <div class="flex items-end">
            <Button :disabled="!canSaveQuickEntry" class="w-full" @click="saveQuickEntry">
              <Save class="h-4 w-4 mr-2" />
              Send Out
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Size Distribution Summary -->
    <Card>
      <CardHeader>
        <CardTitle>Farm Out Summary by Size</CardTitle>
        <CardDescription>Current distribution of farm out quantities by garment size</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card v-for="size in sizesSummary" :key="size.size" class="border-2">
            <CardContent class="p-4 text-center">
              <p class="text-sm font-medium text-muted-foreground">
                {{ size.size }}
              </p>
              <p class="text-2xl font-bold text-blue-600">
                {{ size.total }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ size.percentage }}%
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Vendor Performance -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Top Performing Vendors -->
      <Card>
        <CardHeader>
          <CardTitle>Vendor Performance</CardTitle>
          <CardDescription>Top performing farm out vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="vendor in vendorPerformance" :key="vendor.id" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-xs font-bold text-blue-600">{{ vendor.initials }}</span>
                </div>
                <div>
                  <p class="font-medium">
                    {{ vendor.name }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ vendor.specialization }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold">
                  {{ vendor.on_time_rate }}%
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ vendor.total_orders }} orders
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Farm Out Status -->
      <Card>
        <CardHeader>
          <CardTitle>Farm Out Status</CardTitle>
          <CardDescription>Current status of farm out orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="status in farmOutStatusSummary" :key="status.status" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div :class="status.color" class="w-4 h-4 rounded"></div>
                <span class="font-medium">{{ status.label }}</span>
              </div>
              <div class="text-right">
                <div class="font-bold">
                  {{ status.count }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ status.percentage }}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Farm Out History -->
    <Card>
      <CardHeader>
        <CardTitle>Farm Out History</CardTitle>
        <CardDescription>Recent farm out transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- Search and Filter -->
          <div class="flex items-center space-x-2">
            <div class="relative flex-1">
              <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Search farm out entries..."
                class="pl-8"
              />
            </div>
            <Select v-model="vendorFilter">
              <SelectTrigger class="w-[200px]">
                <SelectValue placeholder="Filter by vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Vendors
                </SelectItem>
                <SelectItem v-for="vendor in farmOutVendors" :key="vendor.id" :value="vendor.id">
                  {{ vendor.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="statusFilter">
              <SelectTrigger class="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Status
                </SelectItem>
                <SelectItem value="sent">
                  Sent
                </SelectItem>
                <SelectItem value="in_progress">
                  In Progress
                </SelectItem>
                <SelectItem value="completed">
                  Completed
                </SelectItem>
                <SelectItem value="returned">
                  Returned
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Farm Out Entries Table -->
          <div class="border rounded-lg">
            <table class="w-full">
              <thead class="border-b bg-muted/50">
                <tr>
                  <th class="p-3 text-left font-medium">
                    Date Sent
                  </th>
                  <th class="p-3 text-left font-medium">
                    Order/Style
                  </th>
                  <th class="p-3 text-left font-medium">
                    Vendor
                  </th>
                  <th class="p-3 text-left font-medium">
                    Size
                  </th>
                  <th class="p-3 text-left font-medium">
                    Quantity
                  </th>
                  <th class="p-3 text-left font-medium">
                    Expected Return
                  </th>
                  <th class="p-3 text-left font-medium">
                    Status
                  </th>
                  <th class="p-3 text-left font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in filteredEntries" :key="entry.id" class="border-b hover:bg-muted/25">
                  <td class="p-3">
                    {{ formatDate(entry.farm_out_date) }}
                  </td>
                  <td class="p-3">
                    <div class="font-medium">
                      {{ entry.order_number }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ entry.style_name }}
                    </div>
                  </td>
                  <td class="p-3">
                    {{ entry.vendor_name }}
                  </td>
                  <td class="p-3">
                    <Badge variant="outline">
                      {{ entry.size }}
                    </Badge>
                  </td>
                  <td class="p-3 font-medium">
                    {{ entry.quantity }} pcs
                  </td>
                  <td class="p-3">
                    <div>{{ formatDate(entry.expected_return_date) }}</div>
                    <div v-if="isOverdue(entry)" class="text-xs text-red-600">
                      Overdue
                    </div>
                  </td>
                  <td class="p-3">
                    <Badge :variant="getStatusBadgeVariant(entry.status)">
                      {{ entry.status.replace('_', ' ') }}
                    </Badge>
                  </td>
                  <td class="p-3">
                    <div class="flex items-center space-x-2">
                      <Button variant="outline" size="sm" @click="updateStatus(entry)">
                        <Edit class="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" @click="viewDetails(entry)">
                        <Eye class="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Add/Edit Farm Out Dialog -->
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? 'Edit Farm Out Entry' : 'Add Farm Out Entry' }}
          </DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Update farm out entry information.' : 'Add new farm out entry per style dan per size.' }}
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Order/Style *</Label>
              <Select v-model="formData.order_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="order in activeOrders" :key="order.id" :value="order.id">
                    {{ order.order_number }} - {{ order.product_name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Vendor *</Label>
              <Select v-model="formData.vendor_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="vendor in farmOutVendors" :key="vendor.id" :value="vendor.id">
                    {{ vendor.name }} - {{ vendor.specialization }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <Label>Size *</Label>
              <Select v-model="formData.size">
                <SelectTrigger>
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="size in garmentSizes" :key="size" :value="size">
                    {{ size }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantity *</Label>
              <Input v-model="formData.quantity" type="number" placeholder="0" />
            </div>

            <div>
              <Label>Unit Cost</Label>
              <Input v-model="formData.unit_cost" type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Farm Out Date *</Label>
              <Input v-model="formData.farm_out_date" type="date" />
            </div>

            <div>
              <Label>Expected Return Date *</Label>
              <Input v-model="formData.expected_return_date" type="date" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Process Type</Label>
              <Select v-model="formData.process_type">
                <SelectTrigger>
                  <SelectValue placeholder="Select Process" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="embroidery">
                    Embroidery
                  </SelectItem>
                  <SelectItem value="printing">
                    Printing
                  </SelectItem>
                  <SelectItem value="washing">
                    Washing
                  </SelectItem>
                  <SelectItem value="finishing">
                    Finishing
                  </SelectItem>
                  <SelectItem value="other">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select v-model="formData.priority">
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    Low
                  </SelectItem>
                  <SelectItem value="normal">
                    Normal
                  </SelectItem>
                  <SelectItem value="high">
                    High
                  </SelectItem>
                  <SelectItem value="urgent">
                    Urgent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Special Instructions</Label>
            <Textarea v-model="formData.instructions" placeholder="Special instructions for the vendor..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="dialogOpen = false">
            Cancel
          </Button>
          <Button :disabled="!canSaveEntry || submitting" @click="saveEntry">
            <span v-if="submitting">Saving...</span>
            <span v-else>{{ isEditing ? 'Update' : 'Create' }} Entry</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
