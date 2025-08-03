<script setup>
import { X } from 'lucide-vue-next'
import { computed } from 'vue'

import DataTableFacetedFilter from '@/components/data-table/faceted-filter.vue'
import DataTableViewOptions from '@/components/data-table/view-options.vue'
import { Input } from '@/components/ui/input'

import { callTypes, userTypes } from '../data/data'

const props = defineProps(
  {
    table: {
      type: Object,
      required: true,
    },
  },
)

const isFiltered = computed(() => props.table.getState().columnFilters.length > 0)
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center flex-1 space-x-2">
      <Input
        placeholder="Filter tasks..."
        :model-value="(table.getColumn('username')?.getFilterValue()) ?? ''"
        class="h-8 w-[150px] lg:w-[250px]"
        @input="table.getColumn('username')?.setFilterValue($event.target.value)"
      />
      <DataTableFacetedFilter
        v-if="table.getColumn('role')"
        :column="table.getColumn('role')"
        title="Role"
        :options="callTypes"
      />
      <DataTableFacetedFilter
        v-if="table.getColumn('role')"
        :column="table.getColumn('role')"
        title="Role"
        :options="userTypes"
      />

      <UiButton
        v-if="isFiltered"
        variant="ghost"
        class="h-8 px-2 lg:px-3"
        @click="table.resetColumnFilters()"
      >
        Reset
        <X class="size-4 ml-2" />
      </UiButton>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>
