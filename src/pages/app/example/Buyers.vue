<script setup>
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Edit,
  Eye,
  Globe,
  Loader2,
  Plus,
  Search,
  Trash2,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'

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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useBuyersStore } from '@/stores/example/buyers'

const buyersStore = useBuyersStore()

// State
const searchQuery = ref('')
const statusFilter = ref('all')
const countryFilter = ref('all')
const showDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const buyerToDelete = ref(null)

// Reactive data
const formData = ref({
  buyerName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  country: '',
  status: 'active',
  notes: '',
})

// Store getters (reactive)
const { buyers, loading, selectedBuyer, activeBuyers, inactiveBuyers, uniqueCountries }
  = storeToRefs(buyersStore)

// Computed
const filteredBuyers = computed(() => {
  // Safety check untuk buyers array
  if (!buyers.value || !Array.isArray(buyers.value)) {
    return []
  }

  let filtered = buyers.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      buyer =>
        buyer?.buyerName?.toLowerCase().includes(query)
        || buyer?.contactPerson?.toLowerCase().includes(query)
        || buyer?.email?.toLowerCase().includes(query)
        || buyer?.country?.toLowerCase().includes(query),
    )
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(buyer => buyer?.status === statusFilter.value)
  }

  // Country filter
  if (countryFilter.value !== 'all') {
    filtered = filtered.filter(buyer => buyer?.country === countryFilter.value)
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

function resetForm() {
  formData.value = {
    buyerName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    status: 'active',
    notes: '',
  }
}

function openCreateDialog() {
  resetForm()
  isEditing.value = false
  showDialog.value = true
}

function editBuyer(buyer) {
  formData.value = { ...buyer }
  isEditing.value = true
  showDialog.value = true
}

function viewBuyer(buyer) {
  buyersStore.selectedBuyer = buyer
  showViewDialog.value = true
}

function confirmDelete(buyer) {
  buyerToDelete.value = buyer
  showDeleteDialog.value = true
}

async function saveBuyer() {
  try {
    if (isEditing.value) {
      await buyersStore.updateBuyer(formData.value.id, formData.value)
    }
    else {
      await buyersStore.createBuyer(formData.value)
    }
    showDialog.value = false
    resetForm()
  }
  catch (error) {
    console.error('Error saving buyer:', error)
  }
}

async function handleDelete() {
  try {
    await buyersStore.deleteBuyer(buyerToDelete.value.id)
    showDeleteDialog.value = false
    buyerToDelete.value = null
  }
  catch (error) {
    console.error('Error deleting buyer:', error)
  }
}

// Initialize
onMounted(async () => {
  // Prevent multiple fetch calls during navigation
  if (buyers.value.length === 0) {
    await buyersStore.fetchBuyers()
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('erp.buyers.title') }}
        </h1>
        <p class="text-muted-foreground">
          {{ $t('erp.buyers.subtitle') }}
        </p>
      </div>
      <Button class="gap-2" :disabled="loading" @click="openCreateDialog">
        <Plus class="h-4 w-4" />
        {{ $t('erp.buyers.addBuyer') }}
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Building2 class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.stats.total') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ buyers.length }}</span>
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
                {{ $t('erp.buyers.stats.active') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ activeBuyers.length }}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertCircle class="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.stats.inactive') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ inactiveBuyers.length }}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Globe class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.stats.countries') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ uniqueCountries.length }}</span>
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
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
              />
              <Input
                v-model="searchQuery"
                :placeholder="$t('erp.buyers.search')"
                :disabled="loading"
                class="pl-10"
              />
            </div>
          </div>
          <Select v-model="statusFilter" :disabled="loading">
            <SelectTrigger class="w-[180px]">
              <SelectValue :placeholder="$t('erp.buyers.filterStatus')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {{ $t('common.all') }}
              </SelectItem>
              <SelectItem value="active">
                {{ $t('common.active') }}
              </SelectItem>
              <SelectItem value="inactive">
                {{ $t('common.inactive') }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="countryFilter" :disabled="loading">
            <SelectTrigger class="w-[180px]">
              <SelectValue :placeholder="$t('erp.buyers.filterCountry')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {{ $t('common.all') }}
              </SelectItem>
              <SelectItem v-for="country in uniqueCountries" :key="country" :value="country">
                {{ country }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Buyers Table -->
    <Card>
      <CardHeader>
        <CardTitle>{{ $t('erp.buyers.list') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ $t('erp.buyers.table.name') }}</TableHead>
                <TableHead>{{ $t('erp.buyers.table.contact') }}</TableHead>
                <TableHead>{{ $t('erp.buyers.table.country') }}</TableHead>
                <TableHead>{{ $t('erp.buyers.table.status') }}</TableHead>
                <TableHead>{{ $t('erp.buyers.table.created') }}</TableHead>
                <TableHead class="text-right">
                  {{ $t('common.actions') }}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="loading">
                <TableRow v-for="n in 5" :key="n">
                  <TableCell class="py-4">
                    <Skeleton class="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <div class="flex justify-end gap-2">
                      <Skeleton class="h-8 w-8" />
                      <Skeleton class="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              </template>

              <TableRow v-else-if="filteredBuyers.length === 0">
                <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
                  {{ $t('erp.buyers.noData') }}
                </TableCell>
              </TableRow>

              <TableRow v-for="buyer in filteredBuyers" v-else :key="buyer?.id">
                <TableCell class="font-medium">
                  <div>
                    <div class="font-semibold">
                      {{ buyer?.buyerName }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ buyer?.email }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div class="font-medium">
                      {{ buyer?.contactPerson }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ buyer?.phone }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Globe class="h-4 w-4 text-muted-foreground" />
                    {{ buyer?.country }}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="buyer?.status === 'active' ? 'default' : 'secondary'">
                    {{ $t(`common.${buyer?.status}`) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div class="text-sm font-medium">
                      {{ formatDate(buyer?.createdAt) }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ buyer?.totalOrders || 0 }} orders
                    </div>
                  </div>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" @click="viewBuyer(buyer)">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="editBuyer(buyer)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="confirmDelete(buyer)">
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
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? $t('erp.buyers.edit') : $t('erp.buyers.addBuyer') }}
          </DialogTitle>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="saveBuyer">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="buyerName">{{ $t('erp.buyers.buyerName') }} *</Label>
              <Input
                id="buyerName"
                v-model="formData.buyerName"
                required
                :placeholder="$t('erp.buyers.buyerNamePlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="contactPerson">{{ $t('erp.buyers.contactPerson') }} *</Label>
              <Input
                id="contactPerson"
                v-model="formData.contactPerson"
                required
                :placeholder="$t('erp.buyers.contactPersonPlaceholder')"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="email">{{ $t('erp.buyers.email') }} *</Label>
              <Input
                id="email"
                v-model="formData.email"
                type="email"
                required
                :placeholder="$t('erp.buyers.emailPlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="phone">{{ $t('erp.buyers.phone') }} *</Label>
              <Input
                id="phone"
                v-model="formData.phone"
                required
                :placeholder="$t('erp.buyers.phonePlaceholder')"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="address">{{ $t('erp.buyers.address') }}</Label>
            <Textarea
              id="address"
              v-model="formData.address"
              :placeholder="$t('erp.buyers.addressPlaceholder')"
              rows="3"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="country">{{ $t('erp.buyers.country') }} *</Label>
              <Input
                id="country"
                v-model="formData.country"
                required
                :placeholder="$t('erp.buyers.countryPlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="status">{{ $t('erp.buyers.status') }}</Label>
              <Select v-model="formData.status">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {{ $t('common.active') }}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {{ $t('common.inactive') }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="notes">{{ $t('erp.buyers.notes') }}</Label>
            <Textarea
              id="notes"
              v-model="formData.notes"
              :placeholder="$t('erp.buyers.notesPlaceholder')"
              rows="3"
            />
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
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ $t('erp.buyers.details') }}</DialogTitle>
        </DialogHeader>

        <div v-if="selectedBuyer" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.buyers.buyerName')
              }}</Label>
              <p class="font-semibold">
                {{ selectedBuyer.buyerName }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.buyers.contactPerson')
              }}</Label>
              <p>{{ selectedBuyer.contactPerson }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.buyers.email')
              }}</Label>
              <p>{{ selectedBuyer.email }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.buyers.phone')
              }}</Label>
              <p>{{ selectedBuyer.phone }}</p>
            </div>
          </div>

          <div>
            <Label class="text-sm font-medium text-muted-foreground">{{
              $t('erp.buyers.address')
            }}</Label>
            <p>{{ selectedBuyer.address }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.buyers.country')
              }}</Label>
              <p>{{ selectedBuyer.country }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.buyers.status')
              }}</Label>
              <Badge :variant="selectedBuyer.status === 'active' ? 'default' : 'secondary'">
                {{ $t(`common.${selectedBuyer.status}`) }}
              </Badge>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.buyers.createdAt')
              }}</Label>
              <p>{{ formatDate(selectedBuyer.createdAt) }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.buyers.updatedAt')
              }}</Label>
              <p>{{ formatDate(selectedBuyer.updatedAt) }}</p>
            </div>
          </div>

          <!-- Business Metrics -->
          <div class="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div class="text-center">
              <p class="text-2xl font-bold text-blue-600">
                {{ selectedBuyer.totalOrders || 0 }}
              </p>
              <p class="text-sm text-muted-foreground">
                Total Orders
              </p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-green-600">
                ${{ (selectedBuyer.totalValue || 0).toLocaleString() }}
              </p>
              <p class="text-sm text-muted-foreground">
                Total Value
              </p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-yellow-600">
                {{ selectedBuyer.rating || 0 }}/5
              </p>
              <p class="text-sm text-muted-foreground">
                Rating
              </p>
            </div>
          </div>

          <div v-if="selectedBuyer.notes">
            <Label class="text-sm font-medium text-muted-foreground">{{
              $t('erp.buyers.notes')
            }}</Label>
            <p class="mt-1 p-3 bg-muted/30 rounded-md">
              {{ selectedBuyer.notes }}
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
          <DialogTitle>{{ $t('erp.buyers.confirmDelete') }}</DialogTitle>
        </DialogHeader>

        <p class="text-muted-foreground">
          {{ $t('erp.buyers.deleteMessage', { name: buyerToDelete?.buyerName }) }}
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
