<script setup>
import {
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Loader2,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useBuyersStore } from '@/stores/buyers'
import { useOrdersStore } from '@/stores/orders'

const ordersStore = useOrdersStore()
const buyersStore = useBuyersStore()

// State
const searchQuery = ref('')
const statusFilter = ref('all')
const buyerFilter = ref('all')
const showDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const orderToDelete = ref(null)
const selectedFile = ref(null)

// Reactive data
const formData = ref({
  orderNumber: '',
  buyerId: '',
  factoryId: '',
  items: [
    {
      productId: '',
      quantity: 0,
      unitPrice: 0,
      colors: [],
      sizes: [],
    },
  ],
  deliveryDate: '',
  priority: 'medium',
  notes: '',
  status: 'pending',
})

// Store getters (reactive)
const { orders, loading, selectedOrder, statistics, factoryOptions, productOptions } = storeToRefs(ordersStore)
const { buyers, buyerOptions } = storeToRefs(buyersStore)

// Computed
const filteredOrders = computed(() => {
  // Safety check untuk orders array
  if (!orders.value || !Array.isArray(orders.value)) {
    return []
  }

  let filtered = orders.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order =>
      order?.orderNumber?.toLowerCase().includes(query)
      || order?.buyer?.toLowerCase().includes(query)
      || order?.product?.toLowerCase().includes(query)
      || order?.style?.toLowerCase().includes(query),
    )
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(order => order?.status === statusFilter.value)
  }

  // Buyer filter
  if (buyerFilter.value !== 'all') {
    filtered = filtered.filter(order => order?.buyerId === buyerFilter.value)
  }

  return filtered
})

// Methods
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0)
}

function getStatusVariant(status) {
  const variants = {
    pending: 'secondary',
    inProduction: 'default',
    qcCheck: 'outline',
    completed: 'default',
    shipped: 'default',
  }
  return variants[status] || 'secondary'
}

function resetForm() {
  formData.value = {
    orderNumber: '',
    buyerId: '',
    factoryId: '',
    items: [
      {
        productId: '',
        quantity: 0,
        unitPrice: 0,
        colors: [],
        sizes: [],
      },
    ],
    deliveryDate: '',
    priority: 'medium',
    notes: '',
    status: 'pending',
  }
  selectedFile.value = null
}

function openCreateDialog() {
  resetForm()
  isEditing.value = false
  showDialog.value = true
}

function editOrder(order) {
  formData.value = {
    ...order,
    // Ensure items structure exists
    items: order.items && order.items.length > 0
      ? order.items
      : [
          {
            productId: '',
            quantity: order.quantity || 0,
            unitPrice: order.averageUnitPrice || 0,
            colors: [],
            sizes: [],
          },
        ],
  }
  isEditing.value = true
  showDialog.value = true
}

function viewOrder(order) {
  ordersStore.selectedOrder = order
  showViewDialog.value = true
}

function confirmDelete(order) {
  orderToDelete.value = order
  showDeleteDialog.value = true
}

function handleFileUpload(event) {
  selectedFile.value = event.target.files[0]
}

function addItem() {
  formData.value.items.push({
    productId: '',
    quantity: 0,
    unitPrice: 0,
    colors: [],
    sizes: [],
  })
}

function removeItem(index) {
  if (formData.value.items.length > 1) {
    formData.value.items.splice(index, 1)
  }
}

async function saveOrder() {
  try {
    const orderData = {
      ...formData.value,
      // Calculate total amount from items
      totalAmount: formData.value.items.reduce((sum, item) =>
        sum + (item.quantity * item.unitPrice), 0),
      // Set currency
      currency: 'USD',
    }

    if (isEditing.value) {
      await ordersStore.updateOrder(formData.value.id, orderData)
    }
    else {
      await ordersStore.createOrder(orderData)
    }

    if (selectedFile.value) {
      // Upload graphic file if selected
      await ordersStore.uploadGraphic(formData.value.id, selectedFile.value)
    }

    showDialog.value = false
    resetForm()
  }
  catch (error) {
    console.error('Error saving order:', error)
  }
}

async function handleDelete() {
  try {
    await ordersStore.deleteOrder(orderToDelete.value.id)
    showDeleteDialog.value = false
    orderToDelete.value = null
  }
  catch (error) {
    console.error('Error deleting order:', error)
  }
}

// Initialize
onMounted(async () => {
  // Prevent multiple fetch calls during navigation
  const promises = []
  if (orders.value.length === 0) {
    promises.push(ordersStore.fetchOrders())
  }
  if (buyers.value.length === 0) {
    promises.push(buyersStore.fetchBuyers())
  }
  if (promises.length > 0) {
    await Promise.all(promises)
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('erp.orders.title') }}
        </h1>
        <p class="text-muted-foreground">
          {{ $t('erp.orders.subtitle') }}
        </p>
      </div>
      <Button class="gap-2" :disabled="loading" @click="openCreateDialog">
        <Plus class="h-4 w-4" />
        {{ $t('erp.orders.addOrder') }}
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <ShoppingCart class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.orders.stats.total') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ statistics.total }}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock class="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.orders.stats.pending') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ statistics.pending }}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Package class="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.orders.stats.inProduction') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ statistics.inProduction }}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.orders.stats.completed') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ statistics.completed }}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters and Search -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                v-model="searchQuery"
                :placeholder="$t('erp.orders.search')"
                :disabled="loading"
                class="pl-10"
              />
            </div>
          </div>
          <Select v-model="statusFilter" :disabled="loading">
            <SelectTrigger class="w-[180px]">
              <SelectValue :placeholder="$t('erp.orders.filterStatus')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {{ $t('common.all') }}
              </SelectItem>
              <SelectItem value="pending">
                {{ $t('erp.orders.pending') }}
              </SelectItem>
              <SelectItem value="inProduction">
                {{ $t('erp.orders.inProduction') }}
              </SelectItem>
              <SelectItem value="qcCheck">
                {{ $t('erp.orders.qcCheck') }}
              </SelectItem>
              <SelectItem value="completed">
                {{ $t('erp.orders.completed') }}
              </SelectItem>
              <SelectItem value="shipped">
                {{ $t('erp.orders.shipped') }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="buyerFilter" :disabled="loading">
            <SelectTrigger class="w-[180px]">
              <SelectValue :placeholder="$t('erp.orders.filterBuyer')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {{ $t('common.all') }}
              </SelectItem>
              <SelectItem v-for="buyer in buyerOptions" :key="buyer.value" :value="buyer.value">
                {{ buyer.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Orders Table -->
    <Card>
      <CardHeader>
        <CardTitle>{{ $t('erp.orders.list') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ $t('erp.orders.table.orderNumber') }}</TableHead>
                <TableHead>{{ $t('erp.orders.table.buyer') }}</TableHead>
                <TableHead>{{ $t('erp.orders.table.product') }}</TableHead>
                <TableHead>{{ $t('erp.orders.table.quantity') }}</TableHead>
                <TableHead>{{ $t('erp.orders.table.deliveryDate') }}</TableHead>
                <TableHead>{{ $t('erp.orders.table.status') }}</TableHead>
                <TableHead class="text-right">
                  {{ $t('common.actions') }}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="loading">
                <TableRow v-for="n in 5" :key="n">
                  <TableCell class="py-4">
                    <Skeleton class="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <div class="flex justify-end gap-2">
                      <Skeleton class="h-8 w-8" />
                      <Skeleton class="h-8 w-8" />
                      <Skeleton class="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              </template>

              <TableRow v-else-if="filteredOrders.length === 0">
                <TableCell colspan="7" class="text-center py-8 text-muted-foreground">
                  {{ $t('erp.orders.noData') }}
                </TableCell>
              </TableRow>

              <TableRow v-for="order in filteredOrders" v-else :key="order?.id">
                <TableCell class="font-medium">
                  <div>
                    <div class="font-semibold">
                      {{ order?.orderNumber }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ order?.style }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="font-medium">
                    {{ order?.buyer }}
                  </div>
                </TableCell>
                <TableCell>
                  <div class="font-medium">
                    {{ order?.product }}
                  </div>
                </TableCell>
                <TableCell>
                  <div class="font-medium">
                    {{ order?.quantity?.toLocaleString() }}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div class="text-sm font-medium">
                      {{ formatDate(order?.deliveryDate) }}
                    </div>
                    <div class="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar class="h-3 w-3" />
                      Due
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(order?.status)">
                    {{ $t(`erp.orders.${order?.status}`) }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" @click="viewOrder(order)">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="editOrder(order)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="confirmDelete(order)">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showDialog">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? $t('erp.orders.edit') : $t('erp.orders.addOrder') }}
          </DialogTitle>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="saveOrder">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="orderNumber">{{ $t('erp.orders.orderNumber') }} *</Label>
              <Input
                id="orderNumber"
                v-model="formData.orderNumber"
                required
                :placeholder="$t('erp.orders.orderNumberPlaceholder')"
              />
            </div>

            <div class="space-y-2">
              <Label for="buyer">{{ $t('erp.orders.buyer') }} *</Label>
              <Select v-model="formData.buyerId">
                <SelectTrigger>
                  <SelectValue :placeholder="$t('erp.orders.buyerPlaceholder')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="buyer in buyerOptions"
                    :key="buyer.value"
                    :value="buyer.value"
                  >
                    {{ buyer.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="factory">{{ $t('erp.orders.factory') }} *</Label>
              <Select v-model="formData.factoryId">
                <SelectTrigger>
                  <SelectValue :placeholder="$t('erp.orders.factoryPlaceholder')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="factory in factoryOptions"
                    :key="factory.value"
                    :value="factory.value"
                  >
                    {{ factory.label }} - {{ factory.location }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="priority">{{ $t('erp.orders.priority') }}</Label>
              <Select v-model="formData.priority">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    {{ $t('erp.orders.priorityLow') }}
                  </SelectItem>
                  <SelectItem value="medium">
                    {{ $t('erp.orders.priorityMedium') }}
                  </SelectItem>
                  <SelectItem value="high">
                    {{ $t('erp.orders.priorityHigh') }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Order Items Section -->
          <div class="space-y-4">
            <Label class="text-base font-semibold">{{ $t('erp.orders.items') }}</Label>

            <div v-for="(item, index) in formData.items" :key="index" class="p-4 border rounded-lg space-y-4">
              <div class="flex justify-between items-center">
                <Label class="font-medium">{{ $t('erp.orders.item') }} {{ index + 1 }}</Label>
                <Button
                  v-if="formData.items.length > 1"
                  type="button"
                  variant="ghost"
                  size="sm"
                  @click="removeItem(index)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>{{ $t('erp.orders.product') }} *</Label>
                  <Select v-model="item.productId">
                    <SelectTrigger>
                      <SelectValue :placeholder="$t('erp.orders.productPlaceholder')" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="product in productOptions"
                        :key="product.value"
                        :value="product.value"
                      >
                        {{ product.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label>{{ $t('erp.orders.quantity') }} *</Label>
                  <Input
                    v-model.number="item.quantity"
                    type="number"
                    required
                    :placeholder="$t('erp.orders.quantityPlaceholder')"
                  />
                </div>

                <div class="space-y-2">
                  <Label>{{ $t('erp.orders.unitPrice') }} *</Label>
                  <Input
                    v-model.number="item.unitPrice"
                    type="number"
                    step="0.01"
                    required
                    :placeholder="$t('erp.orders.unitPricePlaceholder')"
                  />
                </div>

                <div class="space-y-2">
                  <Label>{{ $t('erp.orders.totalPrice') }}</Label>
                  <Input
                    :value="formatCurrency(item.quantity * item.unitPrice)"
                    readonly
                    class="bg-muted"
                  />
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              class="w-full"
              @click="addItem"
            >
              <Plus class="h-4 w-4 mr-2" />
              {{ $t('erp.orders.addItem') }}
            </Button>
          </div>

          <div class="space-y-2">
            <Label for="deliveryDate">{{ $t('erp.orders.deliveryDate') }} *</Label>
            <Input
              id="deliveryDate"
              v-model="formData.deliveryDate"
              type="date"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="status">{{ $t('erp.orders.status') }}</Label>
            <Select v-model="formData.status">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  {{ $t('erp.orders.pending') }}
                </SelectItem>
                <SelectItem value="inProduction">
                  {{ $t('erp.orders.inProduction') }}
                </SelectItem>
                <SelectItem value="qcCheck">
                  {{ $t('erp.orders.qcCheck') }}
                </SelectItem>
                <SelectItem value="completed">
                  {{ $t('erp.orders.completed') }}
                </SelectItem>
                <SelectItem value="shipped">
                  {{ $t('erp.orders.shipped') }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="notes">{{ $t('erp.orders.notes') }}</Label>
            <Textarea
              id="notes"
              v-model="formData.notes"
              :placeholder="$t('erp.orders.notesPlaceholder')"
              rows="3"
            />
          </div>

          <div class="space-y-2">
            <Label for="graphic">{{ $t('erp.orders.graphic') }}</Label>
            <Input
              id="graphic"
              type="file"
              accept="image/*,.pdf"
              @change="handleFileUpload"
            />
          </div>

          <!-- Total Amount Display -->
          <div class="p-4 bg-muted/50 rounded-lg">
            <div class="flex justify-between items-center">
              <Label class="text-base font-semibold">{{ $t('erp.orders.totalAmount') }}</Label>
              <span class="text-2xl font-bold">
                {{ formatCurrency(formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)) }}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showDialog = false">
              {{ $t('common.cancel') }}
            </Button>
            <Button type="submit" :disabled="loading">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ isEditing ? $t('common.update') : $t('common.create') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- View Dialog -->
    <Dialog v-model:open="showViewDialog">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ $t('erp.orders.details') }}</DialogTitle>
        </DialogHeader>

        <div v-if="selectedOrder" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.orders.orderNumber') }}</Label>
              <p class="font-semibold">
                {{ selectedOrder.orderNumber }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.orders.buyer') }}</Label>
              <p>{{ selectedOrder.buyer }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.orders.product') }}</Label>
              <p>{{ selectedOrder.product }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.orders.style') }}</Label>
              <p>{{ selectedOrder.style }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.orders.quantity') }}</Label>
              <p>{{ selectedOrder.quantity?.toLocaleString() }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.orders.deliveryDate') }}</Label>
              <p>{{ formatDate(selectedOrder.deliveryDate) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.orders.status') }}</Label>
              <Badge :variant="getStatusVariant(selectedOrder.status)">
                {{ $t(`erp.orders.${selectedOrder.status}`) }}
              </Badge>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.orders.createdAt') }}</Label>
              <p>{{ formatDate(selectedOrder.createdAt) }}</p>
            </div>
          </div>

          <!-- Order Progress -->
          <div class="p-4 bg-muted/50 rounded-lg">
            <Label class="text-sm font-medium text-muted-foreground mb-3 block">{{ $t('erp.orders.progress') }}</Label>
            <div class="grid grid-cols-4 gap-4 text-center">
              <div class="text-center">
                <p class="text-2xl font-bold text-blue-600">
                  {{ selectedOrder.totalAmount ? formatCurrency(selectedOrder.totalAmount) : '$0' }}
                </p>
                <p class="text-sm text-muted-foreground">
                  Total Value
                </p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-green-600">
                  {{ selectedOrder.completedQty || 0 }}
                </p>
                <p class="text-sm text-muted-foreground">
                  Completed
                </p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-yellow-600">
                  {{ selectedOrder.pendingQty || selectedOrder.quantity || 0 }}
                </p>
                <p class="text-sm text-muted-foreground">
                  Pending
                </p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-purple-600">
                  {{ selectedOrder.urgency || 'Normal' }}
                </p>
                <p class="text-sm text-muted-foreground">
                  Priority
                </p>
              </div>
            </div>
          </div>

          <div v-if="selectedOrder.notes">
            <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.orders.notes') }}</Label>
            <p class="mt-1 p-3 bg-muted/30 rounded-md">
              {{ selectedOrder.notes }}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button @click="showViewDialog = false">
            {{ $t('common.close') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ $t('erp.orders.confirmDelete') }}</DialogTitle>
        </DialogHeader>

        <p class="text-muted-foreground">
          {{ $t('erp.orders.deleteMessage', { orderNumber: orderToDelete?.orderNumber }) }}
        </p>

        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false">
            {{ $t('common.cancel') }}
          </Button>
          <Button variant="destructive" :disabled="loading" @click="handleDelete">
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ $t('common.delete') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
