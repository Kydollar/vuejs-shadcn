<script setup>
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps([
  'rows',
  'columns',
  'loading',
  'sort',
  'page',
  'pageSize',
])

const emit = defineEmits(['update:page', 'update:sort', 'update:search'])

const searchInput = ref('')

const table = useVueTable({
  data: computed(() => props.rows),
  columns: props.columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
})

function toggleSort(colId) {
  if (props.sort?.field === colId) {
    const next = props.sort.direction === 'asc' ? 'desc' : 'asc'
    emit('update:sort', { field: colId, direction: next })
  }
  else {
    emit('update:sort', { field: colId, direction: 'asc' })
  }
}

watch(searchInput, v => emit('update:search', v))
</script>

<template>
  <div class="space-y-4">
    <!-- Search -->
    <Input
      v-model="searchInput"
      placeholder="Search..."
      class="w-full max-w-sm"
    />

    <!-- Table -->
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            v-for="header in table.getHeaderGroups()[0].headers"
            :key="header.id"
            class="cursor-pointer select-none"
            @click="() => toggleSort(header.column.id)"
          >
            {{ header.column.columnDef.header }}
            <span v-if="props.sort?.field === header.column.id">
              {{ props.sort.direction === 'asc' ? '▲' : '▼' }}
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="row in table.getRowModel().rows"
          :key="row.id"
        >
          <TableCell
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
          >
            <slot name="cell" :cell="cell">
              {{ cell.getValue() }}
            </slot>
          </TableCell>
        </TableRow>

        <TableRow v-if="!rows.length && !loading">
          <TableCell :col-span="columns.length" class="text-center text-muted-foreground">
            No data found.
          </TableCell>
        </TableRow>
        <TableRow v-if="loading">
          <TableCell :col-span="columns.length" class="text-center text-muted-foreground">
            Loading...
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        :disabled="props.page === 1"
        @click="emit('update:page', props.page - 1)"
      >
        Previous
      </Button>
      <div class="text-sm text-muted-foreground">
        Page {{ props.page }}
      </div>
      <Button
        variant="outline"
        size="sm"
        :disabled="props.page * props.pageSize >= props.total"
        @click="emit('update:page', props.page + 1)"
      >
        Next
      </Button>
    </div>
  </div>
</template>
