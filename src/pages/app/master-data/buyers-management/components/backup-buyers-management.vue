<script setup>
import {
  AlertCircle,
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  Building2,
  CheckCircle,
  Edit,
  Eye,
  Globe,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { useBuyersStore } from '@/stores/master-data/buyers'

const buyersStore = useBuyersStore()

// State management for local component UI
const searchQuery = ref('')
const statusFilter = ref('all')
const countryFilter = ref('all')
const showDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const buyerToDelete = ref(null)

const formData = ref({
  buyerName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  country: 'Indonesia',
  status: 'active',
  notes: '',
})

// Accessing state and getters from the Pinia store with reactivity
const {
  buyers,
  loadingBuyers,
  buyersError,
  // Pagination
  currentPage,
  // pageSize,
  totalPages,
  totalItems,
  hasMoreBuyers,
  // Filter dan Sorting
  sortBy,
  sortDirection,
  // Item yang dipilih
  selectedBuyer,
  // Statistik
  countries,
  totalBuyers,
  activeBuyers,
  inactiveBuyers,
  loadingStats,
  statsError,
} = storeToRefs(buyersStore)

// --- Handle fetching data with filters/sorting ---
let debounceTimeout = null

function applyFiltersAndFetch() {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  buyersStore.query = searchQuery.value
  buyersStore.status = statusFilter.value
  buyersStore.country = countryFilter.value

  // Panggil fetchBuyers di store untuk mereset dan memuat data baru
  buyersStore.fetchBuyers()
}

// Watchers that trigger the fetch action on the store
watch([statusFilter, countryFilter], () => {
  applyFiltersAndFetch()
})

watch(searchQuery, () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    applyFiltersAndFetch()
  }, 300)
})

function handleRefresh() {
  searchQuery.value = ''
  statusFilter.value = 'all'
  countryFilter.value = 'all'
  // Panggil fetchBuyers untuk memuat ulang data dengan filter default
  buyersStore.fetchBuyers()
}

// --- Action for sorting ---
function toggleSort(field) {
  // Update state di store, lalu panggil fetch untuk memuat ulang
  if (buyersStore.sortBy === field) {
    buyersStore.sortDirection = buyersStore.sortDirection === 'asc' ? 'desc' : 'asc'
  }
  else {
    buyersStore.sortBy = field
    buyersStore.sortDirection = 'asc'
  }
  // Panggil fetchBuyers untuk memuat data dengan sort baru
  buyersStore.fetchBuyers()
}

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
    country: 'Indonesia',
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
  buyersStore.selectBuyer(buyer)
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

// Initialization, checks if data needs to be fetched
onMounted(() => {
  if (buyers.value.length === 0) {
    buyersStore.fetchBuyers()
  }
  // Fetch stats when component is mounted
  buyersStore.fetchStats()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('erp.buyers.title') }}
        </h1>
        <p class="text-muted-foreground">
          {{ $t('erp.buyers.subtitle') }}
          <span v-if="totalItems" class="ml-2">({{ totalItems }} total)</span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UiButton
          variant="outline"
          :disabled="loadingBuyers"
          @click="handleRefresh"
        >
          <RefreshCcw class="h-4 w-4" :class="loadingBuyers ? 'animate-spin' : ''" />
        </UiButton>
        <UiButton class="gap-2" :disabled="loadingBuyers" @click="openCreateDialog">
          <Plus class="h-4 w-4" />
          {{ $t('erp.buyers.addBuyer') }}
        </UiButton>
      </div>
    </div>

    <div v-if="buyersError" class="p-4 rounded-md bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 flex items-center gap-2">
      <AlertCircle class="h-5 w-5" />
      <p>Buyer Error: {{ buyersError }}</p>
    </div>

    <div v-if="statsError" class="p-4 rounded-md bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 flex items-center gap-2">
      <AlertCircle class="h-5 w-5" />
      <p>Stats Error: {{ statsError }}</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <UiCard>
        <UiCardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Building2 class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.stats.total') }}
              </p>
              <p class="text-2xl font-bold">
                <UiSkeleton v-if="loadingStats" class="h-8 w-12" />
                <span v-else>{{ totalBuyers }}</span>
              </p>
            </div>
          </div>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.stats.active') }}
              </p>
              <p class="text-2xl font-bold">
                <UiSkeleton v-if="loadingStats" class="h-8 w-12" />
                <span v-else>{{ activeBuyers }}</span>
              </p>
            </div>
          </div>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertCircle class="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.stats.inactive') }}
              </p>
              <p class="text-2xl font-bold">
                <UiSkeleton v-if="loadingStats" class="h-8 w-12" />
                <span v-else>{{ inactiveBuyers }}</span>
              </p>
            </div>
          </div>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Globe class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.stats.countries') }}
              </p>
              <p class="text-2xl font-bold">
                <UiSkeleton v-if="loadingStats" class="h-8 w-12" />
                <span v-else>{{ countries.length }}</span>
              </p>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <UiCard>
      <UiCardContent class="pt-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <UiInput
                v-model="searchQuery"
                :placeholder="$t('erp.buyers.search')"
                :disabled="loadingBuyers"
                class="pl-10"
              />
            </div>
          </div>
          <UiSelect v-model="statusFilter" :disabled="loadingBuyers">
            <UiSelectTrigger class="w-[180px]">
              <UiSelectValue :placeholder="$t('erp.buyers.filterStatus')" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="all">
                {{ $t('common.all') }}
              </UiSelectItem>
              <UiSelectItem value="active">
                {{ $t('common.active') }}
              </UiSelectItem>
              <UiSelectItem value="inactive">
                {{ $t('common.inactive') }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
          <UiSelect v-model="countryFilter" :disabled="loadingBuyers">
            <UiSelectTrigger class="w-[180px]">
              <UiSelectValue :placeholder="$t('erp.buyers.filterCountry')" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="all">
                {{ $t('common.all') }}
              </UiSelectItem>
              <UiSelectItem v-for="c in countries" :key="c" :value="c">
                {{ c }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
      </UiCardContent>
    </UiCard>

    <UiCard>
      <UiCardHeader>
        <UiCardTitle>{{ $t('erp.buyers.list') }}</UiCardTitle>
      </UiCardHeader>
      <UiCardContent>
        <div class="rounded-md border">
          <UiTable>
            <UiTableHeader>
              <UiTableRow>
                <UiTableHead
                  class="cursor-pointer"
                  @click="toggleSort('buyerName')"
                >
                  <div class="flex items-center gap-2">
                    {{ $t('erp.buyers.table.name') }}
                    <template v-if="sortBy === 'buyerName'">
                      <ArrowUp v-if="sortDirection === 'asc'" class="h-4 w-4" />
                      <ArrowDown v-else class="h-4 w-4" />
                    </template>
                    <ArrowDownUp v-else class="h-4 w-4 text-muted-foreground" />
                  </div>
                </UiTableHead>
                <UiTableHead>{{ $t('erp.buyers.table.contact') }}</UiTableHead>
                <UiTableHead>{{ $t('erp.buyers.table.country') }}</UiTableHead>
                <UiTableHead>{{ $t('erp.buyers.table.status') }}</UiTableHead>
                <UiTableHead
                  class="cursor-pointer"
                  @click="toggleSort('createdAt')"
                >
                  <div class="flex items-center gap-2">
                    {{ $t('erp.buyers.table.created') }}
                    <template v-if="sortBy === 'createdAt'">
                      <ArrowUp v-if="sortDirection === 'asc'" class="h-4 w-4" />
                      <ArrowDown v-else class="h-4 w-4" />
                    </template>
                    <ArrowDownUp v-else class="h-4 w-4 text-muted-foreground" />
                  </div>
                </UiTableHead>
                <UiTableHead class="text-right">
                  {{ $t('common.actions') }}
                </UiTableHead>
              </UiTableRow>
            </UiTableHeader>
            <UiTableBody>
              <template v-if="loadingBuyers && buyers.length === 0">
                <UiTableRow v-for="n in 5" :key="n">
                  <UiTableCell class="py-4">
                    <UiSkeleton class="h-4 w-[200px]" />
                  </UiTableCell>
                  <UiTableCell>
                    <UiSkeleton class="h-4 w-[150px]" />
                  </UiTableCell>
                  <UiTableCell>
                    <UiSkeleton class="h-4 w-[100px]" />
                  </UiTableCell>
                  <UiTableCell>
                    <UiSkeleton class="h-6 w-[80px]" />
                  </UiTableCell>
                  <UiTableCell>
                    <UiSkeleton class="h-4 w-[100px]" />
                  </UiTableCell>
                  <UiTableCell>
                    <div class="flex justify-end gap-2">
                      <UiSkeleton class="h-8 w-8" />
                      <UiSkeleton class="h-8 w-8" />
                    </div>
                  </UiTableCell>
                </UiTableRow>
              </template>

              <UiTableRow v-else-if="buyers.length === 0">
                <UiTableCell colspan="6" class="text-center py-8 text-muted-foreground">
                  {{ $t('erp.buyers.noData') }}
                </UiTableCell>
              </UiTableRow>

              <UiTableRow v-for="buyer in buyers" v-else :key="buyer?.id">
                <UiTableCell class="font-medium">
                  <div>
                    <div class="font-semibold">
                      {{ buyer?.buyerName }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ buyer?.email }}
                    </div>
                  </div>
                </UiTableCell>
                <UiTableCell>
                  <div v-if="buyer?.contactPerson && buyer?.phone">
                    <div class="font-medium">
                      {{ buyer?.contactPerson }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ buyer?.phone }}
                    </div>
                  </div>
                  <div v-else>
                    <div class="text-sm text-muted-foreground">
                      {{ $t('common.notAvailable') }}
                    </div>
                  </div>
                </UiTableCell>
                <UiTableCell>
                  <div class="flex items-center gap-2">
                    <Globe class="h-4 w-4 text-muted-foreground" />
                    {{ buyer?.country }}
                  </div>
                </UiTableCell>
                <UiTableCell>
                  <UiBadge :variant="buyer?.status === 'active' ? 'default' : 'secondary'">
                    {{ $t(`common.${buyer?.status}`) }}
                  </UiBadge>
                </UiTableCell>
                <UiTableCell>
                  <div>
                    <div class="text-sm font-medium">
                      {{ formatDate(buyer?.createdAt) }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ buyer?.totalOrders || 0 }} orders
                    </div>
                  </div>
                </UiTableCell>
                <UiTableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <UiButton variant="ghost" size="sm" @click="viewBuyer(buyer)">
                      <Eye class="h-4 w-4" />
                    </UiButton>
                    <UiButton variant="ghost" size="sm" @click="editBuyer(buyer)">
                      <Edit class="h-4 w-4" />
                    </UiButton>
                    <UiButton variant="ghost" size="sm" @click="confirmDelete(buyer)">
                      <Trash2 class="h-4 w-4" />
                    </UiButton>
                  </div>
                </UiTableCell>
              </UiTableRow>
            </UiTableBody>
          </UiTable>
        </div>

        <div class="flex items-center justify-between mt-4">
          <p class="text-sm text-muted-foreground">
            {{ $t('common.page') }} {{ currentPage }} {{ $t('common.of') }} {{ totalPages }}
          </p>
          <div v-if="hasMoreBuyers" class="flex items-center gap-2">
            <UiButton
              :disabled="loadingBuyers"
              variant="outline"
              @click="buyersStore.loadMoreBuyers({
                query: searchQuery,
                status: statusFilter,
                country: countryFilter,
              })"
            >
              <Loader2 v-if="loadingBuyers" class="mr-2 h-4 w-4 animate-spin" />
              {{ $t('common.loadMore') }}
            </UiButton>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <UiDialog v-model:open="showDialog">
      <UiDialogContent class="sm:max-w-md">
        <UiDialogHeader>
          <UiDialogTitle>
            {{ isEditing ? $t('erp.buyers.edit') : $t('erp.buyers.addBuyer') }}
          </UiDialogTitle>
        </UiDialogHeader>

        <form class="space-y-4" @submit.prevent="saveBuyer">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <UiLabel for="buyerName">
                {{ $t('erp.buyers.buyerName') }} *
              </UiLabel>
              <UiInput
                id="buyerName"
                v-model="formData.buyerName"
                required
                :placeholder="$t('erp.buyers.buyerNamePlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <UiLabel for="contactPerson">
                {{ $t('erp.buyers.contactPerson') }}
              </UiLabel>
              <UiInput
                id="contactPerson"
                v-model="formData.contactPerson"
                :placeholder="$t('erp.buyers.contactPersonPlaceholder')"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <UiLabel for="email">
                {{ $t('erp.buyers.email') }}
              </UiLabel>
              <UiInput
                id="email"
                v-model="formData.email"
                type="email"
                :placeholder="$t('erp.buyers.emailPlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <UiLabel for="phone">
                {{ $t('erp.buyers.phone') }}
              </UiLabel>
              <UiInput
                id="phone"
                v-model="formData.phone"
                :placeholder="$t('erp.buyers.phonePlaceholder')"
              />
            </div>
          </div>

          <div class="space-y-2">
            <UiLabel for="address">
              {{ $t('erp.buyers.address') }}
            </UiLabel>
            <UiTextarea
              id="address"
              v-model="formData.address"
              :placeholder="$t('erp.buyers.addressPlaceholder')"
              rows="3"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <UiLabel for="country">
                {{ $t('erp.buyers.country') }} *
              </UiLabel>
              <UiCountryCombobox
                v-model="formData.country"
                :placeholder="$t('erp.buyers.countryPlaceholder')"
                :search-placeholder="$t('erp.buyers.searchCountryPlaceholder')"
                :empty-message="$t('erp.buyers.noCountryFound')"
                :loading-buyers-message="$t('erp.buyers.loadingBuyersCountries')"
                :load-more-message="$t('erp.buyers.loadMoreCountries')"
                :default-country="formData.country"
              />
            </div>
            <div class="space-y-2">
              <UiLabel for="status">
                {{ $t('erp.buyers.status') }}
              </UiLabel>
              <UiSelect v-model="formData.status">
                <UiSelectTrigger>
                  <UiSelectValue />
                </UiSelectTrigger>
                <UiSelectContent>
                  <UiSelectItem value="active">
                    {{ $t('common.active') }}
                  </UiSelectItem>
                  <UiSelectItem value="inactive">
                    {{ $t('common.inactive') }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
            </div>
          </div>

          <div class="space-y-2">
            <UiLabel for="notes">
              {{ $t('erp.buyers.notes') }}
            </UiLabel>
            <UiTextarea
              id="notes"
              v-model="formData.notes"
              :placeholder="$t('erp.buyers.notesPlaceholder')"
              rows="3"
            />
          </div>

          <UiDialogFooter>
            <UiButton type="button" variant="outline" @click="showDialog = false">
              {{ $t('common.cancel') }}
            </UiButton>
            <UiButton type="submit" :disabled="loadingBuyers">
              <Loader2 v-if="loadingBuyers" class="mr-2 h-4 w-4 animate-spin" />
              {{ isEditing ? $t('common.update') : $t('common.create') }}
            </UiButton>
          </UiDialogFooter>
        </form>
      </UiDialogContent>
    </UiDialog>

    <UiDialog v-model:open="showViewDialog">
      <UiDialogContent class="sm:max-w-md">
        <UiDialogHeader>
          <UiDialogTitle>{{ $t('erp.buyers.details') }}</UiDialogTitle>
        </UiDialogHeader>

        <div v-if="selectedBuyer" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <UiLabel class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.buyerName') }}
              </UiLabel>
              <p class="font-semibold">
                {{ selectedBuyer.buyerName }}
              </p>
            </div>
            <div>
              <UiLabel class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.contactPerson') }}
              </UiLabel>
              <p class="text-sm" :class="selectedBuyer.contactPerson ? '' : 'text-muted-foreground italic'">
                {{ selectedBuyer.contactPerson || $t('common.notProvided') }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <UiLabel class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.email') }}
              </UiLabel>
              <p class="text-sm" :class="selectedBuyer.email ? '' : 'text-muted-foreground italic'">
                {{ selectedBuyer.email || $t('common.notProvided') }}
              </p>
            </div>
            <div>
              <UiLabel class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.phone') }}
              </UiLabel>
              <p class="text-sm" :class="selectedBuyer.phone ? '' : 'text-muted-foreground italic'">
                {{ selectedBuyer.phone || $t('common.notProvided') }}
              </p>
            </div>
          </div>

          <div>
            <UiLabel class="text-sm font-medium text-muted-foreground">
              {{ $t('erp.buyers.address') }}
            </UiLabel>
            <p class="text-sm" :class="selectedBuyer.address ? '' : 'text-muted-foreground italic'">
              {{ selectedBuyer.address || $t('common.notProvided') }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <UiLabel class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.country') }}
              </UiLabel>
              <p>{{ selectedBuyer.country }}</p>
            </div>
            <div>
              <UiLabel class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.status') }}
              </UiLabel>
              <UiBadge :variant="selectedBuyer.status === 'active' ? 'default' : 'secondary'">
                {{ $t(`common.${selectedBuyer.status}`) }}
              </UiBadge>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <UiLabel class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.createdAt') }}
              </UiLabel>
              <p>{{ formatDate(selectedBuyer.createdAt) }}</p>
            </div>
            <div>
              <UiLabel class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.buyers.updatedAt') }}
              </UiLabel>
              <p>{{ formatDate(selectedBuyer.updatedAt) }}</p>
            </div>
          </div>

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

          <div>
            <UiLabel class="text-sm font-medium text-muted-foreground">
              {{ $t('erp.buyers.notes') }}
            </UiLabel>
            <div class="mt-1 p-3 bg-muted/30 rounded-md">
              <p class="text-sm" :class="selectedBuyer.notes ? '' : 'text-muted-foreground italic'">
                {{ selectedBuyer.notes || $t('common.noNotesAdded') }}
              </p>
            </div>
          </div>
        </div>

        <UiDialogFooter>
          <UiButton @click="showViewDialog = false">
            {{ $t('common.close') }}
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

    <UiDialog v-model:open="showDeleteDialog">
      <UiDialogContent class="sm:max-w-md">
        <UiDialogHeader>
          <UiDialogTitle>{{ $t('erp.buyers.confirmDelete') }}</UiDialogTitle>
        </UiDialogHeader>

        <p class="text-muted-foreground">
          {{ $t('erp.buyers.deleteMessage', { name: buyerToDelete?.buyerName }) }}
        </p>

        <UiDialogFooter>
          <UiButton variant="outline" @click="showDeleteDialog = false">
            {{ $t('common.cancel') }}
          </UiButton>
          <UiButton variant="destructive" :disabled="loadingBuyers" @click="handleDelete">
            <Loader2 v-if="loadingBuyers" class="mr-2 h-4 w-4 animate-spin" />
            {{ $t('common.delete') }}
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>
