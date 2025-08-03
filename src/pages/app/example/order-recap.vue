<script setup>
import { Edit, Eye, Plus, Search, Trash2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useOrderRecapStore } from '@/stores/example/orderRecap'

useI18n()
const orderRecapStore = useOrderRecapStore()

// Reactive store data
const { orderRecaps, statistics } = storeToRefs(orderRecapStore)

// Reactive state
const searchQuery = ref('')
const buyerFilter = ref('all')
const factoryFilter = ref('all')
const showDialog = ref(false)
const isEditing = ref(false)

// Form state
const orderRecapForm = reactive({
  id: null,
  buyer: '',
  factory: '',
  orderNumber: '',
  bodyColor: '',
  artwork: '',
  tech: '',
  orderQuantity: 0,
  price: 0,
  amount: 0,
  receiveKorea: '',
  receiveFilm: '',
  screen: '',
  screenSize: '',
  receivePattern: '',
  receiveFabric: '',
  firstQC: '',
  cmtFirst: '',
  secondQC: '',
  cmtSecond: '',
  thirdQC: '',
  cmtThird: '',
  appdQC: '',
  cmtAppd: '',
  workQC: '',
  workSheet: '',
  remark: '',
})

// Computed
const filteredOrderRecaps = computed(() => {
  let filtered = orderRecaps.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      recap =>
        recap.orderNumber.toLowerCase().includes(query)
        || recap.buyer.toLowerCase().includes(query)
        || recap.bodyColor.toLowerCase().includes(query)
        || recap.artwork.toLowerCase().includes(query),
    )
  }

  if (buyerFilter.value !== 'all') {
    filtered = filtered.filter(recap => recap.buyer === buyerFilter.value)
  }

  if (factoryFilter.value !== 'all') {
    filtered = filtered.filter(recap => recap.factory === factoryFilter.value)
  }

  return filtered
})

const uniqueBuyers = computed(() => {
  return [...new Set(orderRecaps.value.map(recap => recap.buyer))]
})

const uniqueFactories = computed(() => {
  return [...new Set(orderRecaps.value.map(recap => recap.factory))]
})

// Methods
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function formatNumber(number) {
  return new Intl.NumberFormat('en-US').format(number)
}

function getQCStatus(firstQC) {
  if (!firstQC || firstQC === '') {
    return { variant: 'destructive', label: 'Pending' }
  }
  return { variant: 'success', label: 'Completed' }
}

function openCreateDialog() {
  resetForm()
  isEditing.value = false
  showDialog.value = true
}

function editOrderRecap(recap) {
  Object.assign(orderRecapForm, {
    id: recap.id,
    buyer: recap.buyer,
    factory: recap.factory,
    orderNumber: recap.orderNumber,
    bodyColor: recap.bodyColor,
    artwork: recap.artwork,
    tech: recap.tech,
    orderQuantity: recap.orderQuantity,
    price: recap.price,
    amount: recap.amount,
    receiveKorea: recap.receiveKorea,
    receiveFilm: recap.receiveFilm,
    screen: recap.screen,
    screenSize: recap.screenSize,
    receivePattern: recap.receivePattern,
    receiveFabric: recap.receiveFabric,
    firstQC: recap.firstQC,
    cmtFirst: recap.cmtFirst,
    secondQC: recap.secondQC,
    cmtSecond: recap.cmtSecond,
    thirdQC: recap.thirdQC,
    cmtThird: recap.cmtThird,
    appdQC: recap.appdQC,
    cmtAppd: recap.cmtAppd,
    workQC: recap.workQC,
    workSheet: recap.workSheet,
    remark: recap.remark,
  })
  isEditing.value = true
  showDialog.value = true
}

function viewOrderRecap(recap) {
  // Navigate to order recap detail page or show detail dialog
  orderRecapStore.selectedOrderRecap = recap
}

async function deleteOrderRecap(recap) {
  try {
    await orderRecapStore.deleteOrderRecap(recap.id)
  }
  catch (error) {
    console.error('Error deleting order recap:', error)
  }
}

function resetForm() {
  Object.assign(orderRecapForm, {
    id: null,
    buyer: '',
    factory: '',
    orderNumber: '',
    bodyColor: '',
    artwork: '',
    tech: '',
    orderQuantity: 0,
    price: 0,
    amount: 0,
    receiveKorea: '',
    receiveFilm: '',
    screen: '',
    screenSize: '',
    receivePattern: '',
    receiveFabric: '',
    firstQC: '',
    cmtFirst: '',
    secondQC: '',
    cmtSecond: '',
    thirdQC: '',
    cmtThird: '',
    appdQC: '',
    cmtAppd: '',
    workQC: '',
    workSheet: '',
    remark: '',
  })
}

async function saveOrderRecap() {
  try {
    const recapData = { ...orderRecapForm }
    // Calculate amount based on quantity and price
    recapData.amount = recapData.orderQuantity * recapData.price

    if (isEditing.value) {
      await orderRecapStore.updateOrderRecap(orderRecapForm.id, recapData)
    }
    else {
      await orderRecapStore.createOrderRecap(recapData)
    }

    showDialog.value = false
    resetForm()
  }
  catch (error) {
    console.error('Error saving order recap:', error)
  }
}

onMounted(async () => {
  if (orderRecaps.value.length === 0) {
    await orderRecapStore.fetchOrderRecaps()
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Order Recap
        </h1>
        <p class="text-muted-foreground">
          Track and manage order recaps with QC status
        </p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="mr-2 h-4 w-4" />
        Add Order Recap
      </Button>
    </div>

    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatNumber(statistics.totalOrders) }}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Quantity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatNumber(statistics.totalQuantity) }}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatCurrency(statistics.totalAmount) }}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Average Price
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            ${{ statistics.averagePrice }}
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters and Search -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <Input v-model="searchQuery" placeholder="Search orders..." class="max-w-sm">
              <template #prefix>
                <Search class="h-4 w-4" />
              </template>
            </Input>
          </div>
          <Select v-model="buyerFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Filter by buyer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Buyers
              </SelectItem>
              <SelectItem v-for="buyer in uniqueBuyers" :key="buyer" :value="buyer">
                {{ buyer }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="factoryFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Filter by factory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Factories
              </SelectItem>
              <SelectItem v-for="factory in uniqueFactories" :key="factory" :value="factory">
                {{ factory }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Order Recap Table -->
    <Card>
      <CardHeader>
        <CardTitle>Order Recap List</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left p-2">
                  Order Number
                </th>
                <th class="text-left p-2">
                  Buyer
                </th>
                <th class="text-left p-2">
                  Body Color
                </th>
                <th class="text-left p-2">
                  Artwork
                </th>
                <th class="text-left p-2">
                  Quantity
                </th>
                <th class="text-left p-2">
                  Price
                </th>
                <th class="text-left p-2">
                  Amount
                </th>
                <th class="text-left p-2">
                  Korea
                </th>
                <th class="text-left p-2">
                  Fabric
                </th>
                <th class="text-left p-2">
                  QC Status
                </th>
                <th class="text-left p-2">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="recap in filteredOrderRecaps"
                :key="recap.id"
                class="border-b hover:bg-muted/50"
              >
                <td class="p-2 font-medium">
                  {{ recap.orderNumber }}
                </td>
                <td class="p-2">
                  {{ recap.buyer }}
                </td>
                <td class="p-2">
                  {{ recap.bodyColor }}
                </td>
                <td class="p-2 text-sm">
                  {{ recap.artwork }}
                </td>
                <td class="p-2">
                  {{ formatNumber(recap.orderQuantity) }}
                </td>
                <td class="p-2">
                  ${{ recap.price }}
                </td>
                <td class="p-2">
                  {{ formatCurrency(recap.amount) }}
                </td>
                <td class="p-2">
                  <Badge :variant="recap.receiveKorea === 'OK' ? 'success' : 'secondary'">
                    {{ recap.receiveKorea || 'Pending' }}
                  </Badge>
                </td>
                <td class="p-2">
                  <Badge :variant="recap.receiveFabric === 'OK' ? 'success' : 'secondary'">
                    {{ recap.receiveFabric || 'Pending' }}
                  </Badge>
                </td>
                <td class="p-2">
                  <Badge :variant="getQCStatus(recap.firstQC).variant">
                    {{ getQCStatus(recap.firstQC).label }}
                  </Badge>
                </td>
                <td class="p-2">
                  <div class="flex gap-2">
                    <Button size="sm" variant="outline" @click="viewOrderRecap(recap)">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" @click="editOrderRecap(recap)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" @click="deleteOrderRecap(recap)">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredOrderRecaps.length === 0" class="text-center py-8">
            <p class="text-muted-foreground">
              No order recaps found.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog :open="showDialog" @update:open="showDialog = $event">
      <DialogContent class="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? 'Edit Order Recap' : 'Add Order Recap' }}
          </DialogTitle>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="saveOrderRecap">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="orderNumber">Order Number</Label>
              <Input id="orderNumber" v-model="orderRecapForm.orderNumber" required />
            </div>

            <div class="space-y-2">
              <Label for="buyer">Buyer</Label>
              <Input id="buyer" v-model="orderRecapForm.buyer" required />
            </div>

            <div class="space-y-2">
              <Label for="factory">Factory</Label>
              <Input id="factory" v-model="orderRecapForm.factory" required />
            </div>

            <div class="space-y-2">
              <Label for="bodyColor">Body Color</Label>
              <Input id="bodyColor" v-model="orderRecapForm.bodyColor" required />
            </div>

            <div class="space-y-2">
              <Label for="orderQuantity">Order Quantity</Label>
              <Input
                id="orderQuantity"
                v-model.number="orderRecapForm.orderQuantity"
                type="number"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="price">Price</Label>
              <Input
                id="price"
                v-model.number="orderRecapForm.price"
                type="number"
                step="0.01"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="receiveKorea">Receive Korea</Label>
              <Select v-model="orderRecapForm.receiveKorea">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OK">
                    OK
                  </SelectItem>
                  <SelectItem value="Pending">
                    Pending
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="receiveFabric">Receive Fabric</Label>
              <Select v-model="orderRecapForm.receiveFabric">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OK">
                    OK
                  </SelectItem>
                  <SelectItem value="Pending">
                    Pending
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="firstQC">First QC</Label>
              <Input id="firstQC" v-model="orderRecapForm.firstQC" placeholder="e.g., 22-May" />
            </div>

            <div class="space-y-2">
              <Label for="cmtFirst">CMT First</Label>
              <Input id="cmtFirst" v-model="orderRecapForm.cmtFirst" />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="artwork">Artwork</Label>
            <Input id="artwork" v-model="orderRecapForm.artwork" />
          </div>

          <div class="space-y-2">
            <Label for="tech">Tech</Label>
            <Input id="tech" v-model="orderRecapForm.tech" />
          </div>

          <div class="space-y-2">
            <Label for="remark">Remark</Label>
            <Textarea id="remark" v-model="orderRecapForm.remark" class="min-h-[80px]" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showDialog = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="orderRecapStore.loading">
              {{ isEditing ? 'Update' : 'Create' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
