<script setup>
import {
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart,
  Trash2,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useBuyerStore } from '@/stores/buyer'
import { useFactoryStore } from '@/stores/factory'
import { useOrderStore } from '@/stores/order'
import { useProductStore } from '@/stores/product'

// Stores
const buyerStore = useBuyerStore()
const factoryStore = useFactoryStore()
const orderStore = useOrderStore()
const productStore = useProductStore()

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const dialogOpen = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')

const formData = ref({
  buyer_id: null,
  factory_id: null,
  product_id: null,
  order_qty: '',
  price: '',
  priority: 'medium',
  order_date: '',
  delivery_date: '',
  remarks: '',
})

// Computed
const filteredOrders = computed(() => {
  let filtered = orderStore.orders

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order =>
      order.order_number.toLowerCase().includes(query)
      || order.remarks.toLowerCase().includes(query),
    )
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  // Filter by priority
  if (priorityFilter.value !== 'all') {
    filtered = filtered.filter(order => order.priority === priorityFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

// Methods
function formatNumber(num) {
  return new Intl.NumberFormat().format(num)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

function getStatusVariant(status) {
  const variants = {
    pending: 'secondary',
    confirmed: 'default',
    in_production: 'default',
    completed: 'default',
    cancelled: 'destructive',
  }
  return variants[status] || 'secondary'
}

function getPriorityVariant(priority) {
  const variants = {
    low: 'secondary',
    medium: 'default',
    high: 'destructive',
  }
  return variants[priority] || 'secondary'
}

function getCMTStatusColor(status) {
  const colors = {
    pending: 'bg-gray-400',
    in_progress: 'bg-yellow-500',
    completed: 'bg-green-500',
  }
  return colors[status] || 'bg-gray-400'
}

function getBuyerName(buyerId) {
  const buyer = buyerStore.getBuyerById(buyerId)
  return buyer ? buyer.name : 'Unknown'
}

function getFactoryName(factoryId) {
  const factory = factoryStore.getFactoryById(factoryId)
  return factory ? factory.name : 'Unknown'
}

function getProductName(productId) {
  const product = productStore.getProductById(productId)
  return product ? `${product.style_no} - ${product.name}` : 'Unknown'
}

function resetForm() {
  formData.value = {
    buyer_id: null,
    factory_id: null,
    product_id: null,
    order_qty: '',
    price: '',
    priority: 'medium',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    remarks: '',
  }
}

function openCreateDialog() {
  isEditing.value = false
  resetForm()
  dialogOpen.value = true
}

function editOrder(order) {
  isEditing.value = true
  formData.value = { ...order }
  dialogOpen.value = true
}

function viewOrder(order) {
  // TODO: Implement view order details
  // This would open a detailed view dialog
  console.warn('View order functionality not implemented yet:', order.order_number)
}

function updateCMTStatus(order) {
  // TODO: Implement CMT status update
  // This would open a CMT status update dialog
  console.warn('CMT status update functionality not implemented yet:', order.order_number)
}

async function deleteOrder(order) {
  // eslint-disable-next-line no-alert
  if (window.confirm(`Are you sure you want to delete order ${order.order_number}?`)) {
    try {
      await orderStore.deleteOrder(order.id)
    }
    catch (error) {
      console.error('Error deleting order:', error)
    }
  }
}

async function submitForm() {
  submitting.value = true
  try {
    if (isEditing.value) {
      await orderStore.updateOrder(formData.value.id, formData.value)
    }
    else {
      await orderStore.createOrder(formData.value)
    }
    dialogOpen.value = false
    resetForm()
  }
  catch (error) {
    console.error('Error saving order:', error)
  }
  finally {
    submitting.value = false
  }
}

async function fetchOrders() {
  loading.value = true
  try {
    await Promise.all([
      orderStore.fetchOrders(),
      buyerStore.fetchBuyers(),
      factoryStore.fetchFactories(),
      productStore.fetchProducts(),
    ])
  }
  catch (error) {
    console.error('Error fetching data:', error)
  }
  finally {
    loading.value = false
  }
}

// Initialize
onMounted(async () => {
  await fetchOrders()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Orders Management
        </h1>
        <p class="text-muted-foreground">
          Manage production orders and track their progress.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="fetchOrders">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" @click="openCreateDialog">
          <Plus class="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex-1 max-w-sm">
        <div class="relative">
          <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search orders..."
            class="pl-8"
          />
        </div>
      </div>
      <Select v-model="statusFilter">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All Status
          </SelectItem>
          <SelectItem value="pending">
            Pending
          </SelectItem>
          <SelectItem value="confirmed">
            Confirmed
          </SelectItem>
          <SelectItem value="in_production">
            In Production
          </SelectItem>
          <SelectItem value="completed">
            Completed
          </SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="priorityFilter">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Filter by priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All Priority
          </SelectItem>
          <SelectItem value="high">
            High
          </SelectItem>
          <SelectItem value="medium">
            Medium
          </SelectItem>
          <SelectItem value="low">
            Low
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Orders Stats -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Orders
          </CardTitle>
          <ShoppingCart class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ orderStore.totalOrders }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Value
          </CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            ${{ formatNumber(orderStore.totalAmount) }}
          </div>
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
            {{ orderStore.inProductionOrders.length }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Completed
          </CardTitle>
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ orderStore.completedOrders.length }}
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Orders Table -->
    <Card>
      <CardHeader>
        <CardTitle>Orders List</CardTitle>
        <CardDescription>Manage and track all production orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="flex items-center space-x-2">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span class="text-sm text-muted-foreground">Loading orders...</span>
          </div>
        </div>

        <div v-else-if="filteredOrders.length === 0" class="text-center py-8">
          <ShoppingCart class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-lg font-semibold mb-2">
            No orders found
          </h3>
          <p class="text-muted-foreground mb-4">
            {{ searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating your first order.' }}
          </p>
          <Button v-if="!searchQuery" @click="openCreateDialog">
            <Plus class="h-4 w-4 mr-2" />
            Create First Order
          </Button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="font-semibold">
                    {{ order.order_number }}
                  </h3>
                  <Badge :variant="getStatusVariant(order.status)">
                    {{ order.status.replace('_', ' ') }}
                  </Badge>
                  <Badge :variant="getPriorityVariant(order.priority)">
                    {{ order.priority }}
                  </Badge>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <strong>Buyer:</strong> {{ getBuyerName(order.buyer_id) }}
                  </div>
                  <div>
                    <strong>Factory:</strong> {{ getFactoryName(order.factory_id) }}
                  </div>
                  <div>
                    <strong>Product:</strong> {{ getProductName(order.product_id) }}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm">
                    <MoreVertical class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewOrder(order)">
                    <Eye class="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="editOrder(order)">
                    <Edit class="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="updateCMTStatus(order)">
                    <Settings class="h-4 w-4 mr-2" />
                    Update CMT Status
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-destructive" @click="deleteOrder(order)">
                    <Trash2 class="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div>
                <p class="text-xs text-muted-foreground">
                  Quantity
                </p>
                <p class="font-semibold">
                  {{ formatNumber(order.order_qty) }} pcs
                </p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">
                  Unit Price
                </p>
                <p class="font-semibold">
                  ${{ order.price.toFixed(2) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">
                  Total Amount
                </p>
                <p class="font-semibold">
                  ${{ formatNumber(order.amount) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">
                  Delivery Date
                </p>
                <p class="font-semibold">
                  {{ formatDate(order.delivery_date) }}
                </p>
              </div>
            </div>

            <!-- CMT Progress -->
            <div class="space-y-2">
              <p class="text-xs font-medium text-muted-foreground">
                CMT Progress
              </p>
              <div class="flex items-center space-x-2 text-xs">
                <div v-for="(status, stage) in order.cmt_status" :key="stage" class="flex items-center space-x-1">
                  <div :class="getCMTStatusColor(status)" class="w-2 h-2 rounded-full"></div>
                  <span class="capitalize">{{ stage.replace('_', ' ') }}</span>
                </div>
              </div>
            </div>

            <div v-if="order.remarks" class="mt-3 pt-3 border-t">
              <p class="text-xs text-muted-foreground">
                {{ order.remarks }}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Order Dialog -->
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
      <DialogContent class="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Edit' : 'Create New' }} Order</DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Update order information.' : 'Create a new production order.' }}
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submitForm">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="buyer_id">Buyer</Label>
              <Select v-model="formData.buyer_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select buyer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="buyer in buyerStore.activeBuyers"
                    :key="buyer.id"
                    :value="buyer.id"
                  >
                    {{ buyer.name }} ({{ buyer.code }})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="factory_id">Factory</Label>
              <Select v-model="formData.factory_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select factory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="factory in factoryStore.activeFactories"
                    :key="factory.id"
                    :value="factory.id"
                  >
                    {{ factory.name }} ({{ factory.code }})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="product_id">Product</Label>
            <Select v-model="formData.product_id">
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="product in productStore.activeProducts"
                  :key="product.id"
                  :value="product.id"
                >
                  {{ product.style_no }} - {{ product.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="order_qty">Quantity</Label>
              <Input
                id="order_qty"
                v-model.number="formData.order_qty"
                type="number"
                placeholder="1000"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="price">Unit Price ($)</Label>
              <Input
                id="price"
                v-model.number="formData.price"
                type="number"
                step="0.01"
                placeholder="12.50"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="priority">Priority</Label>
              <Select v-model="formData.priority">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    Low
                  </SelectItem>
                  <SelectItem value="medium">
                    Medium
                  </SelectItem>
                  <SelectItem value="high">
                    High
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="order_date">Order Date</Label>
              <Input
                id="order_date"
                v-model="formData.order_date"
                type="date"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="delivery_date">Delivery Date</Label>
              <Input
                id="delivery_date"
                v-model="formData.delivery_date"
                type="date"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              v-model="formData.remarks"
              placeholder="Additional notes or special requirements"
              rows="3"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="dialogOpen = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="submitting">
              {{ submitting ? 'Saving...' : (isEditing ? 'Update' : 'Create') }} Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
