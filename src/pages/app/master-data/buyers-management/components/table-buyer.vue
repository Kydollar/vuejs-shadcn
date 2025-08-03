<script setup>
import { Icon } from '@iconify/vue'
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  Edit,
  Eye,
  Loader2,
  Search,
  Trash2,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'

import { getCountryCodeByName } from '@/lib/utils'
import { useBuyersStore } from '@/stores/master-data/buyers'

const emit = defineEmits(['editBuyer'])

const buyersStore = useBuyersStore()

// State management for local component UI
const searchQuery = ref('')
const statusFilter = ref('all')
const countryFilter = ref('all')
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const buyerToDelete = ref(null)
const selectedIds = ref([])

// Accessing state and getters from the Pinia store with reactivity
const {
  buyers,
  loadingBuyers,
  // Pagination
  currentPage,
  pageSize,
  totalPages,
  hasMoreBuyers,
  // Filter dan Sorting
  sortBy,
  sortDirection,
  // Item yang dipilih
  selectedBuyer,
  // Statistik
  countries,
  totalBuyers,
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

function handleEdit(buyer) {
  emit('editBuyer', buyer)
}

function viewBuyer(buyer) {
  buyersStore.selectBuyer(buyer)
  showViewDialog.value = true
}

function deleteBuyers() {
  try {
    const ids = Array.isArray(buyerToDelete.value?.id)
      ? buyerToDelete.value.id
      : [buyerToDelete.value?.id]

    buyersStore.deleteManyBuyers(ids)
    selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
    showDeleteDialog.value = false
    buyerToDelete.value = null
  }
  catch (error) {
    console.error('Error deleting buyer(s):', error)
  }
}

function confirmDelete(buyer) {
  buyerToDelete.value = buyer
  showDeleteDialog.value = true
}

function confirmDeleteSelected(ids) {
  buyerToDelete.value = { id: ids }
  showDeleteDialog.value = true
}

const isSelected = id => selectedIds.value.includes(id)
const isAllSelected = computed(() =>
  buyers.value.length > 0
  && buyers.value.every(item => selectedIds.value.includes(item.id)),
)
const allChecked = computed({
  get: () => isAllSelected.value,
  set: () => toggleSelectAll(),
})

function toggleSelect(id) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(i => i !== id)
  }
  else {
    selectedIds.value.push(id)
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  }
  else {
    selectedIds.value = buyers.value.map(item => item.id)
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
  <!-- Header -->
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

  <!-- Table Main -->
  <UiCard>
    <UiCardHeader class="flex items-center justify-between">
      <UiCardTitle>{{ $t('erp.buyers.list') }}</UiCardTitle>
      <UiButton
        v-if="selectedIds.length > 0"
        variant="destructive"
        @click="() => confirmDeleteSelected(selectedIds)"
      >
        {{ $t('common.deleteSelected') }} ({{ selectedIds.length }})
      </UiButton>
    </UiCardHeader>

    <UiCardContent>
      <div class="rounded-md border">
        <UiTable>
          <UiTableHeader>
            <UiTableRow>
              <UiTableHead class="w-[20px]">
                <UiCheckbox
                  v-model="allChecked"
                  class="mr-1"
                />
              </UiTableHead>
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
              <UiTableHead class="text-center">
                {{ $t('erp.buyers.table.country') }}
              </UiTableHead>
              <UiTableHead class="text-center">
                {{ $t('erp.buyers.table.status') }}
              </UiTableHead>
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
              <UiTableCell>
                <UiCheckbox
                  :model-value="isSelected(buyer.id)"
                  @update:model-value="() => toggleSelect(buyer.id)"
                />
              </UiTableCell>
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

              <UiTableCell class="text-center">
                <Icon :icon="`flag:${getCountryCodeByName(buyer?.country)}-4x3`" class="inline size-4 rounded-md" />
              </UiTableCell>
              <UiTableCell class="text-center">
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
                  <UiButton variant="ghost" size="sm" @click="handleEdit(buyer)">
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
            {{ $t('common.loadMore', { count: `(${totalBuyers - currentPage * (pageSize ?? 0)})` }) }}
          </UiButton>
        </div>
      </div>
    </UiCardContent>
  </UiCard>

  <!-- View Dialog -->
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
  <!-- Delete Confirmation Dialog -->
  <UiDialog v-model:open="showDeleteDialog">
    <UiDialogContent class="sm:max-w-md">
      <UiDialogHeader>
        <UiDialogTitle>{{ $t('erp.buyers.confirmDelete') }}</UiDialogTitle>
      </UiDialogHeader>

      <p class="text-muted-foreground">
        <template v-if="Array.isArray(buyerToDelete?.id)">
          {{ $t('erp.buyers.deleteSelectedMessage', { count: buyerToDelete.id.length }) }}
        </template>
        <template v-else>
          {{ $t('erp.buyers.deleteMessage', { name: buyerToDelete?.buyerName }) }}
        </template>
      </p>

      <UiDialogFooter>
        <UiButton variant="outline" @click="showDeleteDialog = false">
          {{ $t('common.cancel') }}
        </UiButton>
        <UiButton variant="destructive" :disabled="loadingBuyers" @click="deleteBuyers">
          <Loader2 v-if="loadingBuyers" class="mr-2 h-4 w-4 animate-spin" />
          {{ $t('common.delete') }}
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
