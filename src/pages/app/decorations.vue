<script setup>
import {
  DollarSign,
  Edit,
  Eye,
  Grid,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Weight,
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
import { useDecorationStore } from '@/stores/decoration'
import { useOrderStore } from '@/stores/order'

// Stores
const decorationStore = useDecorationStore()
const orderStore = useOrderStore()

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const dialogOpen = ref(false)
const viewDialogOpen = ref(false)
const isEditing = ref(false)
const selectedDecoration = ref(null)
const searchQuery = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')

const formData = ref({
  order_id: null,
  type_id: null,
  description: '',
  color: '',
  size: '',
  quantity: '',
  placement: '',
  design_file: '',
})

// Computed
const decorationTypes = computed(() => {
  const types = [...new Set(decorationStore.decorations.map(d => d.type))]
  return types.sort()
})

const filteredDecorations = computed(() => {
  let filtered = decorationStore.decorations

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(decoration =>
      decoration.description.toLowerCase().includes(query)
      || decoration.type.toLowerCase().includes(query)
      || decoration.color.toLowerCase().includes(query),
    )
  }

  // Filter by type
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(decoration => decoration.type === typeFilter.value)
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(decoration => decoration.status === statusFilter.value)
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

function getTypeVariant(type) {
  const variants = {
    rhinestone: 'default',
    nailhead: 'secondary',
    embroidery: 'default',
    screen_print: 'secondary',
    heat_transfer: 'default',
    applique: 'secondary',
  }
  return variants[type.toLowerCase().replace(' ', '_')] || 'outline'
}

function getStatusVariant(status) {
  const variants = {
    pending: 'secondary',
    confirmed: 'default',
    in_production: 'default',
    completed: 'default',
  }
  return variants[status] || 'secondary'
}

function getOrderNumber(orderId) {
  const order = orderStore.getOrderById(orderId)
  return order ? order.order_number : 'Unknown'
}

function calculateTotalCost() {
  if (!formData.value.type_id || !formData.value.quantity)
    return 0
  return decorationStore.calculateDecorationCost(formData.value.type_id, formData.value.quantity)
}

function calculateTotalWeight() {
  if (!formData.value.type_id || !formData.value.quantity)
    return 0
  return decorationStore.calculateDecorationWeight(formData.value.type_id, formData.value.quantity)
}

function resetForm() {
  formData.value = {
    order_id: null,
    type_id: null,
    description: '',
    color: '',
    size: '',
    quantity: '',
    placement: '',
    design_file: '',
  }
}

function openCreateDialog() {
  isEditing.value = false
  resetForm()
  dialogOpen.value = true
}

function editDecoration(decoration) {
  isEditing.value = true
  formData.value = { ...decoration }
  dialogOpen.value = true
}

function viewDecoration(decoration) {
  selectedDecoration.value = decoration
  viewDialogOpen.value = true
}

async function deleteDecoration(decoration) {
  // eslint-disable-next-line no-alert
  if (window.confirm(`Are you sure you want to delete this ${decoration.type} decoration?`)) {
    try {
      await decorationStore.deleteDecoration(decoration.id)
    }
    catch (error) {
      console.error('Error deleting decoration:', error)
    }
  }
}

async function submitForm() {
  submitting.value = true
  try {
    if (isEditing.value) {
      await decorationStore.updateDecoration(formData.value.id, formData.value)
    }
    else {
      await decorationStore.createDecoration(formData.value)
    }
    dialogOpen.value = false
    resetForm()
  }
  catch (error) {
    console.error('Error saving decoration:', error)
  }
  finally {
    submitting.value = false
  }
}

async function fetchDecorations() {
  loading.value = true
  try {
    await Promise.all([
      decorationStore.fetchDecorations(),
      decorationStore.fetchDecorationTypes(),
      orderStore.fetchOrders(),
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
  await fetchDecorations()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Decorations Management
        </h1>
        <p class="text-muted-foreground">
          Manage decoration components and their specifications.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="fetchDecorations">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" @click="openCreateDialog">
          <Plus class="h-4 w-4 mr-2" />
          Add Decoration
        </Button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex-1 max-w-sm">
        <div class="relative">
          <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search decorations..."
            class="pl-8"
          />
        </div>
      </div>
      <Select v-model="typeFilter">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All Types
          </SelectItem>
          <SelectItem v-for="type in decorationTypes" :key="type" :value="type">
            {{ type }}
          </SelectItem>
        </SelectContent>
      </Select>
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
    </div>

    <!-- Decorations Stats -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Decorations
          </CardTitle>
          <Sparkles class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ decorationStore.totalDecorations }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Cost
          </CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            ${{ formatNumber(decorationStore.totalDecorationCost) }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Weight
          </CardTitle>
          <Weight class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ decorationStore.totalDecorationWeight.toFixed(2) }}
          </div>
          <p class="text-xs text-muted-foreground">
            kg
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Types Available
          </CardTitle>
          <Grid class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ decorationStore.decorationTypes.length }}
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span class="text-sm text-muted-foreground">Loading decorations...</span>
      </div>
    </div>

    <!-- Decorations Table -->
    <Card v-else>
      <CardHeader>
        <CardTitle>Decorations List</CardTitle>
        <CardDescription>Manage decoration components and their details</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="filteredDecorations.length === 0" class="text-center py-8">
          <Sparkles class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-lg font-semibold mb-2">
            No decorations found
          </h3>
          <p class="text-muted-foreground mb-4">
            {{ searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding your first decoration.' }}
          </p>
          <Button v-if="!searchQuery" @click="openCreateDialog">
            <Plus class="h-4 w-4 mr-2" />
            Add First Decoration
          </Button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="decoration in filteredDecorations"
            :key="decoration.id"
            class="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center space-x-3 mb-2">
                  <Badge :variant="getTypeVariant(decoration.type)">
                    {{ decoration.type }}
                  </Badge>
                  <Badge :variant="getStatusVariant(decoration.status)">
                    {{ decoration.status }}
                  </Badge>
                  <span class="text-sm text-muted-foreground">
                    Order: {{ getOrderNumber(decoration.order_id) }}
                  </span>
                </div>
                <h3 class="font-semibold text-lg">
                  {{ decoration.description }}
                </h3>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm">
                    <MoreVertical class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewDecoration(decoration)">
                    <Eye class="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="editDecoration(decoration)">
                    <Edit class="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-destructive" @click="deleteDecoration(decoration)">
                    <Trash2 class="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
              <div>
                <p class="text-xs text-muted-foreground">
                  Color
                </p>
                <p class="font-semibold">
                  {{ decoration.color }}
                </p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">
                  Size
                </p>
                <p class="font-semibold">
                  {{ decoration.size }}
                </p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">
                  Quantity
                </p>
                <p class="font-semibold">
                  {{ formatNumber(decoration.quantity) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">
                  Total Cost
                </p>
                <p class="font-semibold">
                  ${{ formatNumber(decoration.total_cost) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">
                  Total Weight
                </p>
                <p class="font-semibold">
                  {{ decoration.total_weight.toFixed(2) }} kg
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 text-sm text-muted-foreground">
                <span><strong>Placement:</strong> {{ decoration.placement }}</span>
                <span><strong>Design File:</strong> {{ decoration.design_file }}</span>
              </div>
              <div class="text-sm text-muted-foreground">
                Created: {{ formatDate(decoration.created_at) }}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
      <DialogContent class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Edit' : 'Add New' }} Decoration</DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Update decoration information.' : 'Add a new decoration component.' }}
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submitForm">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="order_id">Order</Label>
              <Select v-model="formData.order_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="order in orderStore.orders"
                    :key="order.id"
                    :value="order.id"
                  >
                    {{ order.order_number }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="type_id">Decoration Type</Label>
              <Select v-model="formData.type_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="type in decorationStore.decorationTypes"
                    :key="type.id"
                    :value="type.id"
                  >
                    {{ type.name }} - ${{ type.cost_per_unit }}/{{ type.unit }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="Silver rhinestone logo on front chest"
              required
            />
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="color">Color</Label>
              <Input
                id="color"
                v-model="formData.color"
                placeholder="Silver"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="size">Size</Label>
              <Input
                id="size"
                v-model="formData.size"
                placeholder="3mm"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="quantity">Quantity</Label>
              <Input
                id="quantity"
                v-model.number="formData.quantity"
                type="number"
                placeholder="5000"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="placement">Placement</Label>
              <Input
                id="placement"
                v-model="formData.placement"
                placeholder="Front chest"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="design_file">Design File</Label>
              <Input
                id="design_file"
                v-model="formData.design_file"
                placeholder="logo-rhinestone.svg"
              />
            </div>
          </div>

          <!-- Cost and Weight Display -->
          <div v-if="formData.type_id && formData.quantity" class="p-4 bg-gray-50 rounded-lg">
            <h4 class="font-semibold mb-2">
              Calculated Values
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-muted-foreground">Total Cost: </span>
                <span class="font-bold">${{ calculateTotalCost().toFixed(2) }}</span>
              </div>
              <div>
                <span class="text-muted-foreground">Total Weight: </span>
                <span class="font-bold">{{ calculateTotalWeight().toFixed(2) }} kg</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="dialogOpen = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="submitting">
              {{ submitting ? 'Saving...' : (isEditing ? 'Update' : 'Create') }} Decoration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- View Dialog -->
    <Dialog :open="viewDialogOpen" @update:open="viewDialogOpen = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ selectedDecoration?.description }}</DialogTitle>
          <DialogDescription>Decoration details and specifications</DialogDescription>
        </DialogHeader>

        <div v-if="selectedDecoration" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-3">
              <h4 class="font-semibold">
                Basic Information
              </h4>
              <div class="space-y-2 text-sm">
                <div><strong>Type:</strong> {{ selectedDecoration.type }}</div>
                <div><strong>Color:</strong> {{ selectedDecoration.color }}</div>
                <div><strong>Size:</strong> {{ selectedDecoration.size }}</div>
                <div><strong>Placement:</strong> {{ selectedDecoration.placement }}</div>
              </div>
            </div>
            <div class="space-y-3">
              <h4 class="font-semibold">
                Quantities & Costs
              </h4>
              <div class="space-y-2 text-sm">
                <div><strong>Quantity:</strong> {{ formatNumber(selectedDecoration.quantity) }}</div>
                <div><strong>Cost per Unit:</strong> ${{ selectedDecoration.cost_per_unit.toFixed(2) }}</div>
                <div><strong>Total Cost:</strong> ${{ formatNumber(selectedDecoration.total_cost) }}</div>
                <div><strong>Total Weight:</strong> {{ selectedDecoration.total_weight.toFixed(2) }} kg</div>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-semibold mb-2">
              Order Information
            </h4>
            <p class="text-sm">
              <strong>Order Number:</strong> {{ getOrderNumber(selectedDecoration.order_id) }}
            </p>
            <p class="text-sm">
              <strong>Design File:</strong> {{ selectedDecoration.design_file }}
            </p>
            <p class="text-sm">
              <strong>Status:</strong> {{ selectedDecoration.status }}
            </p>
          </div>

          <div>
            <h4 class="font-semibold mb-2">
              Description
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ selectedDecoration.description }}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
