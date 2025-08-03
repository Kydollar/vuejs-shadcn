<script setup>
import { ArrowDown, ArrowDownUp, ArrowUp, Edit, Eye, Loader2, Trash2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const props = defineProps({
  items: Array,
  loading: Boolean,
  sortBy: String,
  sortDirection: String,
  hasMore: Boolean,
  currentPage: Number,
  totalPages: Number,
  totalItems: Number,
  pageSize: Number,
})

const emit = defineEmits([
  'sort',
  'view',
  'edit',
  'delete',
  'deleteSelected',
  'loadMore',
])

const selectedIds = ref([])

function toggleSelect(id) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(i => i !== id)
  }
  else {
    selectedIds.value.push(id)
  }
}

const isSelected = id => selectedIds.value.includes(id)
const isAllSelected = computed(() =>
  props.items.length > 0
  && props.items.every(item => selectedIds.value.includes(item.id)),
)

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  }
  else {
    selectedIds.value = props.items.map(item => item.id)
  }
}

// v-model bridge for checkbox select all
const allChecked = computed({
  get: () => isAllSelected.value,
  set: () => toggleSelectAll(),
})

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}
</script>

<template>
  <UiCard>
    <UiCardHeader class="flex items-center justify-between">
      <UiCardTitle>{{ $t('erp.buyers.list') }}</UiCardTitle>
      <UiButton
        v-if="selectedIds.length > 0"
        variant="destructive"
        @click="() => emit('deleteSelected', selectedIds)"
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
                />
              </UiTableHead>
              <UiTableHead class="cursor-pointer" @click="() => emit('sort', 'buyerName')">
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
              <UiTableHead class="cursor-pointer" @click="() => emit('sort', 'createdAt')">
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
            <template v-if="loading && items.length === 0">
              <UiTableRow v-for="n in 5" :key="n">
                <UiTableCell><UiSkeleton class="h-4 w-4" /></UiTableCell>
                <UiTableCell><UiSkeleton class="h-4 w-[150px]" /></UiTableCell>
                <UiTableCell><UiSkeleton class="h-4 w-[150px]" /></UiTableCell>
                <UiTableCell><UiSkeleton class="h-4 w-[100px]" /></UiTableCell>
                <UiTableCell><UiSkeleton class="h-4 w-[100px]" /></UiTableCell>
                <UiTableCell><UiSkeleton class="h-4 w-[100px]" /></UiTableCell>
                <UiTableCell><UiSkeleton class="h-4 w-[80px]" /></UiTableCell>
              </UiTableRow>
            </template>

            <UiTableRow v-else-if="items.length === 0">
              <UiTableCell colspan="7" class="text-center py-8 text-muted-foreground">
                {{ $t('erp.buyers.noData') }}
              </UiTableCell>
            </UiTableRow>

            <UiTableRow v-for="item in items" v-else :key="item.id">
              <UiTableCell>
                <UiCheckbox
                  :model-value="isSelected(item.id)"
                  @update:model-value="() => toggleSelect(item.id)"
                />
              </UiTableCell>
              <UiTableCell>
                <div class="font-semibold">
                  {{ item.buyerName }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ item.email }}
                </div>
              </UiTableCell>
              <UiTableCell>
                <div class="font-medium">
                  {{ item.contactPerson || '-' }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ item.phone || '-' }}
                </div>
              </UiTableCell>
              <UiTableCell>
                <div class="text-center">
                  {{ item.country }}
                </div>
              </UiTableCell>
              <UiTableCell>
                <UiBadge :variant="item.status === 'active' ? 'default' : 'secondary'">
                  {{ $t(`common.${item.status}`) }}
                </UiBadge>
              </UiTableCell>
              <UiTableCell>
                <div class="text-sm">
                  {{ formatDate(item.createdAt) }}
                </div>
              </UiTableCell>
              <UiTableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <UiButton variant="ghost" size="sm" @click="() => emit('view', item)">
                    <Eye class="h-4 w-4" />
                  </UiButton>
                  <UiButton variant="ghost" size="sm" @click="() => emit('edit', item)">
                    <Edit class="h-4 w-4" />
                  </UiButton>
                  <UiButton variant="ghost" size="sm" @click="() => emit('delete', item)">
                    <Trash2 class="h-4 w-4" />
                  </UiButton>
                </div>
              </UiTableCell>
            </UiTableRow>
          </UiTableBody>
        </UiTable>
      </div>

      <div class="flex items-center justify-between mt-4">
        <div class="flex items-center gap-2">
          <UiButton v-if="hasMore" :disabled="loading" variant="outline" @click="() => emit('loadMore')">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin mr-2" />
            {{ $t('common.loadMore') }}
          </UiButton>
        </div>
      </div>

      <div class="flex items-center justify-between mt-4">
        <p class="text-sm text-muted-foreground">
          {{ $t('common.page') }} {{ currentPage }} {{ $t('common.of') }} {{ totalPages }}
        </p>
        <div class="flex items-center gap-2">
          <UiButton
            v-if="hasMore"
            :disabled="loading"
            variant="outline"
            @click="() => emit('loadMore')"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ $t('common.loadMore', { count: `(${totalItems - currentPage * (pageSize ?? 0)})` }) }}
          </UiButton>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>
