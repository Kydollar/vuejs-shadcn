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
      <Button @click="openCreateDialog">
        <Plus class="mr-2 h-4 w-4" />
        {{ $t('erp.orders.addOrder') }}
      </Button>
    </div>

    <!-- Filters and Search -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <Input
              v-model="searchQuery"
              :placeholder="$t('common.search')"
              class="max-w-sm"
            >
              <template #prefix>
                <Search class="h-4 w-4" />
              </template>
            </Input>
          </div>
          <Select v-model="statusFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue :placeholder="$t('common.filter')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">{{ $t('erp.orders.pending') }}</SelectItem>
              <SelectItem value="inProduction">{{ $t('erp.orders.inProduction') }}</SelectItem>
              <SelectItem value="qcCheck">{{ $t('erp.orders.qcCheck') }}</SelectItem>
              <SelectItem value="completed">{{ $t('erp.orders.completed') }}</SelectItem>
              <SelectItem value="shipped">{{ $t('erp.orders.shipped') }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Orders Table -->
    <Card>
      <CardHeader>
        <CardTitle>Orders List</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left p-4">{{ $t('erp.orders.orderNumber') }}</th>
                <th class="text-left p-4">{{ $t('erp.orders.buyer') }}</th>
                <th class="text-left p-4">{{ $t('erp.orders.product') }}</th>
                <th class="text-left p-4">{{ $t('erp.orders.quantity') }}</th>
                <th class="text-left p-4">{{ $t('erp.orders.deliveryDate') }}</th>
                <th class="text-left p-4">{{ $t('erp.orders.status') }}</th>
                <th class="text-left p-4">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order.id" class="border-b hover:bg-muted/50">
                <td class="p-4 font-medium">{{ order.orderNumber }}</td>
                <td class="p-4">{{ order.buyer }}</td>
                <td class="p-4">{{ order.product }}</td>
                <td class="p-4">{{ order.quantity.toLocaleString() }}</td>
                <td class="p-4">{{ formatDate(order.deliveryDate) }}</td>
                <td class="p-4">
                  <Badge :variant="getStatusVariant(order.status)">
                    {{ $t(`erp.orders.${order.status}`) }}
                  </Badge>
                </td>
                <td class="p-4">
                  <div class="flex space-x-2">
                    <Button
                      variant="ghost" 
                      size="sm"
                      @click="viewOrder(order)"
                    >
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" 
                      size="sm"
                      @click="editOrder(order)"
                    >
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" 
                      size="sm"
                      @click="deleteOrder(order)"
                      class="text-red-600 hover:text-red-700"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="filteredOrders.length === 0" class="text-center py-8">
            <p class="text-muted-foreground">{{ $t('common.noData') }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog :open="showDialog" @update:open="showDialog = $event">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? $t('erp.orders.editOrder') : $t('erp.orders.addOrder') }}
          </DialogTitle>
        </DialogHeader>
        
        <form @submit.prevent="saveOrder" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="orderNumber">{{ $t('erp.orders.orderNumber') }}</Label>
              <Input
                id="orderNumber"
                v-model="orderForm.orderNumber"
                :placeholder="$t('erp.orders.orderNumber')"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="buyer">{{ $t('erp.orders.buyer') }}</Label>
              <Select v-model="orderForm.buyerId">
                <SelectTrigger>
                  <SelectValue :placeholder="$t('erp.orders.buyer')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="buyer in buyersStore.buyerOptions"
                    :key="buyer.value"
                    :value="buyer.value"
                  >
                    {{ buyer.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="product">{{ $t('erp.orders.product') }}</Label>
              <Input
                id="product"
                v-model="orderForm.product"
                :placeholder="$t('erp.orders.product')"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="quantity">{{ $t('erp.orders.quantity') }}</Label>
              <Input
                id="quantity"
                v-model.number="orderForm.quantity"
                type="number"
                :placeholder="$t('erp.orders.quantity')"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="style">{{ $t('erp.orders.style') }}</Label>
              <Input
                id="style"
                v-model="orderForm.style"
                :placeholder="$t('erp.orders.style')"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="deliveryDate">{{ $t('erp.orders.deliveryDate') }}</Label>
              <Input
                id="deliveryDate"
                v-model="orderForm.deliveryDate"
                type="date"
                required
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="notes">{{ $t('erp.orders.notes') }}</Label>
            <Textarea
              id="notes"
              v-model="orderForm.notes"
              :placeholder="$t('erp.orders.notes')"
              class="min-h-[80px]"
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

          <DialogFooter>
            <Button type="button" variant="outline" @click="showDialog = false">
              {{ $t('common.cancel') }}
            </Button>
            <Button type="submit" :disabled="ordersStore.loading">
              {{ ordersStore.loading ? $t('common.loading') : $t('common.save') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { Edit, Eye, Plus, Search, Trash2 } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useBuyersStore } from '@/stores/buyers'
import { useOrdersStore } from '@/stores/orders'

useI18n()
const ordersStore = useOrdersStore()
const buyersStore = useBuyersStore()

// Reactive state
const searchQuery = ref('')
const statusFilter = ref('all')
const showDialog = ref(false)
const isEditing = ref(false)
const selectedFile = ref(null)

// Form state
const orderForm = reactive({
  id: null,
  orderNumber: '',
  buyerId: '',
  product: '',
  quantity: 0,
  style: '',
  deliveryDate: '',
  notes: '',
  status: 'pending'
})

// Computed
const filteredOrders = computed(() => {
  let filtered = ordersStore.orders

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order =>
      order.orderNumber.toLowerCase().includes(query) ||
      order.buyer.toLowerCase().includes(query) ||
      order.product.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  return filtered
})

// Methods
function getStatusVariant(status) {
  const variants = {
    pending: 'secondary',
    inProduction: 'default',
    qcCheck: 'outline',
    completed: 'success',
    shipped: 'success'
  }
  return variants[status] || 'secondary'
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

function openCreateDialog() {
  resetForm()
  isEditing.value = false
  showDialog.value = true
}

function editOrder(order) {
  Object.assign(orderForm, {
    id: order.id,
    orderNumber: order.orderNumber,
    buyerId: order.buyerId,
    product: order.product,
    quantity: order.quantity,
    style: order.style,
    deliveryDate: order.deliveryDate,
    notes: order.notes,
    status: order.status
  })
  isEditing.value = true
  showDialog.value = true
}

function viewOrder(order) {
  // Navigate to order detail page or show detail dialog
  // TODO: Implement order detail view
  ordersStore.selectedOrder = order
}

async function deleteOrder(order) {
  // TODO: Replace with proper confirmation dialog component
  try {
    await ordersStore.deleteOrder(order.id)
  } catch (error) {
    console.error('Error deleting order:', error)
  }
}

function resetForm() {
  Object.assign(orderForm, {
    id: null,
    orderNumber: '',
    buyerId: '',
    product: '',
    quantity: 0,
    style: '',
    deliveryDate: '',
    notes: '',
    status: 'pending'
  })
  selectedFile.value = null
}

function handleFileUpload(event) {
  selectedFile.value = event.target.files[0]
}

async function saveOrder() {
  try {
    const orderData = { ...orderForm }
    const buyer = buyersStore.buyers.find(b => b.id === orderForm.buyerId)
    if (buyer) {
      orderData.buyer = buyer.buyerName
    }

    if (isEditing.value) {
      await ordersStore.updateOrder(orderForm.id, orderData)
    } else {
      await ordersStore.createOrder(orderData)
    }

    if (selectedFile.value) {
      // Upload graphic file if selected
      await ordersStore.uploadGraphic(orderForm.id, selectedFile.value)
    }

    showDialog.value = false
    resetForm()
  } catch (error) {
    console.error('Error saving order:', error)
  }
}

onMounted(async () => {
  await Promise.all([
    ordersStore.loadDummyData(),
    buyersStore.loadDummyData()
  ])
})
</script>
