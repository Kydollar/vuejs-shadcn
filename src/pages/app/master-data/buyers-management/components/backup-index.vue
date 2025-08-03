<script setup>
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Globe,
  Loader2,
  Plus,
  RefreshCcw,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'

import { useBuyersStore } from '@/stores/master-data/buyers'
import TableBuyer from './components/table-buyer.vue'
import TestTable from './components/test-table.vue'

const buyersStore = useBuyersStore()

// State management for local component UI
const searchQuery = ref('')
const statusFilter = ref('all')
const countryFilter = ref('all')
const showDialog = ref(false)
const isEditing = ref(false)

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
  totalItems,
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

async function handleRefresh() {
  searchQuery.value = ''
  statusFilter.value = 'all'
  countryFilter.value = 'all'
  // Panggil fetchBuyers untuk memuat ulang data dengan filter default
  await buyersStore.fetchBuyers()
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

// Initialization, checks if data needs to be fetched
onMounted(() => {
  if (buyers.value.length === 0) {
    buyersStore.fetchBuyers()
  }
  // Fetch stats when component is mounted
  buyersStore.fetchStats()
})

// new
watch(
  [
    () => buyersStore.query,
    () => buyersStore.status,
    () => buyersStore.country,
    () => buyersStore.sortBy,
    () => buyersStore.sortDirection,
    () => buyersStore.currentPage,
  ],
  () => {
    buyersStore.fetchBuyers()
  },
  { deep: true },
)

const columns = [
  { header: 'Name', accessorKey: 'buyerName' },
  { header: 'Email', accessorKey: 'email' },
  { header: 'Country', accessorKey: 'country' },
  { header: 'Status', accessorKey: 'status' },
  { header: 'Created', accessorKey: 'createdAt' },
]
</script>

<template>
  <UiSelect v-model="buyersStore.status" class="w-32">
    <UiSelectTrigger>Filter Status</UiSelectTrigger>
    <UiSelectContent>
      <UiSelectItem value="all">
        All
      </UiSelectItem>
      <UiSelectItem value="active">
        Active
      </UiSelectItem>
      <UiSelectItem value="inactive">
        Inactive
      </UiSelectItem>
    </UiSelectContent>
  </UiSelect>

  <UiSelect v-model="buyersStore.country" class="w-40">
    <UiSelectTrigger>Filter Country</UiSelectTrigger>
    <UiSelectContent>
      <UiSelectItem value="all">
        All
      </UiSelectItem>
      <UiSelectItem v-for="c in buyersStore.countries" :key="c" :value="c">
        {{ c }}
      </UiSelectItem>
    </UiSelectContent>
  </UiSelect>

  <TestTable
    :columns="columns"
    :rows="buyersStore.buyers"
    :total="buyersStore.totalItems"
    :page="buyersStore.currentPage"
    :page-size="buyersStore.pageSize"
    :sort="{
      field: buyersStore.sortBy,
      direction: buyersStore.sortDirection,
    }"
    :loading="buyersStore.loadingBuyers"
    @update:page="val => (buyersStore.currentPage = val)"
    @update:sort="
      sort => {
        buyersStore.sortBy = sort?.field
        buyersStore.sortDirection = sort?.direction
        buyersStore.currentPage = 1
      }
    "
    @update:search="
      val => {
        buyersStore.query = val
        buyersStore.currentPage = 1
      }
    "
  />
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
        <UiButton variant="outline" :disabled="loadingBuyers" @click="handleRefresh">
          <RefreshCcw class="h-4 w-4" :class="loadingBuyers ? 'animate-spin' : ''" />
        </UiButton>
        <UiButton class="gap-2" :disabled="loadingBuyers" @click="openCreateDialog">
          <Plus class="h-4 w-4" />
          {{ $t('erp.buyers.addBuyer') }}
        </UiButton>
      </div>
    </div>

    <div
      v-if="buyersError"
      class="p-4 rounded-md bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 flex items-center gap-2"
    >
      <AlertCircle class="h-5 w-5" />
      <p>Buyer Error: {{ buyersError }}</p>
    </div>

    <div
      v-if="statsError"
      class="p-4 rounded-md bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 flex items-center gap-2"
    >
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

    <TableBuyer @edit-buyer="editBuyer" />

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
  </div>
</template>
