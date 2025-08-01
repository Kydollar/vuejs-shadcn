<script setup>
import {
  Building,
  CheckCircle,
  Edit,
  Eye,
  Mail,
  MapPin,
  MoreVertical,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  User,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useBuyerStore } from '@/stores/buyer'
import { useFactoryStore } from '@/stores/factory'
import { useOrderStore } from '@/stores/order'

// Stores
const buyerStore = useBuyerStore()
const factoryStore = useFactoryStore()
const orderStore = useOrderStore()

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const dialogOpen = ref(false)
const viewDialogOpen = ref(false)
const isEditing = ref(false)
const selectedFactory = ref(null)
const searchQuery = ref('')
const statusFilter = ref('all')
const specializationInput = ref('')

const formData = ref({
  name: '',
  code: '',
  buyer_id: null,
  email: '',
  phone: '',
  address: '',
  country: '',
  manager: '',
  capacity_per_month: '',
  efficiency_rating: '',
})

// Computed
const filteredFactories = computed(() => {
  let filtered = factoryStore.factories

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(factory =>
      factory.name.toLowerCase().includes(query)
      || factory.code.toLowerCase().includes(query)
      || factory.email.toLowerCase().includes(query)
      || factory.manager.toLowerCase().includes(query),
    )
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(factory => factory.status === statusFilter.value)
  }

  return filtered
})

// Methods
function formatNumber(num) {
  return new Intl.NumberFormat().format(num)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

function getBuyerName(buyerId) {
  const buyer = buyerStore.getBuyerById(buyerId)
  return buyer ? buyer.name : 'Unknown'
}

function resetForm() {
  formData.value = {
    name: '',
    code: '',
    buyer_id: null,
    email: '',
    phone: '',
    address: '',
    country: '',
    manager: '',
    capacity_per_month: '',
    efficiency_rating: '',
  }
  specializationInput.value = ''
}

function openCreateDialog() {
  isEditing.value = false
  resetForm()
  dialogOpen.value = true
}

function editFactory(factory) {
  isEditing.value = true
  formData.value = { ...factory }
  specializationInput.value = factory.specialization.join(', ')
  dialogOpen.value = true
}

function viewFactory(factory) {
  selectedFactory.value = factory
  viewDialogOpen.value = true
}

async function deleteFactory(factory) {
  // eslint-disable-next-line no-alert
  if (window.confirm(`Are you sure you want to delete ${factory.name}?`)) {
    try {
      await factoryStore.deleteFactory(factory.id)
    }
    catch (error) {
      console.error('Error deleting factory:', error)
    }
  }
}

async function submitForm() {
  submitting.value = true
  try {
    const factoryData = {
      ...formData.value,
      specialization: specializationInput.value.split(',').map(s => s.trim()).filter(s => s),
    }

    if (isEditing.value) {
      await factoryStore.updateFactory(formData.value.id, factoryData)
    }
    else {
      await factoryStore.createFactory(factoryData)
    }
    dialogOpen.value = false
    resetForm()
  }
  catch (error) {
    console.error('Error saving factory:', error)
  }
  finally {
    submitting.value = false
  }
}

async function fetchFactories() {
  loading.value = true
  try {
    await Promise.all([
      factoryStore.fetchFactories(),
      buyerStore.fetchBuyers(),
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

function getFactoryOrders(factoryId) {
  return orderStore.getOrdersByFactory(factoryId).slice(0, 5)
}

function getOrderStatusVariant(status) {
  const variants = {
    pending: 'secondary',
    confirmed: 'default',
    in_production: 'default',
    completed: 'default',
    cancelled: 'destructive',
  }
  return variants[status] || 'secondary'
}

// Initialize
onMounted(async () => {
  await fetchFactories()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Factories Management
        </h1>
        <p class="text-muted-foreground">
          Manage production facilities and their capabilities.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="fetchFactories">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" @click="openCreateDialog">
          <Plus class="h-4 w-4 mr-2" />
          Add Factory
        </Button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="flex items-center space-x-4">
      <div class="flex-1 max-w-sm">
        <div class="relative">
          <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search factories..."
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
          <SelectItem value="active">
            Active
          </SelectItem>
          <SelectItem value="inactive">
            Inactive
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Factories Stats -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Factories
          </CardTitle>
          <Building class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ factoryStore.totalFactories }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Capacity
          </CardTitle>
          <Package class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ formatNumber(factoryStore.totalCapacity) }}
          </div>
          <p class="text-xs text-muted-foreground">
            pieces/month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Avg Efficiency
          </CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ factoryStore.averageEfficiency.toFixed(1) }}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Active Factories
          </CardTitle>
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ factoryStore.activeFactories.length }}
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span class="text-sm text-muted-foreground">Loading factories...</span>
      </div>
    </div>

    <!-- Factories Grid -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="factory in filteredFactories" :key="factory.id" class="hover:shadow-lg transition-shadow">
        <CardHeader class="pb-3">
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <CardTitle class="text-lg">
                {{ factory.name }}
              </CardTitle>
              <div class="flex items-center space-x-2">
                <Badge variant="secondary">
                  {{ factory.code }}
                </Badge>
                <Badge :variant="factory.status === 'active' ? 'default' : 'secondary'">
                  {{ factory.status }}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="sm">
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="viewFactory(factory)">
                  <Eye class="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem @click="editFactory(factory)">
                  <Edit class="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="text-destructive" @click="deleteFactory(factory)">
                  <Trash2 class="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent class="space-y-4">
          <div class="space-y-2">
            <div class="flex items-center text-sm text-muted-foreground">
              <Mail class="h-4 w-4 mr-2" />
              {{ factory.email }}
            </div>
            <div class="flex items-center text-sm text-muted-foreground">
              <Phone class="h-4 w-4 mr-2" />
              {{ factory.phone }}
            </div>
            <div class="flex items-center text-sm text-muted-foreground">
              <MapPin class="h-4 w-4 mr-2" />
              {{ factory.country }}
            </div>
            <div class="flex items-center text-sm text-muted-foreground">
              <User class="h-4 w-4 mr-2" />
              {{ factory.manager }}
            </div>
          </div>

          <Separator />

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-muted-foreground">
                Capacity/Month
              </p>
              <p class="font-bold">
                {{ formatNumber(factory.capacity_per_month) }}
              </p>
            </div>
            <div>
              <p class="text-muted-foreground">
                Efficiency
              </p>
              <p class="font-bold">
                {{ factory.efficiency_rating.toFixed(1) }}/5.0
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-muted-foreground">
                Total Orders
              </p>
              <p class="font-bold">
                {{ factory.total_orders }}
              </p>
            </div>
            <div>
              <p class="text-muted-foreground">
                Buyer
              </p>
              <p class="font-bold">
                {{ getBuyerName(factory.buyer_id) }}
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-medium text-muted-foreground">
              Specialization
            </p>
            <div class="flex flex-wrap gap-1">
              <Badge v-for="spec in factory.specialization" :key="spec" variant="outline" class="text-xs">
                {{ spec }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredFactories.length === 0" class="text-center py-12">
      <Building class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">
        No factories found
      </h3>
      <p class="text-muted-foreground mb-4">
        {{ searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding your first factory.' }}
      </p>
      <Button v-if="!searchQuery" @click="openCreateDialog">
        <Plus class="h-4 w-4 mr-2" />
        Add First Factory
      </Button>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
      <DialogContent class="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Edit' : 'Add New' }} Factory</DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Update factory information.' : 'Add a new production facility.' }}
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submitForm">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name">Factory Name</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="PT Sritex Indonesia"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="code">Code</Label>
              <Input
                id="code"
                v-model="formData.code"
                placeholder="STX"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="buyer_id">Associated Buyer</Label>
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

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="production@factory.com"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="phone">Phone</Label>
              <Input
                id="phone"
                v-model="formData.phone"
                placeholder="+62-271-714-488"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="address">Address</Label>
            <Textarea
              id="address"
              v-model="formData.address"
              placeholder="Full factory address"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="country">Country</Label>
              <Input
                id="country"
                v-model="formData.country"
                placeholder="Indonesia"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="manager">Manager</Label>
              <Input
                id="manager"
                v-model="formData.manager"
                placeholder="Budi Santoso"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="capacity_per_month">Monthly Capacity</Label>
              <Input
                id="capacity_per_month"
                v-model.number="formData.capacity_per_month"
                type="number"
                placeholder="50000"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="efficiency_rating">Efficiency Rating (1-5)</Label>
              <Input
                id="efficiency_rating"
                v-model.number="formData.efficiency_rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                placeholder="4.8"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="specialization">Specialization (comma separated)</Label>
            <Input
              id="specialization"
              v-model="specializationInput"
              placeholder="T-Shirt, Polo Shirt, Hoodie"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="dialogOpen = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="submitting">
              {{ submitting ? 'Saving...' : (isEditing ? 'Update' : 'Create') }} Factory
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- View Factory Dialog -->
    <Dialog :open="viewDialogOpen" @update:open="viewDialogOpen = $event">
      <DialogContent class="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{{ selectedFactory?.name }}</DialogTitle>
          <DialogDescription>Factory details and production capacity</DialogDescription>
        </DialogHeader>

        <div v-if="selectedFactory" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-3">
              <h4 class="font-semibold">
                Contact Information
              </h4>
              <div class="space-y-2 text-sm">
                <div><strong>Email:</strong> {{ selectedFactory.email }}</div>
                <div><strong>Phone:</strong> {{ selectedFactory.phone }}</div>
                <div><strong>Manager:</strong> {{ selectedFactory.manager }}</div>
                <div><strong>Address:</strong> {{ selectedFactory.address }}</div>
              </div>
            </div>
            <div class="space-y-3">
              <h4 class="font-semibold">
                Production Stats
              </h4>
              <div class="space-y-2 text-sm">
                <div><strong>Monthly Capacity:</strong> {{ formatNumber(selectedFactory.capacity_per_month) }} pcs</div>
                <div><strong>Efficiency Rating:</strong> {{ selectedFactory.efficiency_rating }}/5.0</div>
                <div><strong>Total Orders:</strong> {{ selectedFactory.total_orders }}</div>
                <div><strong>Associated Buyer:</strong> {{ getBuyerName(selectedFactory.buyer_id) }}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-semibold mb-3">
              Specialization
            </h4>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="spec in selectedFactory.specialization" :key="spec" variant="outline">
                {{ spec }}
              </Badge>
            </div>
          </div>

          <div>
            <h4 class="font-semibold mb-3">
              Recent Orders
            </h4>
            <div class="space-y-2">
              <div
                v-for="order in getFactoryOrders(selectedFactory.id)"
                :key="order.id"
                class="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p class="font-medium">
                    {{ order.order_number }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {{ formatDate(order.order_date) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-medium">
                    {{ formatNumber(order.order_qty) }} pcs
                  </p>
                  <Badge :variant="getOrderStatusVariant(order.status)">
                    {{ order.status }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
