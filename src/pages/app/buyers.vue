<script setup>
import {
  Edit,
  Eye,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
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
import { useOrderStore } from '@/stores/order'

// Stores
const buyerStore = useBuyerStore()
const orderStore = useOrderStore()

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const dialogOpen = ref(false)
const viewDialogOpen = ref(false)
const isEditing = ref(false)
const selectedBuyer = ref(null)
const searchQuery = ref('')
const statusFilter = ref('all')

const formData = ref({
  name: '',
  code: '',
  email: '',
  phone: '',
  address: '',
  country: '',
  contact_person: '',
})

// Computed
const filteredBuyers = computed(() => {
  let filtered = buyerStore.buyers

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(buyer =>
      buyer.name.toLowerCase().includes(query)
      || buyer.code.toLowerCase().includes(query)
      || buyer.email.toLowerCase().includes(query)
      || buyer.contact_person.toLowerCase().includes(query),
    )
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(buyer => buyer.status === statusFilter.value)
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

function resetForm() {
  formData.value = {
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    contact_person: '',
  }
}

function openCreateDialog() {
  isEditing.value = false
  resetForm()
  dialogOpen.value = true
}

function editBuyer(buyer) {
  isEditing.value = true
  formData.value = { ...buyer }
  dialogOpen.value = true
}

function viewBuyer(buyer) {
  selectedBuyer.value = buyer
  viewDialogOpen.value = true
}

async function deleteBuyer(buyer) {
  // In a real app, you'd use a proper confirmation dialog
  // For now, using confirm but you should replace with a proper modal
  // eslint-disable-next-line no-alert
  if (window.confirm(`Are you sure you want to delete ${buyer.name}?`)) {
    try {
      await buyerStore.deleteBuyer(buyer.id)
    }
    catch (error) {
      console.error('Error deleting buyer:', error)
    }
  }
}

async function submitForm() {
  submitting.value = true
  try {
    if (isEditing.value) {
      await buyerStore.updateBuyer(formData.value.id, formData.value)
    }
    else {
      await buyerStore.createBuyer(formData.value)
    }
    dialogOpen.value = false
    resetForm()
  }
  catch (error) {
    console.error('Error saving buyer:', error)
  }
  finally {
    submitting.value = false
  }
}

async function fetchBuyers() {
  loading.value = true
  try {
    await buyerStore.fetchBuyers()
    await orderStore.fetchOrders()
  }
  catch (error) {
    console.error('Error fetching buyers:', error)
  }
  finally {
    loading.value = false
  }
}

function getBuyerOrders(buyerId) {
  return orderStore.getOrdersByBuyer(buyerId).slice(0, 5)
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
  await fetchBuyers()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Buyers Management
        </h1>
        <p class="text-muted-foreground">
          Manage your buyer relationships and track their orders.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="fetchBuyers">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" @click="openCreateDialog">
          <Plus class="h-4 w-4 mr-2" />
          Add Buyer
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
            placeholder="Search buyers..."
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

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span class="text-sm text-muted-foreground">Loading buyers...</span>
      </div>
    </div>

    <!-- Buyers Grid -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="buyer in filteredBuyers" :key="buyer.id" class="hover:shadow-lg transition-shadow">
        <CardHeader class="pb-3">
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <CardTitle class="text-lg">
                {{ buyer.name }}
              </CardTitle>
              <div class="flex items-center space-x-2">
                <Badge variant="secondary">
                  {{ buyer.code }}
                </Badge>
                <Badge :variant="buyer.status === 'active' ? 'default' : 'secondary'">
                  {{ buyer.status }}
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
                <DropdownMenuItem @click="viewBuyer(buyer)">
                  <Eye class="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem @click="editBuyer(buyer)">
                  <Edit class="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="text-destructive" @click="deleteBuyer(buyer)">
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
              {{ buyer.email }}
            </div>
            <div class="flex items-center text-sm text-muted-foreground">
              <Phone class="h-4 w-4 mr-2" />
              {{ buyer.phone }}
            </div>
            <div class="flex items-center text-sm text-muted-foreground">
              <MapPin class="h-4 w-4 mr-2" />
              {{ buyer.country }}
            </div>
            <div class="flex items-center text-sm text-muted-foreground">
              <User class="h-4 w-4 mr-2" />
              {{ buyer.contact_person }}
            </div>
          </div>

          <Separator />

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-muted-foreground">
                Total Orders
              </p>
              <p class="font-bold">
                {{ buyer.total_orders }}
              </p>
            </div>
            <div>
              <p class="text-muted-foreground">
                Total Value
              </p>
              <p class="font-bold">
                ${{ formatNumber(buyer.total_amount) }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredBuyers.length === 0" class="text-center py-12">
      <Users class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">
        No buyers found
      </h3>
      <p class="text-muted-foreground mb-4">
        {{ searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding your first buyer.' }}
      </p>
      <Button v-if="!searchQuery" @click="openCreateDialog">
        <Plus class="h-4 w-4 mr-2" />
        Add First Buyer
      </Button>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Edit' : 'Add New' }} Buyer</DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Update buyer information.' : 'Add a new buyer to your system.' }}
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submitForm">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name">Company Name</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="Enter company name"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="code">Code</Label>
              <Input
                id="code"
                v-model="formData.code"
                placeholder="e.g., MCY"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="contact@company.com"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="phone">Phone</Label>
              <Input
                id="phone"
                v-model="formData.phone"
                placeholder="+1-555-0123"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="address">Address</Label>
            <Textarea
              id="address"
              v-model="formData.address"
              placeholder="Enter full address"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="country">Country</Label>
              <Input
                id="country"
                v-model="formData.country"
                placeholder="United States"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                v-model="formData.contact_person"
                placeholder="John Smith"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="dialogOpen = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="submitting">
              {{ submitting ? 'Saving...' : (isEditing ? 'Update' : 'Create') }} Buyer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- View Dialog -->
    <Dialog :open="viewDialogOpen" @update:open="viewDialogOpen = $event">
      <DialogContent class="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{{ selectedBuyer?.name }}</DialogTitle>
          <DialogDescription>Buyer details and order history</DialogDescription>
        </DialogHeader>

        <div v-if="selectedBuyer" class="space-y-6">
          <!-- Buyer Info -->
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-3">
              <h4 class="font-semibold">
                Contact Information
              </h4>
              <div class="space-y-2 text-sm">
                <div><strong>Email:</strong> {{ selectedBuyer.email }}</div>
                <div><strong>Phone:</strong> {{ selectedBuyer.phone }}</div>
                <div><strong>Contact Person:</strong> {{ selectedBuyer.contact_person }}</div>
              </div>
            </div>
            <div class="space-y-3">
              <h4 class="font-semibold">
                Business Stats
              </h4>
              <div class="space-y-2 text-sm">
                <div><strong>Total Orders:</strong> {{ selectedBuyer.total_orders }}</div>
                <div><strong>Total Value:</strong> ${{ formatNumber(selectedBuyer.total_amount) }}</div>
                <div><strong>Member Since:</strong> {{ formatDate(selectedBuyer.created_at) }}</div>
              </div>
            </div>
          </div>

          <!-- Recent Orders -->
          <div>
            <h4 class="font-semibold mb-3">
              Recent Orders
            </h4>
            <div class="space-y-2">
              <div
                v-for="order in getBuyerOrders(selectedBuyer.id)"
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
                    ${{ formatNumber(order.amount) }}
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
