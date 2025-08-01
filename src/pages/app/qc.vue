<script setup>
import {
  CheckCircle,
  Edit,
  Plus,
  RefreshCw,
  Save,
  Search,
  Shield,
  Target,
  Trash2,
  TrendingUp,
  XCircle,
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
const inspectorFilter = ref('all')

// Form data
const formData = ref({
  order_id: '',
  inspector_id: '',
  date: new Date().toISOString().split('T')[0],
  time: '',
  batch_number: '',
  qty_checked: '',
  qty_reject: '',
  defect_type: '',
  severity: '',
  notes: '',
})

// Quick entry
const quickEntry = ref({
  order_id: '',
  inspector_id: '',
  qty_checked: '',
  qty_reject: '',
  defect_type: '',
})

// Mock data
const activeOrders = ref([
  { id: 1, order_number: 'ORD-001', product_name: 'Basic Tee - Red' },
  { id: 2, order_number: 'ORD-002', product_name: 'Premium Polo - Blue' },
  { id: 3, order_number: 'ORD-003', product_name: 'Hoodie - Black' },
])

const qcInspectors = ref([
  { id: 1, name: 'Siti Rahayu', initials: 'SR' },
  { id: 2, name: 'Budi Santoso', initials: 'BS' },
  { id: 3, name: 'Andi Wijaya', initials: 'AW' },
  { id: 4, name: 'Maya Sari', initials: 'MS' },
])

const defectTypes = ref([
  { code: 'STITCH', name: 'Stitching Defect' },
  { code: 'COLOR', name: 'Color Variation' },
  { code: 'SIZE', name: 'Size Mismatch' },
  { code: 'FABRIC', name: 'Fabric Defect' },
  { code: 'PRINT', name: 'Print Quality' },
  { code: 'BUTTON', name: 'Button/Zipper Issue' },
  { code: 'TRIM', name: 'Trim Defect' },
  { code: 'OTHER', name: 'Other' },
])

const qcEntries = ref([
  {
    id: 1,
    date: '2025-08-01',
    time: '08:30',
    order_id: 1,
    order_number: 'ORD-001',
    style_name: 'Basic Tee - Red',
    inspector_id: 1,
    inspector_name: 'Siti Rahayu',
    batch_number: 'BT001',
    qty_checked: 500,
    qty_reject: 25,
    defect_type: 'STITCH',
    defect_name: 'Stitching Defect',
    severity: 'minor',
    notes: 'Minor stitching issues on side seams',
  },
  {
    id: 2,
    date: '2025-08-01',
    time: '10:15',
    order_id: 2,
    order_number: 'ORD-002',
    style_name: 'Premium Polo - Blue',
    inspector_id: 2,
    inspector_name: 'Budi Santoso',
    batch_number: 'PP001',
    qty_checked: 300,
    qty_reject: 8,
    defect_type: 'COLOR',
    defect_name: 'Color Variation',
    severity: 'major',
    notes: 'Slight color variation in collar',
  },
  {
    id: 3,
    date: '2025-08-01',
    time: '14:20',
    order_id: 1,
    order_number: 'ORD-001',
    style_name: 'Basic Tee - Red',
    inspector_id: 3,
    inspector_name: 'Andi Wijaya',
    batch_number: 'BT002',
    qty_checked: 450,
    qty_reject: 12,
    defect_type: 'SIZE',
    defect_name: 'Size Mismatch',
    severity: 'critical',
    notes: 'Size labels incorrect',
  },
])

// Computed properties
const todayChecked = computed(() => {
  return qcEntries.value
    .filter(entry => entry.date === new Date().toISOString().split('T')[0])
    .reduce((sum, entry) => sum + entry.qty_checked, 0)
})

const todayRejected = computed(() => {
  return qcEntries.value
    .filter(entry => entry.date === new Date().toISOString().split('T')[0])
    .reduce((sum, entry) => sum + entry.qty_reject, 0)
})

const passRate = computed(() => {
  return todayChecked.value > 0
    ? ((todayChecked.value - todayRejected.value) / todayChecked.value * 100)
    : 0
})

const qcEfficiency = computed(() => {
  // Mock calculation - in real app would be based on inspection time vs standard
  return 87.5
})

const topDefects = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = qcEntries.value.filter(entry => entry.date === today)

  const defectCounts = {}
  todayEntries.forEach((entry) => {
    if (entry.qty_reject > 0) {
      defectCounts[entry.defect_type] = (defectCounts[entry.defect_type] || 0) + entry.qty_reject
    }
  })

  return Object.entries(defectCounts)
    .map(([type, count]) => {
      const defect = defectTypes.value.find(d => d.code === type)
      return {
        type,
        name: defect?.name || type,
        count,
        percentage: ((count / todayRejected.value) * 100).toFixed(1),
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const inspectorPerformance = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = qcEntries.value.filter(entry => entry.date === today)

  return qcInspectors.value.map((inspector) => {
    const inspectorEntries = todayEntries.filter(entry => entry.inspector_id === inspector.id)
    const checkedToday = inspectorEntries.reduce((sum, entry) => sum + entry.qty_checked, 0)
    const efficiency = checkedToday > 0 ? Math.min(100, (checkedToday / 600) * 100) : 0 // 600 as daily target

    return {
      ...inspector,
      checked_today: checkedToday,
      efficiency: efficiency.toFixed(1),
    }
  })
})

const filteredEntries = computed(() => {
  let filtered = qcEntries.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(entry =>
      entry.order_number.toLowerCase().includes(query)
      || entry.style_name.toLowerCase().includes(query)
      || entry.inspector_name.toLowerCase().includes(query)
      || entry.defect_name.toLowerCase().includes(query),
    )
  }

  if (inspectorFilter.value !== 'all') {
    filtered = filtered.filter(entry => entry.inspector_id === Number.parseInt(inspectorFilter.value))
  }

  // Add pass_rate to each entry
  return filtered.map(entry => ({
    ...entry,
    pass_rate: entry.qty_checked > 0 ? ((entry.qty_checked - entry.qty_reject) / entry.qty_checked * 100) : 0,
  })).sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`))
})

const canSaveEntry = computed(() => {
  return formData.value.order_id && formData.value.inspector_id
    && formData.value.date && formData.value.time
    && formData.value.qty_checked && formData.value.qty_reject !== ''
})

const canSaveQuickEntry = computed(() => {
  return quickEntry.value.order_id && quickEntry.value.inspector_id
    && quickEntry.value.qty_checked && quickEntry.value.qty_reject !== ''
})

// Methods
function getPassRateBadgeVariant(passRate) {
  if (passRate >= 95)
    return 'default' // green
  if (passRate >= 90)
    return 'secondary' // yellow
  return 'destructive' // red
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
    order_id: '',
    inspector_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    batch_number: '',
    qty_checked: '',
    qty_reject: '',
    defect_type: '',
    severity: '',
    notes: '',
  }
}

function saveEntry() {
  if (!canSaveEntry.value)
    return

  submitting.value = true

  setTimeout(() => {
    if (isEditing.value) {
      const index = qcEntries.value.findIndex(e => e.id === formData.value.id)
      if (index !== -1) {
        const order = activeOrders.value.find(o => o.id === Number.parseInt(formData.value.order_id))
        const inspector = qcInspectors.value.find(i => i.id === Number.parseInt(formData.value.inspector_id))
        const defect = defectTypes.value.find(d => d.code === formData.value.defect_type)

        qcEntries.value[index] = {
          ...formData.value,
          order_number: order?.order_number || '',
          style_name: order?.product_name || '',
          inspector_name: inspector?.name || '',
          defect_name: defect?.name || '',
        }
      }
    }
    else {
      const order = activeOrders.value.find(o => o.id === Number.parseInt(formData.value.order_id))
      const inspector = qcInspectors.value.find(i => i.id === Number.parseInt(formData.value.inspector_id))
      const defect = defectTypes.value.find(d => d.code === formData.value.defect_type)

      qcEntries.value.push({
        id: Date.now(),
        ...formData.value,
        order_number: order?.order_number || '',
        style_name: order?.product_name || '',
        inspector_name: inspector?.name || '',
        defect_name: defect?.name || '',
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
  const inspector = qcInspectors.value.find(i => i.id === Number.parseInt(quickEntry.value.inspector_id))
  const defect = defectTypes.value.find(d => d.code === quickEntry.value.defect_type)

  qcEntries.value.push({
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    order_id: Number.parseInt(quickEntry.value.order_id),
    order_number: order?.order_number || '',
    style_name: order?.product_name || '',
    inspector_id: Number.parseInt(quickEntry.value.inspector_id),
    inspector_name: inspector?.name || '',
    batch_number: `BT${Date.now().toString().slice(-3)}`,
    qty_checked: Number.parseInt(quickEntry.value.qty_checked),
    qty_reject: Number.parseInt(quickEntry.value.qty_reject),
    defect_type: quickEntry.value.defect_type,
    defect_name: defect?.name || '',
    severity: 'minor',
    notes: '',
  })

  // Reset quick entry
  quickEntry.value = {
    order_id: '',
    inspector_id: '',
    qty_checked: '',
    qty_reject: '',
    defect_type: '',
  }
}

function deleteEntry(entry) {
  // eslint-disable-next-line no-alert
  if (confirm('Are you sure you want to delete this QC entry?')) {
    const index = qcEntries.value.findIndex(e => e.id === entry.id)
    if (index !== -1) {
      qcEntries.value.splice(index, 1)
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
          Quality Control (QC)
        </h1>
        <p class="text-muted-foreground">
          Input Qty dicek QC dan Qty Reject sesuai workflow ERP.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="refreshData">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" @click="openAddDialog">
          <Plus class="h-4 w-4 mr-2" />
          Add QC Entry
        </Button>
      </div>
    </div>

    <!-- QC Summary Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Checked Today
          </CardTitle>
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-blue-600">
            {{ todayChecked }}
          </div>
          <p class="text-xs text-muted-foreground">
            pieces checked
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Rejected
          </CardTitle>
          <XCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">
            {{ todayRejected }}
          </div>
          <p class="text-xs text-muted-foreground">
            pieces rejected
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Pass Rate
          </CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">
            {{ passRate }}%
          </div>
          <p class="text-xs text-muted-foreground">
            today's pass rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            QC Efficiency
          </CardTitle>
          <Target class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-purple-600">
            {{ qcEfficiency }}%
          </div>
          <p class="text-xs text-muted-foreground">
            inspection rate
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Quick QC Input -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <Shield class="h-5 w-5" />
          <span>Quick QC Input</span>
        </CardTitle>
        <CardDescription>Input Qty dicek QC dan Qty Reject</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
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
            <Label>QC Inspector</Label>
            <Select v-model="quickEntry.inspector_id">
              <SelectTrigger>
                <SelectValue placeholder="Select Inspector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="inspector in qcInspectors" :key="inspector.id" :value="inspector.id">
                  {{ inspector.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Qty Dicek</Label>
            <Input v-model="quickEntry.qty_checked" type="number" placeholder="0" />
          </div>

          <div>
            <Label>Qty Reject</Label>
            <Input v-model="quickEntry.qty_reject" type="number" placeholder="0" />
          </div>

          <div>
            <Label>Defect Type</Label>
            <Select v-model="quickEntry.defect_type">
              <SelectTrigger>
                <SelectValue placeholder="Select Defect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="defect in defectTypes" :key="defect.code" :value="defect.code">
                  {{ defect.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-end">
            <Button :disabled="!canSaveQuickEntry" class="w-full" @click="saveQuickEntry">
              <Save class="h-4 w-4 mr-2" />
              Save QC
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Defect Analysis -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Top Defect Types -->
      <Card>
        <CardHeader>
          <CardTitle>Top Defect Types Today</CardTitle>
          <CardDescription>Most common quality issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="defect in topDefects" :key="defect.type" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 rounded bg-red-500"></div>
                <span class="font-medium">{{ defect.name }}</span>
              </div>
              <div class="text-right">
                <div class="font-bold text-red-600">
                  {{ defect.count }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ defect.percentage }}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- QC Inspector Performance -->
      <Card>
        <CardHeader>
          <CardTitle>QC Inspector Performance</CardTitle>
          <CardDescription>Today's inspection statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="inspector in inspectorPerformance" :key="inspector.id" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-xs font-bold text-blue-600">{{ inspector.initials }}</span>
                </div>
                <span class="font-medium">{{ inspector.name }}</span>
              </div>
              <div class="text-right">
                <div class="font-bold">
                  {{ inspector.checked_today }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ inspector.efficiency }}% eff
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- QC History -->
    <Card>
      <CardHeader>
        <CardTitle>QC History</CardTitle>
        <CardDescription>Recent quality control entries</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- Search and Filter -->
          <div class="flex items-center space-x-2">
            <div class="relative flex-1">
              <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Search QC entries..."
                class="pl-8"
              />
            </div>
            <Select v-model="inspectorFilter">
              <SelectTrigger class="w-[200px]">
                <SelectValue placeholder="Filter by inspector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Inspectors
                </SelectItem>
                <SelectItem v-for="inspector in qcInspectors" :key="inspector.id" :value="inspector.id">
                  {{ inspector.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- QC Entries Table -->
          <div class="border rounded-lg">
            <table class="w-full">
              <thead class="border-b bg-muted/50">
                <tr>
                  <th class="p-3 text-left font-medium">
                    Date/Time
                  </th>
                  <th class="p-3 text-left font-medium">
                    Order
                  </th>
                  <th class="p-3 text-left font-medium">
                    Inspector
                  </th>
                  <th class="p-3 text-left font-medium">
                    Qty Checked
                  </th>
                  <th class="p-3 text-left font-medium">
                    Qty Reject
                  </th>
                  <th class="p-3 text-left font-medium">
                    Pass Rate
                  </th>
                  <th class="p-3 text-left font-medium">
                    Defect Type
                  </th>
                  <th class="p-3 text-left font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in filteredEntries" :key="entry.id" class="border-b hover:bg-muted/25">
                  <td class="p-3">
                    <div>{{ formatDate(entry.date) }}</div>
                    <div class="text-xs text-muted-foreground">
                      {{ entry.time }}
                    </div>
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
                    {{ entry.inspector_name }}
                  </td>
                  <td class="p-3 font-medium text-blue-600">
                    {{ entry.qty_checked }}
                  </td>
                  <td class="p-3 font-medium text-red-600">
                    {{ entry.qty_reject }}
                  </td>
                  <td class="p-3">
                    <Badge :variant="getPassRateBadgeVariant(entry.pass_rate)">
                      {{ entry.pass_rate.toFixed(1) }}%
                    </Badge>
                  </td>
                  <td class="p-3">
                    <Badge variant="outline">
                      {{ entry.defect_name }}
                    </Badge>
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

    <!-- Add/Edit QC Entry Dialog -->
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? 'Edit QC Entry' : 'Add QC Entry' }}
          </DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Update QC entry information.' : 'Add new quality control entry.' }}
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
              <Label>QC Inspector *</Label>
              <Select v-model="formData.inspector_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select Inspector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="inspector in qcInspectors" :key="inspector.id" :value="inspector.id">
                    {{ inspector.name }}
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
              <Label>Time *</Label>
              <Input v-model="formData.time" type="time" />
            </div>

            <div>
              <Label>Batch Number</Label>
              <Input v-model="formData.batch_number" placeholder="Batch #" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Qty Checked *</Label>
              <Input v-model="formData.qty_checked" type="number" placeholder="0" />
            </div>

            <div>
              <Label>Qty Reject *</Label>
              <Input v-model="formData.qty_reject" type="number" placeholder="0" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Defect Type</Label>
              <Select v-model="formData.defect_type">
                <SelectTrigger>
                  <SelectValue placeholder="Select Defect Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="defect in defectTypes" :key="defect.code" :value="defect.code">
                    {{ defect.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Severity</Label>
              <Select v-model="formData.severity">
                <SelectTrigger>
                  <SelectValue placeholder="Select Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">
                    Minor
                  </SelectItem>
                  <SelectItem value="major">
                    Major
                  </SelectItem>
                  <SelectItem value="critical">
                    Critical
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea v-model="formData.notes" placeholder="Quality control notes..." />
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
