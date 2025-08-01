<script setup>
import {
  Activity,
  Clock,
  Edit,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Target,
  Trash2,
  TrendingUp,
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
const lineFilter = ref('all')

// Form data
const formData = ref({
  line_id: '',
  order_id: '',
  date: new Date().toISOString().split('T')[0],
  hour: '',
  quantity: '',
  notes: '',
})

// Quick entry
const quickEntry = ref({
  line_id: '',
  order_id: '',
  hour: '',
  quantity: '',
})

// Mock data - replace with real store data
const productionLines = ref([
  { id: 1, name: 'Line A1', capacity: 150, status: 'active', current_order: 'ORD-001', today_output: 1200, efficiency: 85 },
  { id: 2, name: 'Line A2', capacity: 120, status: 'active', current_order: 'ORD-002', today_output: 900, efficiency: 78 },
  { id: 3, name: 'Line B1', capacity: 180, status: 'idle', current_order: null, today_output: 0, efficiency: 0 },
  { id: 4, name: 'Line B2', capacity: 160, status: 'maintenance', current_order: null, today_output: 0, efficiency: 0 },
])

const activeOrders = ref([
  { id: 1, order_number: 'ORD-001', product_name: 'Basic Tee - Red' },
  { id: 2, order_number: 'ORD-002', product_name: 'Premium Polo - Blue' },
  { id: 3, order_number: 'ORD-003', product_name: 'Hoodie - Black' },
])

const productionEntries = ref([
  {
    id: 1,
    date: '2025-08-01',
    hour: '08:00',
    line_id: 1,
    line_name: 'Line A1',
    order_id: 1,
    order_number: 'ORD-001',
    style_name: 'Basic Tee - Red',
    quantity: 150,
    notes: '',
  },
  {
    id: 2,
    date: '2025-08-01',
    hour: '09:00',
    line_id: 1,
    line_name: 'Line A1',
    order_id: 1,
    order_number: 'ORD-001',
    style_name: 'Basic Tee - Red',
    quantity: 140,
    notes: 'Slower due to new operator',
  },
  {
    id: 3,
    date: '2025-08-01',
    hour: '08:00',
    line_id: 2,
    line_name: 'Line A2',
    order_id: 2,
    order_number: 'ORD-002',
    style_name: 'Premium Polo - Blue',
    quantity: 120,
    notes: '',
  },
])

// Computed properties
const todayProduction = computed(() => {
  return productionEntries.value
    .filter(entry => entry.date === new Date().toISOString().split('T')[0])
    .reduce((sum, entry) => sum + entry.quantity, 0)
})

const activeLines = computed(() => {
  return productionLines.value.filter(line => line.status === 'active')
})

const totalLines = computed(() => productionLines.value.length)

const averageHourlyRate = computed(() => {
  const activeEntries = productionEntries.value.filter(entry =>
    entry.date === new Date().toISOString().split('T')[0],
  )
  if (activeEntries.length === 0)
    return 0

  const totalOutput = activeEntries.reduce((sum, entry) => sum + entry.quantity, 0)
  return Math.round(totalOutput / activeEntries.length)
})

const efficiency = computed(() => {
  const totalCapacity = activeLines.value.reduce((sum, line) => sum + line.capacity, 0)
  if (totalCapacity === 0)
    return 0

  return Math.round((averageHourlyRate.value / (totalCapacity / activeLines.value.length)) * 100)
})

const filteredEntries = computed(() => {
  let filtered = productionEntries.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(entry =>
      entry.order_number.toLowerCase().includes(query)
      || entry.style_name.toLowerCase().includes(query)
      || entry.line_name.toLowerCase().includes(query),
    )
  }

  if (lineFilter.value !== 'all') {
    filtered = filtered.filter(entry => entry.line_id === Number.parseInt(lineFilter.value))
  }

  return filtered.sort((a, b) => new Date(`${b.date} ${b.hour}`) - new Date(`${a.date} ${a.hour}`))
})

const canSaveEntry = computed(() => {
  return formData.value.line_id && formData.value.order_id
    && formData.value.date && formData.value.hour && formData.value.quantity
})

const canSaveQuickEntry = computed(() => {
  return quickEntry.value.line_id && quickEntry.value.order_id
    && quickEntry.value.hour && quickEntry.value.quantity
})

// Methods
function getLineStatusClass(line) {
  return {
    'border-green-200 bg-green-50': line.status === 'active',
    'border-yellow-200 bg-yellow-50': line.status === 'idle',
    'border-red-200 bg-red-50': line.status === 'maintenance',
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString()
}

function openAddDialog() {
  isEditing.value = false
  resetForm()
  dialogOpen.value = true
}

function editEntry(entry) {
  isEditing.value = true
  formData.value = { ...entry }
  dialogOpen.value = true
}

function resetForm() {
  formData.value = {
    line_id: '',
    order_id: '',
    date: new Date().toISOString().split('T')[0],
    hour: '',
    quantity: '',
    notes: '',
  }
}

function saveEntry() {
  if (!canSaveEntry.value)
    return

  submitting.value = true

  // Simulate API call
  setTimeout(() => {
    if (isEditing.value) {
      const index = productionEntries.value.findIndex(e => e.id === formData.value.id)
      if (index !== -1) {
        productionEntries.value[index] = { ...formData.value }
      }
    }
    else {
      const line = productionLines.value.find(l => l.id === Number.parseInt(formData.value.line_id))
      const order = activeOrders.value.find(o => o.id === Number.parseInt(formData.value.order_id))

      productionEntries.value.push({
        id: Date.now(),
        ...formData.value,
        line_name: line?.name || '',
        order_number: order?.order_number || '',
        style_name: order?.product_name || '',
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

  const line = productionLines.value.find(l => l.id === Number.parseInt(quickEntry.value.line_id))
  const order = activeOrders.value.find(o => o.id === Number.parseInt(quickEntry.value.order_id))

  productionEntries.value.push({
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    hour: quickEntry.value.hour,
    line_id: Number.parseInt(quickEntry.value.line_id),
    line_name: line?.name || '',
    order_id: Number.parseInt(quickEntry.value.order_id),
    order_number: order?.order_number || '',
    style_name: order?.product_name || '',
    quantity: Number.parseInt(quickEntry.value.quantity),
    notes: '',
  })

  // Reset quick entry
  quickEntry.value = {
    line_id: '',
    order_id: '',
    hour: '',
    quantity: '',
  }
}

function deleteEntry(entry) {
  // eslint-disable-next-line no-alert
  if (confirm('Are you sure you want to delete this production entry?')) {
    const index = productionEntries.value.findIndex(e => e.id === entry.id)
    if (index !== -1) {
      productionEntries.value.splice(index, 1)
    }
  }
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
          Production Input
        </h1>
        <p class="text-muted-foreground">
          Input production per jam/per line sesuai workflow ERP.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="refreshData">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" @click="openAddDialog">
          <Plus class="h-4 w-4 mr-2" />
          Add Production Entry
        </Button>
      </div>
    </div>

    <!-- Production Summary Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Today's Production
          </CardTitle>
          <Clock class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ todayProduction }}
          </div>
          <p class="text-xs text-muted-foreground">
            pieces today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Active Lines
          </CardTitle>
          <Activity class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ activeLines.length }}
          </div>
          <p class="text-xs text-muted-foreground">
            of {{ totalLines }} lines
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Avg Hourly Rate
          </CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ averageHourlyRate }}
          </div>
          <p class="text-xs text-muted-foreground">
            pcs/hour
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Efficiency
          </CardTitle>
          <Target class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ efficiency }}%
          </div>
          <p class="text-xs text-muted-foreground">
            target achievement
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Production Input -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <Settings class="h-5 w-5" />
          <span>Quick Production Input</span>
        </CardTitle>
        <CardDescription>Input production per jam/per line</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label>Production Line</Label>
            <Select v-model="quickEntry.line_id">
              <SelectTrigger>
                <SelectValue placeholder="Select Line" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="line in productionLines" :key="line.id" :value="line.id">
                  {{ line.name }} - {{ line.capacity }}/hr
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Order/Style</Label>
            <Select v-model="quickEntry.order_id">
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
            <Label>Hour</Label>
            <Input v-model="quickEntry.hour" type="time" />
          </div>

          <div>
            <Label>Quantity Produced</Label>
            <Input v-model="quickEntry.quantity" type="number" placeholder="0" />
          </div>

          <div class="flex items-end">
            <Button :disabled="!canSaveQuickEntry" class="w-full" @click="saveQuickEntry">
              <Save class="h-4 w-4 mr-2" />
              Save Entry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Production Lines Status -->
    <Card>
      <CardHeader>
        <CardTitle>Production Lines Status</CardTitle>
        <CardDescription>Real-time status of all production lines</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card v-for="line in productionLines" :key="line.id" :class="getLineStatusClass(line)">
            <CardContent class="p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold">
                  {{ line.name }}
                </h4>
                <Badge :variant="line.status === 'active' ? 'default' : 'secondary'">
                  {{ line.status }}
                </Badge>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Current Order:</span>
                  <span class="font-medium">{{ line.current_order || 'None' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Today's Output:</span>
                  <span class="font-medium">{{ line.today_output || 0 }} pcs</span>
                </div>
                <div class="flex justify-between">
                  <span>Efficiency:</span>
                  <span class="font-medium">{{ line.efficiency || 0 }}%</span>
                </div>
                <div class="flex justify-between">
                  <span>Capacity:</span>
                  <span class="font-medium">{{ line.capacity }}/hr</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Production History -->
    <Card>
      <CardHeader>
        <CardTitle>Production History</CardTitle>
        <CardDescription>Recent production entries</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- Search and Filter -->
          <div class="flex items-center space-x-2">
            <div class="relative flex-1">
              <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Search production entries..."
                class="pl-8"
              />
            </div>
            <Select v-model="lineFilter">
              <SelectTrigger class="w-[200px]">
                <SelectValue placeholder="Filter by line" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Lines
                </SelectItem>
                <SelectItem v-for="line in productionLines" :key="line.id" :value="line.id">
                  {{ line.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Production Entries Table -->
          <div class="border rounded-lg">
            <table class="w-full">
              <thead class="border-b bg-muted/50">
                <tr>
                  <th class="p-3 text-left font-medium">
                    Date
                  </th>
                  <th class="p-3 text-left font-medium">
                    Time
                  </th>
                  <th class="p-3 text-left font-medium">
                    Line
                  </th>
                  <th class="p-3 text-left font-medium">
                    Order
                  </th>
                  <th class="p-3 text-left font-medium">
                    Style
                  </th>
                  <th class="p-3 text-left font-medium">
                    Quantity
                  </th>
                  <th class="p-3 text-left font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in filteredEntries" :key="entry.id" class="border-b hover:bg-muted/25">
                  <td class="p-3">
                    {{ formatDate(entry.date) }}
                  </td>
                  <td class="p-3">
                    {{ entry.hour }}
                  </td>
                  <td class="p-3">
                    {{ entry.line_name }}
                  </td>
                  <td class="p-3">
                    {{ entry.order_number }}
                  </td>
                  <td class="p-3">
                    {{ entry.style_name }}
                  </td>
                  <td class="p-3 font-medium">
                    {{ entry.quantity }} pcs
                  </td>
                  <td class="p-3">
                    <div class="flex items-center space-x-2">
                      <Button variant="outline" size="sm" @click="editEntry(entry)">
                        <Edit class="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" @click="deleteEntry(entry)">
                        <Trash2 class="h-4 w-4" />
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

    <!-- Add/Edit Production Entry Dialog -->
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? 'Edit Production Entry' : 'Add Production Entry' }}
          </DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Update production entry information.' : 'Add new production entry per jam/per line.' }}
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Production Line *</Label>
              <Select v-model="formData.line_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select Line" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="line in productionLines" :key="line.id" :value="line.id">
                    {{ line.name }} - {{ line.capacity }}/hr
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <Label>Date *</Label>
              <Input v-model="formData.date" type="date" />
            </div>

            <div>
              <Label>Hour *</Label>
              <Input v-model="formData.hour" type="time" />
            </div>

            <div>
              <Label>Quantity *</Label>
              <Input v-model="formData.quantity" type="number" placeholder="0" />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea v-model="formData.notes" placeholder="Additional notes..." />
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
