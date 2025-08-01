<script setup>
import {
  CheckCircle,
  Clock,
  Edit,
  FileText,
  MapPin,
  Navigation,
  Plus,
  Printer,
  RefreshCw,
  Search,
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
const carrierFilter = ref('all')
const selectedDeliveryNote = ref(null)

// Form data
const formData = ref({
  packing_list_id: '',
  delivery_note_number: '',
  carrier_id: '',
  driver_name: '',
  vehicle_number: '',
  driver_phone: '',
  delivery_date: '',
  estimated_time: '',
  delivery_address: '',
  special_instructions: '',
})

// Quick create
const quickCreate = ref({
  packing_list_id: '',
  carrier_id: '',
  vehicle_number: '',
  delivery_date: '',
})

// Mock data
const availablePackingLists = ref([
  {
    id: 1,
    packing_list_number: 'PL-2025-001',
    buyer_name: 'Macy\'s Inc',
    order_number: 'ORD-001',
    style_name: 'Basic Tee - Red',
    total_cartons: 5,
    total_pieces: 1500,
    total_weight: 45.5,
    total_volume: 1.25,
    destination: 'New York, USA',
  },
  {
    id: 2,
    packing_list_number: 'PL-2025-002',
    buyer_name: 'Walmart',
    order_number: 'ORD-002',
    style_name: 'Premium Polo - Blue',
    total_cartons: 3,
    total_pieces: 900,
    total_weight: 32.1,
    total_volume: 0.95,
    destination: 'California, USA',
  },
])

const carriers = ref([
  { id: 1, name: 'PT Citra Logistik', type: 'Trucking', initials: 'CL' },
  { id: 2, name: 'CV Angkutan Jaya', type: 'Express', initials: 'AJ' },
  { id: 3, name: 'PT Global Shipping', type: 'International', initials: 'GS' },
  { id: 4, name: 'DHL Express', type: 'Express Courier', initials: 'DHL' },
])

const deliveryNotes = ref([
  {
    id: 1,
    delivery_note_number: 'DN-2025-001',
    packing_list_id: 1,
    packing_list_number: 'PL-2025-001',
    order_number: 'ORD-001',
    buyer_name: 'Macy\'s Inc',
    style_name: 'Basic Tee - Red',
    carrier_id: 1,
    carrier_name: 'PT Citra Logistik',
    driver_name: 'Ahmad Wijaya',
    vehicle_number: 'B 1234 ABC',
    driver_phone: '+62 812 3456 7890',
    delivery_date: '2025-08-05',
    estimated_time: '14:00',
    delivery_address: '123 Main Street\nNew York, NY 10001\nUSA',
    created_date: '2025-07-28',
    status: 'in_transit',
    total_cartons: 5,
    total_pieces: 1500,
    total_weight: 45.5,
    total_volume: 1.25,
    special_instructions: 'Handle with care. Deliver to loading dock.',
  },
  {
    id: 2,
    delivery_note_number: 'DN-2025-002',
    packing_list_id: 2,
    packing_list_number: 'PL-2025-002',
    order_number: 'ORD-002',
    buyer_name: 'Walmart',
    style_name: 'Premium Polo - Blue',
    carrier_id: 2,
    carrier_name: 'CV Angkutan Jaya',
    driver_name: 'Budi Santoso',
    vehicle_number: 'D 5678 XYZ',
    driver_phone: '+62 813 9876 5432',
    delivery_date: '2025-08-02',
    estimated_time: '10:00',
    delivery_address: '456 Commerce Ave\nLos Angeles, CA 90001\nUSA',
    created_date: '2025-07-30',
    status: 'delivered',
    total_cartons: 3,
    total_pieces: 900,
    total_weight: 32.1,
    total_volume: 0.95,
    special_instructions: 'Urgent delivery required.',
  },
])

// Computed properties
const totalDeliveryNotes = computed(() => deliveryNotes.value.length)

const inTransit = computed(() => {
  return deliveryNotes.value.filter(dn => dn.status === 'in_transit').length
})

const deliveredCount = computed(() => {
  return deliveryNotes.value.filter(dn => dn.status === 'delivered').length
})

const onTimeDeliveryRate = computed(() => {
  const delivered = deliveryNotes.value.filter(dn => dn.status === 'delivered')
  if (delivered.length === 0)
    return 100

  const onTime = delivered.filter((_dn) => {
    // Mock calculation - in real app would compare actual vs expected delivery
    return true // Assume all delivered on time for demo
  })

  return Math.round((onTime.length / delivered.length) * 100)
})

const recentDeliveries = computed(() => {
  return [...deliveryNotes.value]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5)
})

const carrierPerformance = computed(() => {
  return carriers.value.map((carrier) => {
    const carrierDeliveries = deliveryNotes.value.filter(dn => dn.carrier_id === carrier.id)
    const delivered = carrierDeliveries.filter(dn => dn.status === 'delivered')

    let onTimeRate = 100
    if (delivered.length > 0) {
      // Mock calculation - all delivered on time for demo
      onTimeRate = 100
    }

    return {
      ...carrier,
      total_deliveries: carrierDeliveries.length,
      on_time_rate: onTimeRate,
    }
  }).sort((a, b) => b.on_time_rate - a.on_time_rate)
})

const filteredDeliveryNotes = computed(() => {
  let filtered = deliveryNotes.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(dn =>
      dn.delivery_note_number.toLowerCase().includes(query)
      || dn.packing_list_number.toLowerCase().includes(query)
      || dn.buyer_name.toLowerCase().includes(query)
      || dn.carrier_name.toLowerCase().includes(query)
      || dn.vehicle_number.toLowerCase().includes(query),
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(dn => dn.status === statusFilter.value)
  }

  if (carrierFilter.value !== 'all') {
    filtered = filtered.filter(dn => dn.carrier_id === Number.parseInt(carrierFilter.value))
  }

  return filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
})

const canCreateQuick = computed(() => {
  return quickCreate.value.packing_list_id && quickCreate.value.carrier_id
    && quickCreate.value.vehicle_number && quickCreate.value.delivery_date
})

const canSaveDeliveryNote = computed(() => {
  return formData.value.packing_list_id && formData.value.carrier_id
    && formData.value.vehicle_number && formData.value.delivery_date
    && formData.value.delivery_address
})

// Methods
function getStatusBadgeVariant(status) {
  const variants = {
    pending: 'secondary',
    in_transit: 'default',
    delivered: 'default',
    returned: 'destructive',
  }
  return variants[status] || 'secondary'
}

function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-500',
    in_transit: 'bg-blue-500',
    delivered: 'bg-green-500',
    returned: 'bg-red-500',
  }
  return colors[status] || 'bg-gray-500'
}

function isOverdue(deliveryNote) {
  if (deliveryNote.status === 'delivered')
    return false
  const today = new Date().toISOString().split('T')[0]
  return deliveryNote.delivery_date < today
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString()
}

function generateDeliveryNoteNumber() {
  const year = new Date().getFullYear()
  const count = deliveryNotes.value.length + 1
  return `DN-${year}-${count.toString().padStart(3, '0')}`
}

function openCreateDialog() {
  isEditing.value = false
  resetForm()
  formData.value.delivery_note_number = generateDeliveryNoteNumber()
  dialogOpen.value = true
}

function resetForm() {
  formData.value = {
    packing_list_id: '',
    delivery_note_number: '',
    carrier_id: '',
    driver_name: '',
    vehicle_number: '',
    driver_phone: '',
    delivery_date: '',
    estimated_time: '',
    delivery_address: '',
    special_instructions: '',
  }
}

function saveDeliveryNote() {
  if (!canSaveDeliveryNote.value)
    return

  submitting.value = true

  setTimeout(() => {
    const packingList = availablePackingLists.value.find(pl => pl.id === Number.parseInt(formData.value.packing_list_id))
    const carrier = carriers.value.find(c => c.id === Number.parseInt(formData.value.carrier_id))

    const deliveryNoteData = {
      ...formData.value,
      packing_list_number: packingList?.packing_list_number || '',
      order_number: packingList?.order_number || '',
      buyer_name: packingList?.buyer_name || '',
      style_name: packingList?.style_name || '',
      carrier_name: carrier?.name || '',
      created_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      total_cartons: packingList?.total_cartons || 0,
      total_pieces: packingList?.total_pieces || 0,
      total_weight: packingList?.total_weight || 0,
      total_volume: packingList?.total_volume || 0,
    }

    if (isEditing.value) {
      const index = deliveryNotes.value.findIndex(dn => dn.id === formData.value.id)
      if (index !== -1) {
        deliveryNotes.value[index] = { ...deliveryNoteData, id: formData.value.id }
      }
    }
    else {
      deliveryNotes.value.push({
        id: Date.now(),
        ...deliveryNoteData,
      })
    }

    submitting.value = false
    dialogOpen.value = false
    resetForm()
  }, 1000)
}

function createQuickDeliveryNote() {
  if (!canCreateQuick.value)
    return

  const packingList = availablePackingLists.value.find(pl => pl.id === Number.parseInt(quickCreate.value.packing_list_id))
  const carrier = carriers.value.find(c => c.id === Number.parseInt(quickCreate.value.carrier_id))

  const deliveryNoteData = {
    id: Date.now(),
    delivery_note_number: generateDeliveryNoteNumber(),
    packing_list_id: Number.parseInt(quickCreate.value.packing_list_id),
    packing_list_number: packingList?.packing_list_number || '',
    order_number: packingList?.order_number || '',
    buyer_name: packingList?.buyer_name || '',
    style_name: packingList?.style_name || '',
    carrier_id: Number.parseInt(quickCreate.value.carrier_id),
    carrier_name: carrier?.name || '',
    driver_name: '',
    vehicle_number: quickCreate.value.vehicle_number,
    driver_phone: '',
    delivery_date: quickCreate.value.delivery_date,
    estimated_time: '',
    delivery_address: packingList?.destination || '',
    created_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    total_cartons: packingList?.total_cartons || 0,
    total_pieces: packingList?.total_pieces || 0,
    total_weight: packingList?.total_weight || 0,
    total_volume: packingList?.total_volume || 0,
    special_instructions: '',
  }

  deliveryNotes.value.push(deliveryNoteData)

  // Auto-print
  selectedDeliveryNote.value = deliveryNoteData
  printDialogOpen.value = true

  // Reset quick create
  quickCreate.value = {
    packing_list_id: '',
    carrier_id: '',
    vehicle_number: '',
    delivery_date: '',
  }
}

function printDeliveryNote(deliveryNote) {
  selectedDeliveryNote.value = deliveryNote
  printDialogOpen.value = true
}

function trackDelivery(deliveryNote) {
  // eslint-disable-next-line no-alert
  alert(`Tracking delivery ${deliveryNote.delivery_note_number}:\n\nStatus: ${deliveryNote.status}\nCarrier: ${deliveryNote.carrier_name}\nVehicle: ${deliveryNote.vehicle_number}\nDriver: ${deliveryNote.driver_name || 'TBD'}`)
}

function updateStatus(deliveryNote) {
  // eslint-disable-next-line no-alert
  const newStatus = prompt(`Update status for ${deliveryNote.delivery_note_number}:\n\nCurrent: ${deliveryNote.status}\n\nEnter new status (pending/in_transit/delivered/returned):`)
  if (newStatus && ['pending', 'in_transit', 'delivered', 'returned'].includes(newStatus)) {
    const index = deliveryNotes.value.findIndex(dn => dn.id === deliveryNote.id)
    if (index !== -1) {
      deliveryNotes.value[index].status = newStatus
    }
  }
}

function printDocument() {
  // eslint-disable-next-line no-alert
  alert(`Printing delivery note ${selectedDeliveryNote.value.delivery_note_number}...`)
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
          Delivery Note Management
        </h1>
        <p class="text-muted-foreground">
          Print Surat Jalan sesuai workflow ERP.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="refreshData">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" @click="openCreateDialog">
          <Plus class="h-4 w-4 mr-2" />
          Create Delivery Note
        </Button>
      </div>
    </div>

    <!-- Delivery Note Summary Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Deliveries
          </CardTitle>
          <Truck class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-600">
            {{ totalDeliveryNotes }}
          </div>
          <p class="text-xs text-muted-foreground">
            this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            In Transit
          </CardTitle>
          <Navigation class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-orange-600">
            {{ inTransit }}
          </div>
          <p class="text-xs text-muted-foreground">
            shipments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Delivered
          </CardTitle>
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">
            {{ deliveredCount }}
          </div>
          <p class="text-xs text-muted-foreground">
            completed
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
          <div class="text-2xl font-bold text-purple-600">
            {{ onTimeDeliveryRate }}%
          </div>
          <p class="text-xs text-muted-foreground">
            performance
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Create Delivery Note -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <FileText class="h-5 w-5" />
          <span>Quick Create Delivery Note</span>
        </CardTitle>
        <CardDescription>Create delivery note from packing list</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label>Packing List</Label>
            <Select v-model="quickCreate.packing_list_id">
              <SelectTrigger>
                <SelectValue placeholder="Select Packing List" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="pl in availablePackingLists" :key="pl.id" :value="pl.id">
                  {{ pl.packing_list_number }} - {{ pl.buyer_name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Carrier</Label>
            <Select v-model="quickCreate.carrier_id">
              <SelectTrigger>
                <SelectValue placeholder="Select Carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="carrier in carriers" :key="carrier.id" :value="carrier.id">
                  {{ carrier.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Vehicle Number</Label>
            <Input v-model="quickCreate.vehicle_number" placeholder="B 1234 ABC" />
          </div>

          <div>
            <Label>Delivery Date</Label>
            <Input v-model="quickCreate.delivery_date" type="date" />
          </div>

          <div class="flex items-end">
            <Button :disabled="!canCreateQuick" class="w-full" @click="createQuickDeliveryNote">
              <FileText class="h-4 w-4 mr-2" />
              Create & Print
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Delivery Status Tracking -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Recent Shipments -->
      <Card>
        <CardHeader>
          <CardTitle>Recent Shipments</CardTitle>
          <CardDescription>Latest delivery notes and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="delivery in recentDeliveries" :key="delivery.id" class="flex items-center justify-between p-3 border rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="getStatusColor(delivery.status)">
                  <Truck class="h-4 w-4 text-white" />
                </div>
                <div>
                  <p class="font-medium">
                    {{ delivery.delivery_note_number }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ delivery.buyer_name }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <Badge :variant="getStatusBadgeVariant(delivery.status)">
                  {{ delivery.status.replace('_', ' ') }}
                </Badge>
                <p class="text-xs text-muted-foreground">
                  {{ formatDate(delivery.delivery_date) }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Carrier Performance -->
      <Card>
        <CardHeader>
          <CardTitle>Carrier Performance</CardTitle>
          <CardDescription>Delivery performance by carrier</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="carrier in carrierPerformance" :key="carrier.id" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-xs font-bold text-blue-600">{{ carrier.initials }}</span>
                </div>
                <div>
                  <p class="font-medium">
                    {{ carrier.name }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ carrier.type }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold">
                  {{ carrier.on_time_rate }}%
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ carrier.total_deliveries }} deliveries
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Delivery Notes History -->
    <Card>
      <CardHeader>
        <CardTitle>Delivery Notes History</CardTitle>
        <CardDescription>All delivery notes and tracking information</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- Search and Filter -->
          <div class="flex items-center space-x-2">
            <div class="relative flex-1">
              <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Search delivery notes..."
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
                <SelectItem value="pending">
                  Pending
                </SelectItem>
                <SelectItem value="in_transit">
                  In Transit
                </SelectItem>
                <SelectItem value="delivered">
                  Delivered
                </SelectItem>
                <SelectItem value="returned">
                  Returned
                </SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="carrierFilter">
              <SelectTrigger class="w-[200px]">
                <SelectValue placeholder="Filter by carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Carriers
                </SelectItem>
                <SelectItem v-for="carrier in carriers" :key="carrier.id" :value="carrier.id">
                  {{ carrier.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Delivery Notes Table -->
          <div class="border rounded-lg">
            <table class="w-full">
              <thead class="border-b bg-muted/50">
                <tr>
                  <th class="p-3 text-left font-medium">
                    Delivery Note #
                  </th>
                  <th class="p-3 text-left font-medium">
                    Packing List
                  </th>
                  <th class="p-3 text-left font-medium">
                    Buyer
                  </th>
                  <th class="p-3 text-left font-medium">
                    Carrier
                  </th>
                  <th class="p-3 text-left font-medium">
                    Vehicle
                  </th>
                  <th class="p-3 text-left font-medium">
                    Delivery Date
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
                <tr v-for="deliveryNote in filteredDeliveryNotes" :key="deliveryNote.id" class="border-b hover:bg-muted/25">
                  <td class="p-3">
                    <div class="font-medium">
                      {{ deliveryNote.delivery_note_number }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ formatDate(deliveryNote.created_date) }}
                    </div>
                  </td>
                  <td class="p-3">
                    <div class="font-medium">
                      {{ deliveryNote.packing_list_number }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ deliveryNote.order_number }}
                    </div>
                  </td>
                  <td class="p-3">
                    {{ deliveryNote.buyer_name }}
                  </td>
                  <td class="p-3">
                    {{ deliveryNote.carrier_name }}
                  </td>
                  <td class="p-3">
                    <Badge variant="outline">
                      {{ deliveryNote.vehicle_number }}
                    </Badge>
                  </td>
                  <td class="p-3">
                    <div>{{ formatDate(deliveryNote.delivery_date) }}</div>
                    <div v-if="isOverdue(deliveryNote)" class="text-xs text-red-600">
                      Overdue
                    </div>
                  </td>
                  <td class="p-3">
                    <Badge :variant="getStatusBadgeVariant(deliveryNote.status)">
                      {{ deliveryNote.status.replace('_', ' ') }}
                    </Badge>
                  </td>
                  <td class="p-3">
                    <div class="flex items-center space-x-2">
                      <Button variant="outline" size="sm" @click="printDeliveryNote(deliveryNote)">
                        <Printer class="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" @click="trackDelivery(deliveryNote)">
                        <MapPin class="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" @click="updateStatus(deliveryNote)">
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

    <!-- Create/Edit Delivery Note Dialog -->
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? 'Edit Delivery Note' : 'Create Delivery Note' }}
          </DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Update delivery note information.' : 'Create new delivery note for shipment.' }}
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Packing List *</Label>
              <Select v-model="formData.packing_list_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select Packing List" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="pl in availablePackingLists" :key="pl.id" :value="pl.id">
                    {{ pl.packing_list_number }} - {{ pl.buyer_name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Delivery Note Number</Label>
              <Input v-model="formData.delivery_note_number" placeholder="Auto-generated" readonly />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Carrier *</Label>
              <Select v-model="formData.carrier_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select Carrier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="carrier in carriers" :key="carrier.id" :value="carrier.id">
                    {{ carrier.name }} - {{ carrier.type }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Driver Name</Label>
              <Input v-model="formData.driver_name" placeholder="Driver name" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Vehicle Number *</Label>
              <Input v-model="formData.vehicle_number" placeholder="B 1234 ABC" />
            </div>

            <div>
              <Label>Driver Phone</Label>
              <Input v-model="formData.driver_phone" placeholder="+62 812 3456 7890" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Delivery Date *</Label>
              <Input v-model="formData.delivery_date" type="date" />
            </div>

            <div>
              <Label>Estimated Time</Label>
              <Input v-model="formData.estimated_time" type="time" />
            </div>
          </div>

          <div>
            <Label>Delivery Address *</Label>
            <Textarea v-model="formData.delivery_address" placeholder="Complete delivery address..." />
          </div>

          <div>
            <Label>Special Instructions</Label>
            <Textarea v-model="formData.special_instructions" placeholder="Special delivery instructions..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="dialogOpen = false">
            Cancel
          </Button>
          <Button :disabled="!canSaveDeliveryNote || submitting" @click="saveDeliveryNote">
            <span v-if="submitting">Saving...</span>
            <span v-else>{{ isEditing ? 'Update' : 'Create' }} Delivery Note</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Print Preview Dialog -->
    <Dialog :open="printDialogOpen" @update:open="printDialogOpen = $event">
      <DialogContent class="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Delivery Note Print Preview</DialogTitle>
          <DialogDescription>
            Preview before printing delivery note {{ selectedDeliveryNote?.delivery_note_number }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedDeliveryNote" class="space-y-6 py-4">
          <!-- Print Header -->
          <div class="text-center border-b pb-4">
            <h2 class="text-2xl font-bold">
              SURAT JALAN / DELIVERY NOTE
            </h2>
            <p class="text-lg">
              {{ selectedDeliveryNote.delivery_note_number }}
            </p>
          </div>

          <!-- Company and Delivery Information -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold mb-2">
                From (Shipper)
              </h4>
              <div class="space-y-1 text-sm">
                <p><strong>PT. Garment Manufacturing</strong></p>
                <p>Jl. Industri No. 123</p>
                <p>Bandung, West Java 40123</p>
                <p>Phone: +62 22 1234 5678</p>
              </div>
            </div>
            <div>
              <h4 class="font-semibold mb-2">
                To (Consignee)
              </h4>
              <div class="space-y-1 text-sm">
                <p><strong>{{ selectedDeliveryNote.buyer_name }}</strong></p>
                <div v-html="selectedDeliveryNote.delivery_address?.replace(/\n/g, '<br>')"></div>
              </div>
            </div>
          </div>

          <!-- Shipment Details -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold mb-2">
                Shipment Information
              </h4>
              <div class="space-y-1 text-sm">
                <p><strong>Packing List:</strong> {{ selectedDeliveryNote.packing_list_number }}</p>
                <p><strong>Order Number:</strong> {{ selectedDeliveryNote.order_number }}</p>
                <p><strong>Delivery Date:</strong> {{ formatDate(selectedDeliveryNote.delivery_date) }}</p>
                <p><strong>Estimated Time:</strong> {{ selectedDeliveryNote.estimated_time || 'TBD' }}</p>
              </div>
            </div>
            <div>
              <h4 class="font-semibold mb-2">
                Carrier Information
              </h4>
              <div class="space-y-1 text-sm">
                <p><strong>Carrier:</strong> {{ selectedDeliveryNote.carrier_name }}</p>
                <p><strong>Vehicle Number:</strong> {{ selectedDeliveryNote.vehicle_number }}</p>
                <p><strong>Driver:</strong> {{ selectedDeliveryNote.driver_name || 'TBD' }}</p>
                <p><strong>Driver Phone:</strong> {{ selectedDeliveryNote.driver_phone || 'TBD' }}</p>
              </div>
            </div>
          </div>

          <!-- Package Details -->
          <div>
            <h4 class="font-semibold mb-2">
              Package Details
            </h4>
            <div class="border rounded-lg">
              <table class="w-full text-sm">
                <thead class="border-b bg-muted/50">
                  <tr>
                    <th class="p-3 text-left">
                      Description
                    </th>
                    <th class="p-3 text-left">
                      Cartons
                    </th>
                    <th class="p-3 text-left">
                      Total Pieces
                    </th>
                    <th class="p-3 text-left">
                      Weight (kg)
                    </th>
                    <th class="p-3 text-left">
                      Volume (m³)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b">
                    <td class="p-3">
                      {{ selectedDeliveryNote.style_name }}
                    </td>
                    <td class="p-3">
                      {{ selectedDeliveryNote.total_cartons }}
                    </td>
                    <td class="p-3">
                      {{ selectedDeliveryNote.total_pieces }}
                    </td>
                    <td class="p-3">
                      {{ selectedDeliveryNote.total_weight }}
                    </td>
                    <td class="p-3">
                      {{ selectedDeliveryNote.total_volume }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Special Instructions -->
          <div v-if="selectedDeliveryNote.special_instructions">
            <h4 class="font-semibold mb-2">
              Special Instructions
            </h4>
            <p class="text-sm bg-muted p-3 rounded-lg">
              {{ selectedDeliveryNote.special_instructions }}
            </p>
          </div>

          <!-- Signatures -->
          <div class="grid grid-cols-3 gap-6 pt-6 border-t">
            <div class="text-center">
              <div class="h-16 border-b mb-2"></div>
              <p class="text-sm">
                Shipper Signature
              </p>
              <p class="text-xs text-muted-foreground">
                Name & Date
              </p>
            </div>
            <div class="text-center">
              <div class="h-16 border-b mb-2"></div>
              <p class="text-sm">
                Carrier Signature
              </p>
              <p class="text-xs text-muted-foreground">
                Name & Date
              </p>
            </div>
            <div class="text-center">
              <div class="h-16 border-b mb-2"></div>
              <p class="text-sm">
                Receiver Signature
              </p>
              <p class="text-xs text-muted-foreground">
                Name & Date
              </p>
            </div>
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
