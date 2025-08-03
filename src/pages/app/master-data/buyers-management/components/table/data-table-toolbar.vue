<script setup>
import { X } from 'lucide-vue-next'

import DataTableFacetedFilter from '@/components/data-table/faceted-filter.vue'
import DataTableViewOptions from '@/components/data-table/view-options.vue'
import { Input } from '@/components/ui/input'

import { priorities, statuses } from '../data/data'

const props = defineProps({
  table: {
    type: Object,
    required: true,
  },
})

const isFiltered = computed(() => props.table.getState().columnFilters.length > 0)
</script>

<template>
  <div class="flex items-center justify-between">
    <div
      class="flex flex-col items-start flex-1 space-y-2 md:items-center md:space-x-2 md:space-y-0 md:flex-row"
    >
      <Input
        placeholder="Filter tasks..."
        :model-value="table.getColumn('title')?.getFilterValue() ?? ''"
        class="h-8 w-[150px] lg:w-[250px]"
        @input="table.getColumn('title')?.setFilterValue($event.target.value)"
      />

      <div class="space-x-2">
        <DataTableFacetedFilter
          v-if="table.getColumn('status')"
          :column="table.getColumn('status')"
          title="Status"
          :options="statuses"
        />
        <DataTableFacetedFilter
          v-if="table.getColumn('priority')"
          :column="table.getColumn('priority')"
          title="Priority"
          :options="priorities"
        />
      </div>

      <UiButton
        v-if="isFiltered"
        variant="ghost"
        class="h-8 px-2 lg:px-3"
        @click="table.resetColumnFilters()"
      >
        Reset
        <X class="size-4" />
      </UiButton>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>
