<script setup>
import {
  BarChart3,
  CheckCircle,
  Edit,
  Eye,
  Factory,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useFactoriesStore } from '@/stores/example/factories'

const factoriesStore = useFactoriesStore()

// State
const searchQuery = ref('')
const statusFilter = ref('all')
const locationFilter = ref('all')
const showDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const factoryToDelete = ref(null)

// Form data
const formData = ref({
  factoryName: '',
  factoryCode: '',
  location: '',
  address: '',
  managerName: '',
  managerPhone: '',
  email: '',
  capacity: 0,
  currentLoad: 0,
  specialization: '',
  status: 'active',
  establishedDate: '',
})

// Store getters (reactive)
const { factories, loading, selectedFactory, activeFactories, factoryCapacityUtilization } = storeToRefs(factoriesStore)

// Computed
const uniqueLocations = computed(() => {
  if (!factories.value || factories.value.length === 0) {
    return []
  }
  return [...new Set(factories.value.map(factory => factory?.location).filter(Boolean))].sort()
})

const filteredFactories = computed(() => {
  // Pastikan factories sudah ter-load dan tidak empty
  if (!factories.value || factories.value.length === 0) {
    return []
  }

  let filtered = factories.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((factory) => {
      const searchInSpecialization = Array.isArray(factory?.specialization)
        ? factory.specialization.some(spec => spec.toLowerCase().includes(query))
        : (typeof factory?.specialization === 'string' && factory.specialization.toLowerCase().includes(query))

      return factory?.factoryName?.toLowerCase().includes(query)
        || factory?.factoryCode?.toLowerCase().includes(query)
        || factory?.location?.toLowerCase().includes(query)
        || factory?.managerName?.toLowerCase().includes(query)
        || factory?.contactPerson?.toLowerCase().includes(query)
        || searchInSpecialization
    })
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(factory => factory.status === statusFilter.value)
  }

  // Location filter
  if (locationFilter.value !== 'all') {
    filtered = filtered.filter(factory => factory.location === locationFilter.value)
  }

  return filtered
})

// Methods
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getStatusVariant(status) {
  switch (status) {
    case 'active': return 'default'
    case 'maintenance': return 'secondary'
    case 'inactive': return 'destructive'
    default: return 'secondary'
  }
}

function resetForm() {
  formData.value = {
    factoryName: '',
    factoryCode: '',
    location: '',
    address: '',
    managerName: '',
    managerPhone: '',
    email: '',
    capacity: 0,
    currentLoad: 0,
    specialization: '',
    status: 'active',
    establishedDate: '',
  }
}

function openCreateDialog() {
  resetForm()
  isEditing.value = false
  showDialog.value = true
}

function editFactory(factory) {
  formData.value = {
    ...factory,
    // Convert specialization array to string for form input
    specialization: Array.isArray(factory.specialization)
      ? factory.specialization.join(', ')
      : factory.specialization || '',
  }
  isEditing.value = true
  showDialog.value = true
}

function viewFactory(factory) {
  factoriesStore.selectedFactory = factory
  showViewDialog.value = true
}

function confirmDelete(factory) {
  factoryToDelete.value = factory
  showDeleteDialog.value = true
}

async function saveFactory() {
  try {
    // Prepare data with specialization as array
    const factoryData = {
      ...formData.value,
      // Convert specialization string to array
      specialization: formData.value.specialization
        ? formData.value.specialization.split(',').map(s => s.trim()).filter(s => s)
        : [],
    }

    if (isEditing.value) {
      await factoriesStore.updateFactory(factoryData.id, factoryData)
    }
    else {
      const newFactory = {
        ...factoryData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        certifications: [],
      }
      await factoriesStore.createFactory(newFactory)
    }
    showDialog.value = false
    resetForm()
  }
  catch (error) {
    console.error('Error saving factory:', error)
  }
}

async function handleDelete() {
  try {
    await factoriesStore.deleteFactory(factoryToDelete.value.id)
    showDeleteDialog.value = false
    factoryToDelete.value = null
  }
  catch (error) {
    console.error('Error deleting factory:', error)
  }
}

// Initialize
onMounted(async () => {
  // Prevent multiple fetch calls during navigation
  if (factories.value.length === 0) {
    await factoriesStore.fetchFactories()
  }
})

// console.table('filteredFactories', filteredFactories)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('erp.factories.title') }}
        </h1>
        <p class="text-muted-foreground">
          {{ $t('erp.factories.subtitle') }}
        </p>
      </div>
      <Button class="gap-2" :disabled="loading" @click="openCreateDialog">
        <Plus class="h-4 w-4" />
        {{ $t('erp.factories.addFactory') }}
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Factory class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.factories.stats.total') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ factories.length }}</span>
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
                {{ $t('erp.factories.stats.active') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ activeFactories.length }}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <BarChart3 class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.factories.stats.capacity') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ factoryCapacityUtilization }}%</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <MapPin class="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.factories.stats.locations') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ uniqueLocations.length }}</span>
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
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                v-model="searchQuery"
                :placeholder="$t('erp.factories.search')"
                class="pl-10"
              />
            </div>
          </div>
          <Select v-model="statusFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue :placeholder="$t('erp.factories.filterStatus')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {{ $t('common.all') }}
              </SelectItem>
              <SelectItem value="active">
                {{ $t('common.active') }}
              </SelectItem>
              <SelectItem value="maintenance">
                {{ $t('erp.factories.maintenance') }}
              </SelectItem>
              <SelectItem value="inactive">
                {{ $t('common.inactive') }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="locationFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue :placeholder="$t('erp.factories.filterLocation')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {{ $t('common.all') }}
              </SelectItem>
              <SelectItem v-for="location in uniqueLocations" :key="location" :value="location">
                {{ location }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Factories Table -->
    <Card>
      <CardHeader>
        <CardTitle>{{ $t('erp.factories.list') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ $t('erp.factories.table.name') }}</TableHead>
                <TableHead>{{ $t('erp.factories.table.location') }}</TableHead>
                <TableHead>{{ $t('erp.factories.table.capacity') }}</TableHead>
                <TableHead>{{ $t('erp.factories.table.specialization') }}</TableHead>
                <TableHead>{{ $t('erp.factories.table.status') }}</TableHead>
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
                    <Skeleton class="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <div class="flex justify-end gap-2">
                      <Skeleton class="h-8 w-8" />
                      <Skeleton class="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              </template>

              <TableRow v-else-if="filteredFactories.length === 0">
                <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
                  {{ $t('erp.factories.noData') }}
                </TableCell>
              </TableRow>

              <TableRow v-for="factory in filteredFactories" v-else :key="factory?.id">
                <TableCell class="font-medium">
                  <div>
                    <div class="font-semibold">
                      {{ factory?.factoryName }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ factory?.factoryCode }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <MapPin class="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div class="font-medium">
                        {{ factory?.location }}
                      </div>
                      <div class="text-sm text-muted-foreground">
                        {{ factory?.managerName }}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div class="font-medium">
                      {{ (factory?.currentLoad || 0).toLocaleString() }} / {{ (factory.capacity || 0).toLocaleString() }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ factory?.capacity > 0 ? Math.round(((factory?.currentLoad || 0) / factory?.capacity) * 100) : 0 }}% utilized
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm">
                    <template v-if="Array.isArray(factory?.specialization)">
                      {{ factory.specialization.join(', ') }}
                    </template>
                    <template v-else>
                      {{ factory?.specialization || 'N/A' }}
                    </template>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(factory?.status)">
                    {{ $t(`erp.factories.${factory?.status}`) }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" @click="viewFactory(factory)">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="editFactory(factory)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="confirmDelete(factory)">
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
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? $t('erp.factories.edit') : $t('erp.factories.addFactory') }}
          </DialogTitle>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="saveFactory">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="factoryName">{{ $t('erp.factories.factoryName') }} *</Label>
              <Input
                id="factoryName"
                v-model="formData.factoryName"
                required
                :placeholder="$t('erp.factories.factoryNamePlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="factoryCode">{{ $t('erp.factories.factoryCode') }} *</Label>
              <Input
                id="factoryCode"
                v-model="formData.factoryCode"
                required
                :placeholder="$t('erp.factories.factoryCodePlaceholder')"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="location">{{ $t('erp.factories.location') }} *</Label>
              <Input
                id="location"
                v-model="formData.location"
                required
                :placeholder="$t('erp.factories.locationPlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="managerName">{{ $t('erp.factories.managerName') }} *</Label>
              <Input
                id="managerName"
                v-model="formData.managerName"
                required
                :placeholder="$t('erp.factories.managerNamePlaceholder')"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="address">{{ $t('erp.factories.address') }}</Label>
            <Textarea
              id="address"
              v-model="formData.address"
              :placeholder="$t('erp.factories.addressPlaceholder')"
              rows="3"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="email">{{ $t('erp.factories.email') }} *</Label>
              <Input
                id="email"
                v-model="formData.email"
                type="email"
                required
                :placeholder="$t('erp.factories.emailPlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="managerPhone">{{ $t('erp.factories.managerPhone') }} *</Label>
              <Input
                id="managerPhone"
                v-model="formData.managerPhone"
                required
                :placeholder="$t('erp.factories.managerPhonePlaceholder')"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="capacity">{{ $t('erp.factories.capacity') }} *</Label>
              <Input
                id="capacity"
                v-model.number="formData.capacity"
                type="number"
                required
                :placeholder="$t('erp.factories.capacityPlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="currentLoad">{{ $t('erp.factories.currentLoad') }}</Label>
              <Input
                id="currentLoad"
                v-model.number="formData.currentLoad"
                type="number"
                :placeholder="$t('erp.factories.currentLoadPlaceholder')"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="specialization">{{ $t('erp.factories.specialization') }}</Label>
            <Input
              id="specialization"
              v-model="formData.specialization"
              :placeholder="$t('erp.factories.specializationPlaceholder')"
            />
            <p class="text-xs text-muted-foreground">
              Separate multiple specializations with commas (e.g., T-Shirts, Polo Shirts, Casual Wear)
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="status">{{ $t('erp.factories.status') }}</Label>
              <Select v-model="formData.status">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {{ $t('common.active') }}
                  </SelectItem>
                  <SelectItem value="maintenance">
                    {{ $t('erp.factories.maintenance') }}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {{ $t('common.inactive') }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="establishedDate">{{ $t('erp.factories.establishedDate') }}</Label>
              <Input
                id="establishedDate"
                v-model="formData.establishedDate"
                type="date"
              />
            </div>
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
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ $t('erp.factories.details') }}</DialogTitle>
        </DialogHeader>

        <div v-if="selectedFactory" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.factories.factoryName') }}</Label>
              <p class="font-semibold">
                {{ selectedFactory.factoryName }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.factories.factoryCode') }}</Label>
              <p :class="{ 'text-muted-foreground': !selectedFactory?.factoryCode }">
                {{ selectedFactory.factoryCode || 'N/A' }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.factories.location') }}</Label>
              <p>{{ selectedFactory.location }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.factories.managerName') }}</Label>
              <p :class="{ 'text-muted-foreground italic': !selectedFactory.managerName }">
                {{ selectedFactory.managerName || 'Not specified' }}
              </p>
            </div>
          </div>

          <div>
            <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.factories.address') }}</Label>
            <p>{{ selectedFactory.address }}</p>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.factories.email') }}</Label>
              <p>{{ selectedFactory.email }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.factories.managerPhone') }}</Label>
              <p :class="{ 'text-muted-foreground italic': !selectedFactory.managerPhone }">
                {{ selectedFactory.managerPhone || 'No phone number' }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.factories.capacity') }}</Label>
              <p>{{ selectedFactory.capacity?.toLocaleString() }} units</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.factories.currentLoad') }}</Label>
              <p>
                {{ (selectedFactory.currentLoad || 0).toLocaleString() }} units
                <span v-if="selectedFactory.capacity > 0">
                  ({{ Math.round(((selectedFactory.currentLoad || 0) / selectedFactory.capacity) * 100) }}%)
                </span>
                <span v-else>
                  (N/A)
                </span>
              </p>
            </div>
          </div>

          <div>
            <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.factories.specialization') }}</Label>
            <div v-if="Array.isArray(selectedFactory.specialization)" class="flex flex-wrap gap-2 mt-1">
              <Badge v-for="spec in selectedFactory.specialization" :key="spec" variant="outline">
                {{ spec }}
              </Badge>
            </div>
            <p v-else>
              {{ selectedFactory.specialization || 'N/A' }}
            </p>
          </div>

          <div v-if="selectedFactory.certifications?.length" class="space-y-2">
            <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.factories.certifications') }}</Label>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="cert in selectedFactory.certifications" :key="cert" variant="secondary">
                {{ cert }}
              </Badge>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.factories.status') }}</Label>
              <Badge :variant="getStatusVariant(selectedFactory.status)">
                {{ $t(`erp.factories.${selectedFactory.status}`) }}
              </Badge>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{ $t('erp.factories.establishedDate') }}</Label>
              <p>{{ formatDate(selectedFactory.establishedDate) }}</p>
            </div>
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
          <DialogTitle>{{ $t('erp.factories.confirmDelete') }}</DialogTitle>
        </DialogHeader>

        <p class="text-muted-foreground">
          {{ $t('erp.factories.deleteMessage', { name: factoryToDelete?.factoryName }) }}
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
