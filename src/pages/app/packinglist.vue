<script setup>
import {
  Box,
  ClipboardList,
  Edit,
  Eye,
  FileText,
  Package,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShirtIcon,
  Trash2,
  Truck,
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
const printDialogOpen = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const buyerFilter = ref('all')
const selectedPackingList = ref(null)

// Constants
const garmentSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

// Form data
const formData = ref({
  order_id: '',
  packing_list_number: '',
  shipping_method: '',
  destination: '',
  ship_date: '',
  cartons: [],
  special_instructions: '',
})

// Quick create
const quickCreate = ref({
  order_id: '',
  shipping_method: '',
  destination: '',
})

// Mock data
const completedOrders = ref([
  { id: 1, order_number: 'ORD-001', buyer_name: 'Macy\'s Inc', product_name: 'Basic Tee - Red', status: 'completed' },
  { id: 2, order_number: 'ORD-002', buyer_name: 'Walmart', product_name: 'Premium Polo - Blue', status: 'completed' },
  { id: 3, order_number: 'ORD-003', buyer_name: 'Target Corp', product_name: 'Hoodie - Black', status: 'completed' },
])

const packingLists = ref([
  {
    id: 1,
    packing_list_number: 'PL-2025-001',
    order_id: 1,
    order_number: 'ORD-001',
    buyer_name: 'Macy\'s Inc',
    style_name: 'Basic Tee - Red',
    shipping_method: 'sea',
    destination: 'New York, USA',
    created_date: '2025-07-28',
    ship_date: '2025-08-05',
    status: 'confirmed',
    total_cartons: 5,
    total_pieces: 1500,
    total_weight: 45.5,
    total_volume: 1.25,
    carton_details: [
      { carton_number: '001', length: 50, width: 40, height: 30, sizes: { S: 100, M: 150, L: 50 }, total_pieces: 300, weight: 9.5 },
      { carton_number: '002', length: 50, width: 40, height: 30, sizes: { S: 80, M: 140, L: 80 }, total_pieces: 300, weight: 9.0 },
      { carton_number: '003', length: 50, width: 40, height: 30, sizes: { M: 120, L: 120, XL: 60 }, total_pieces: 300, weight: 9.2 },
      { carton_number: '004', length: 50, width: 40, height: 30, sizes: { S: 50, M: 100, L: 100, XL: 50 }, total_pieces: 300, weight: 8.8 },
      { carton_number: '005', length: 50, width: 40, height: 30, sizes: { M: 100, L: 150, XL: 50 }, total_pieces: 300, weight: 9.0 },
    ],
    special_instructions: 'Handle with care. Keep dry.',
  },
  {
    id: 2,
    packing_list_number: 'PL-2025-002',
    order_id: 2,
    order_number: 'ORD-002',
    buyer_name: 'Walmart',
    style_name: 'Premium Polo - Blue',
    shipping_method: 'air',
    destination: 'California, USA',
    created_date: '2025-07-30',
    ship_date: '2025-08-02',
    status: 'shipped',
    total_cartons: 3,
    total_pieces: 900,
    total_weight: 32.1,
    total_volume: 0.95,
    carton_details: [
      { carton_number: '001', length: 45, width: 35, height: 25, sizes: { S: 100, M: 150, L: 50 }, total_pieces: 300, weight: 10.5 },
      { carton_number: '002', length: 45, width: 35, height: 25, sizes: { M: 100, L: 150, XL: 50 }, total_pieces: 300, weight: 10.8 },
      { carton_number: '003', length: 45, width: 35, height: 25, sizes: { S: 50, M: 100, L: 100, XL: 50 }, total_pieces: 300, weight: 10.8 },
    ],
    special_instructions: 'Urgent delivery required.',
  },
])

// Computed properties
const totalPackingLists = computed(() => packingLists.value.length)

const readyToShip = computed(() => {
  return packingLists.value.filter(pl => pl.status === 'confirmed').length
})

const totalCartons = computed(() => {
  return packingLists.value.reduce((sum, pl) => sum + pl.total_cartons, 0)
})

const totalPieces = computed(() => {
  return packingLists.value.reduce((sum, pl) => sum + pl.total_pieces, 0)
})

const uniqueBuyers = computed(() => {
  return [...new Set(packingLists.value.map(pl => pl.buyer_name))]
})

const filteredPackingLists = computed(() => {
  let filtered = packingLists.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(pl =>
      pl.packing_list_number.toLowerCase().includes(query)
      || pl.order_number.toLowerCase().includes(query)
      || pl.buyer_name.toLowerCase().includes(query)
      || pl.style_name.toLowerCase().includes(query),
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(pl => pl.status === statusFilter.value)
  }

  if (buyerFilter.value !== 'all') {
    filtered = filtered.filter(pl => pl.buyer_name === buyerFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
})

const canCreateQuick = computed(() => {
  return quickCreate.value.order_id && quickCreate.value.shipping_method && quickCreate.value.destination
})

const canSavePackingList = computed(() => {
  return formData.value.order_id && formData.value.shipping_method
    && formData.value.destination && formData.value.cartons.length > 0
})

// Methods
function getStatusBadgeVariant(status) {
  const variants = {
    draft: 'secondary',
    confirmed: 'default',
    shipped: 'default',
    delivered: 'outline',
  }
  return variants[status] || 'secondary'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString()
}

function generatePackingListNumber() {
  const year = new Date().getFullYear()
  const count = packingLists.value.length + 1
  return `PL-${year}-${count.toString().padStart(3, '0')}`
}

function openCreateDialog() {
  isEditing.value = false
  resetForm()
  formData.value.packing_list_number = generatePackingListNumber()
  dialogOpen.value = true
}

function editPackingList(packingList) {
  isEditing.value = true
  formData.value = {
    id: packingList.id,
    order_id: packingList.order_id,
    packing_list_number: packingList.packing_list_number,
    shipping_method: packingList.shipping_method,
    destination: packingList.destination,
    ship_date: packingList.ship_date,
    cartons: packingList.carton_details.map(carton => ({
      carton_number: carton.carton_number,
      length: carton.length,
      width: carton.width,
      height: carton.height,
      weight: carton.weight,
      sizes: { ...carton.sizes },
    })),
    special_instructions: packingList.special_instructions,
  }
  dialogOpen.value = true
}

function resetForm() {
  formData.value = {
    order_id: '',
    packing_list_number: '',
    shipping_method: '',
    destination: '',
    ship_date: '',
    cartons: [],
    special_instructions: '',
  }
}

function addCarton() {
  const cartonNumber = (formData.value.cartons.length + 1).toString().padStart(3, '0')
  formData.value.cartons.push({
    carton_number: cartonNumber,
    length: 50,
    width: 40,
    height: 30,
    weight: 10,
    sizes: garmentSizes.reduce((acc, size) => {
      acc[size] = 0
      return acc
    }, {}),
  })
}

function removeCarton(index) {
  formData.value.cartons.splice(index, 1)
}

function calculateCartonTotal(carton) {
  return Object.values(carton.sizes).reduce((sum, qty) => sum + Number.parseInt(qty || 0), 0)
}

function calculateTotalPieces() {
  return formData.value.cartons.reduce((sum, carton) => sum + calculateCartonTotal(carton), 0)
}

function calculateTotalWeight() {
  return formData.value.cartons.reduce((sum, carton) => sum + Number.parseFloat(carton.weight || 0), 0).toFixed(1)
}

function calculateTotalVolume() {
  return formData.value.cartons.reduce((sum, carton) => {
    const volume = (carton.length * carton.width * carton.height) / 1000000 // Convert cm³ to m³
    return sum + volume
  }, 0).toFixed(2)
}

function savePackingList() {
  if (!canSavePackingList.value)
    return

  submitting.value = true

  setTimeout(() => {
    const order = completedOrders.value.find(o => o.id === Number.parseInt(formData.value.order_id))

    const cartonDetails = formData.value.cartons.map(carton => ({
      ...carton,
      total_pieces: calculateCartonTotal(carton),
    }))

    const packingListData = {
      ...formData.value,
      order_number: order?.order_number || '',
      buyer_name: order?.buyer_name || '',
      style_name: order?.product_name || '',
      created_date: new Date().toISOString().split('T')[0],
      status: 'draft',
      total_cartons: formData.value.cartons.length,
      total_pieces: calculateTotalPieces(),
      total_weight: Number.parseFloat(calculateTotalWeight()),
      total_volume: Number.parseFloat(calculateTotalVolume()),
      carton_details: cartonDetails,
    }

    if (isEditing.value) {
      const index = packingLists.value.findIndex(pl => pl.id === formData.value.id)
      if (index !== -1) {
        packingLists.value[index] = { ...packingListData, id: formData.value.id }
      }
    }
    else {
      packingLists.value.push({
        id: Date.now(),
        ...packingListData,
      })
    }

    submitting.value = false
    dialogOpen.value = false
    resetForm()
  }, 1000)
}

function createQuickPackingList() {
  if (!canCreateQuick.value)
    return

  const order = completedOrders.value.find(o => o.id === Number.parseInt(quickCreate.value.order_id))

  // Create simple packing list with default cartons
  const packingListData = {
    id: Date.now(),
    packing_list_number: generatePackingListNumber(),
    order_id: Number.parseInt(quickCreate.value.order_id),
    order_number: order?.order_number || '',
    buyer_name: order?.buyer_name || '',
    style_name: order?.product_name || '',
    shipping_method: quickCreate.value.shipping_method,
    destination: quickCreate.value.destination,
    created_date: new Date().toISOString().split('T')[0],
    ship_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    status: 'draft',
    total_cartons: 1,
    total_pieces: 300,
    total_weight: 10.0,
    total_volume: 0.06,
    carton_details: [
      {
        carton_number: '001',
        length: 50,
        width: 40,
        height: 30,
        weight: 10,
        sizes: { S: 50, M: 100, L: 100, XL: 50 },
        total_pieces: 300,
      },
    ],
    special_instructions: '',
  }

  packingLists.value.push(packingListData)

  // Auto-print
  selectedPackingList.value = packingListData
  printDialogOpen.value = true

  // Reset quick create
  quickCreate.value = {
    order_id: '',
    shipping_method: '',
    destination: '',
  }
}

function printPackingList(packingList) {
  selectedPackingList.value = packingList
  printDialogOpen.value = true
}

function viewDetails(packingList) {
  selectedPackingList.value = packingList
  printDialogOpen.value = true
}

function printDocument() {
  // eslint-disable-next-line no-alert
  alert(`Printing packing list ${selectedPackingList.value.packing_list_number}...`)
  printDialogOpen.value = false
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
          Packing List Management
        </h1>
        <p class="text-muted-foreground">
          Print Detail Packing List sesuai workflow ERP.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="refreshData">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" @click="openCreateDialog">
          <Plus class="h-4 w-4 mr-2" />
          Create Packing List
        </Button>
      </div>
    </div>

    <!-- Packing List Summary Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Packing Lists
          </CardTitle>
          <Package class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-600">
            {{ totalPackingLists }}
          </div>
          <p class="text-xs text-muted-foreground">
            this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Ready to Ship
          </CardTitle>
          <Truck class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">
            {{ readyToShip }}
          </div>
          <p class="text-xs text-muted-foreground">
            packages ready
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Cartons
          </CardTitle>
          <Box class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-purple-600">
            {{ totalCartons }}
          </div>
          <p class="text-xs text-muted-foreground">
            cartons packed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Pieces
          </CardTitle>
          <ShirtIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600">
            {{ totalPieces }}
          </div>
          <p class="text-xs text-muted-foreground">
            pieces packed
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Create Packing List -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <ClipboardList class="h-5 w-5" />
          <span>Quick Create Packing List</span>
        </CardTitle>
        <CardDescription>Create new packing list for completed orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Order</Label>
            <Select v-model="quickCreate.order_id">
              <SelectTrigger>
                <SelectValue placeholder="Select Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="order in completedOrders" :key="order.id" :value="order.id">
                  {{ order.order_number }} - {{ order.buyer_name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Shipping Method</Label>
            <Select v-model="quickCreate.shipping_method">
              <SelectTrigger>
                <SelectValue placeholder="Select Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="air">
                  Air Freight
                </SelectItem>
                <SelectItem value="sea">
                  Sea Freight
                </SelectItem>
                <SelectItem value="express">
                  Express Courier
                </SelectItem>
                <SelectItem value="truck">
                  Truck Delivery
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Destination</Label>
            <Input v-model="quickCreate.destination" placeholder="Destination address" />
          </div>

          <div class="flex items-end">
            <Button :disabled="!canCreateQuick" class="w-full" @click="createQuickPackingList">
              <FileText class="h-4 w-4 mr-2" />
              Create & Print
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Packing List History -->
    <Card>
      <CardHeader>
        <CardTitle>Packing List History</CardTitle>
        <CardDescription>Recent packing lists and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- Search and Filter -->
          <div class="flex items-center space-x-2">
            <div class="relative flex-1">
              <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Search packing lists..."
                class="pl-8"
              />
            </div>
            <Select v-model="statusFilter">
              <SelectTrigger class="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Status
                </SelectItem>
                <SelectItem value="draft">
                  Draft
                </SelectItem>
                <SelectItem value="confirmed">
                  Confirmed
                </SelectItem>
                <SelectItem value="shipped">
                  Shipped
                </SelectItem>
                <SelectItem value="delivered">
                  Delivered
                </SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="buyerFilter">
              <SelectTrigger class="w-[200px]">
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
          </div>

          <!-- Packing Lists Table -->
          <div class="border rounded-lg">
            <table class="w-full">
              <thead class="border-b bg-muted/50">
                <tr>
                  <th class="p-3 text-left font-medium">
                    Packing List #
                  </th>
                  <th class="p-3 text-left font-medium">
                    Order
                  </th>
                  <th class="p-3 text-left font-medium">
                    Buyer
                  </th>
                  <th class="p-3 text-left font-medium">
                    Cartons
                  </th>
                  <th class="p-3 text-left font-medium">
                    Total Pcs
                  </th>
                  <th class="p-3 text-left font-medium">
                    Shipping Method
                  </th>
                  <th class="p-3 text-left font-medium">
                    Status
                  </th>
                  <th class="p-3 text-left font-medium">
                    Created Date
                  </th>
                  <th class="p-3 text-left font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="packingList in filteredPackingLists" :key="packingList.id" class="border-b hover:bg-muted/25">
                  <td class="p-3">
                    <div class="font-medium">
                      {{ packingList.packing_list_number }}
                    </div>
                  </td>
                  <td class="p-3">
                    <div class="font-medium">
                      {{ packingList.order_number }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ packingList.style_name }}
                    </div>
                  </td>
                  <td class="p-3">
                    {{ packingList.buyer_name }}
                  </td>
                  <td class="p-3 font-medium">
                    {{ packingList.total_cartons }}
                  </td>
                  <td class="p-3 font-medium">
                    {{ packingList.total_pieces }}
                  </td>
                  <td class="p-3">
                    <Badge variant="outline">
                      {{ packingList.shipping_method }}
                    </Badge>
                  </td>
                  <td class="p-3">
                    <Badge :variant="getStatusBadgeVariant(packingList.status)">
                      {{ packingList.status }}
                    </Badge>
                  </td>
                  <td class="p-3">
                    {{ formatDate(packingList.created_date) }}
                  </td>
                  <td class="p-3">
                    <div class="flex items-center space-x-2">
                      <Button variant="outline" size="sm" @click="printPackingList(packingList)">
                        <Printer class="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" @click="viewDetails(packingList)">
                        <Eye class="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" @click="editPackingList(packingList)">
                        <Edit class="h-4 w-4" />
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

    <!-- Create/Edit Packing List Dialog -->
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
      <DialogContent class="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? 'Edit Packing List' : 'Create Packing List' }}
          </DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Update packing list information.' : 'Create detailed packing list for shipment.' }}
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-6 py-4">
          <!-- Basic Information -->
          <div class="space-y-4">
            <h4 class="font-semibold">
              Basic Information
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label>Order *</Label>
                <Select v-model="formData.order_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="order in completedOrders" :key="order.id" :value="order.id">
                      {{ order.order_number }} - {{ order.buyer_name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Packing List Number</Label>
                <Input v-model="formData.packing_list_number" placeholder="Auto-generated" readonly />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <Label>Shipping Method *</Label>
                <Select v-model="formData.shipping_method">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="air">
                      Air Freight
                    </SelectItem>
                    <SelectItem value="sea">
                      Sea Freight
                    </SelectItem>
                    <SelectItem value="express">
                      Express Courier
                    </SelectItem>
                    <SelectItem value="truck">
                      Truck Delivery
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Destination *</Label>
                <Input v-model="formData.destination" placeholder="Destination address" />
              </div>

              <div>
                <Label>Expected Ship Date</Label>
                <Input v-model="formData.ship_date" type="date" />
              </div>
            </div>
          </div>

          <!-- Carton Details -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="font-semibold">
                Carton Details
              </h4>
              <Button variant="outline" size="sm" @click="addCarton">
                <Plus class="h-4 w-4 mr-2" />
                Add Carton
              </Button>
            </div>

            <div class="border rounded-lg">
              <table class="w-full">
                <thead class="border-b bg-muted/50">
                  <tr>
                    <th class="p-2 text-left font-medium">
                      Carton #
                    </th>
                    <th class="p-2 text-left font-medium">
                      Dimensions
                    </th>
                    <th class="p-2 text-left font-medium">
                      Size Breakdown
                    </th>
                    <th class="p-2 text-left font-medium">
                      Total Pcs
                    </th>
                    <th class="p-2 text-left font-medium">
                      Weight (kg)
                    </th>
                    <th class="p-2 text-left font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(carton, index) in formData.cartons" :key="index" class="border-b">
                    <td class="p-2">
                      <Input v-model="carton.carton_number" class="w-20" />
                    </td>
                    <td class="p-2">
                      <div class="grid grid-cols-3 gap-1">
                        <Input v-model="carton.length" placeholder="L" class="w-16" type="number" />
                        <Input v-model="carton.width" placeholder="W" class="w-16" type="number" />
                        <Input v-model="carton.height" placeholder="H" class="w-16" type="number" />
                      </div>
                    </td>
                    <td class="p-2">
                      <div class="text-xs space-y-1">
                        <div v-for="size in garmentSizes" :key="size" class="flex items-center space-x-2">
                          <span class="w-6">{{ size }}:</span>
                          <Input v-model="carton.sizes[size]" class="w-16" type="number" />
                        </div>
                      </div>
                    </td>
                    <td class="p-2">
                      <span class="font-medium">{{ calculateCartonTotal(carton) }}</span>
                    </td>
                    <td class="p-2">
                      <Input v-model="carton.weight" class="w-20" type="number" step="0.1" />
                    </td>
                    <td class="p-2">
                      <Button variant="outline" size="sm" @click="removeCarton(index)">
                        <Trash2 class="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Summary -->
          <div class="space-y-4">
            <h4 class="font-semibold">
              Summary
            </h4>
            <div class="grid grid-cols-4 gap-4">
              <Card>
                <CardContent class="p-4 text-center">
                  <p class="text-sm text-muted-foreground">
                    Total Cartons
                  </p>
                  <p class="text-2xl font-bold">
                    {{ formData.cartons.length }}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent class="p-4 text-center">
                  <p class="text-sm text-muted-foreground">
                    Total Pieces
                  </p>
                  <p class="text-2xl font-bold">
                    {{ calculateTotalPieces() }}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent class="p-4 text-center">
                  <p class="text-sm text-muted-foreground">
                    Total Weight
                  </p>
                  <p class="text-2xl font-bold">
                    {{ calculateTotalWeight() }} kg
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent class="p-4 text-center">
                  <p class="text-sm text-muted-foreground">
                    Total Volume
                  </p>
                  <p class="text-2xl font-bold">
                    {{ calculateTotalVolume() }} m³
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <Label>Special Instructions</Label>
            <Textarea v-model="formData.special_instructions" placeholder="Special packing or shipping instructions..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="dialogOpen = false">
            Cancel
          </Button>
          <Button :disabled="!canSavePackingList || submitting" @click="savePackingList">
            <span v-if="submitting">Saving...</span>
            <span v-else>{{ isEditing ? 'Update' : 'Create' }} Packing List</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Print Preview Dialog -->
    <Dialog :open="printDialogOpen" @update:open="printDialogOpen = $event">
      <DialogContent class="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Packing List Print Preview</DialogTitle>
          <DialogDescription>
            Preview before printing packing list {{ selectedPackingList?.packing_list_number }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedPackingList" class="space-y-6 py-4">
          <!-- Print Header -->
          <div class="text-center border-b pb-4">
            <h2 class="text-2xl font-bold">
              PACKING LIST
            </h2>
            <p class="text-lg">
              {{ selectedPackingList.packing_list_number }}
            </p>
          </div>

          <!-- Order Information -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold mb-2">
                Order Information
              </h4>
              <div class="space-y-1 text-sm">
                <p><strong>Order Number:</strong> {{ selectedPackingList.order_number }}</p>
                <p><strong>Buyer:</strong> {{ selectedPackingList.buyer_name }}</p>
                <p><strong>Style:</strong> {{ selectedPackingList.style_name }}</p>
                <p><strong>Destination:</strong> {{ selectedPackingList.destination }}</p>
              </div>
            </div>
            <div>
              <h4 class="font-semibold mb-2">
                Shipping Information
              </h4>
              <div class="space-y-1 text-sm">
                <p><strong>Shipping Method:</strong> {{ selectedPackingList.shipping_method }}</p>
                <p><strong>Created Date:</strong> {{ formatDate(selectedPackingList.created_date) }}</p>
                <p><strong>Ship Date:</strong> {{ formatDate(selectedPackingList.ship_date) }}</p>
                <p><strong>Total Cartons:</strong> {{ selectedPackingList.total_cartons }}</p>
              </div>
            </div>
          </div>

          <!-- Carton Details -->
          <div>
            <h4 class="font-semibold mb-2">
              Carton Details
            </h4>
            <div class="border rounded-lg">
              <table class="w-full text-sm">
                <thead class="border-b bg-muted/50">
                  <tr>
                    <th class="p-2 text-left">
                      Carton #
                    </th>
                    <th class="p-2 text-left">
                      Dimensions (L×W×H cm)
                    </th>
                    <th class="p-2 text-left">
                      Size Breakdown
                    </th>
                    <th class="p-2 text-left">
                      Total Pcs
                    </th>
                    <th class="p-2 text-left">
                      Weight (kg)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="carton in selectedPackingList.carton_details" :key="carton.carton_number" class="border-b">
                    <td class="p-2">
                      {{ carton.carton_number }}
                    </td>
                    <td class="p-2">
                      {{ carton.length }}×{{ carton.width }}×{{ carton.height }}
                    </td>
                    <td class="p-2">
                      <div class="grid grid-cols-4 gap-1 text-xs">
                        <div v-for="(qty, size) in carton.sizes" :key="size">
                          {{ size }}: {{ qty }}
                        </div>
                      </div>
                    </td>
                    <td class="p-2">
                      {{ carton.total_pieces }}
                    </td>
                    <td class="p-2">
                      {{ carton.weight }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Summary -->
          <div class="grid grid-cols-4 gap-4 pt-4 border-t">
            <div class="text-center">
              <p class="text-sm text-muted-foreground">
                Total Cartons
              </p>
              <p class="text-lg font-bold">
                {{ selectedPackingList.total_cartons }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-sm text-muted-foreground">
                Total Pieces
              </p>
              <p class="text-lg font-bold">
                {{ selectedPackingList.total_pieces }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-sm text-muted-foreground">
                Total Weight
              </p>
              <p class="text-lg font-bold">
                {{ selectedPackingList.total_weight }} kg
              </p>
            </div>
            <div class="text-center">
              <p class="text-sm text-muted-foreground">
                Total Volume
              </p>
              <p class="text-lg font-bold">
                {{ selectedPackingList.total_volume }} m³
              </p>
            </div>
          </div>

          <div v-if="selectedPackingList.special_instructions">
            <h4 class="font-semibold mb-2">
              Special Instructions
            </h4>
            <p class="text-sm bg-muted p-3 rounded-lg">
              {{ selectedPackingList.special_instructions }}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="printDialogOpen = false">
            Close
          </Button>
          <Button @click="printDocument">
            <Printer class="h-4 w-4 mr-2" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
