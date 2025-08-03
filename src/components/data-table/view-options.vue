<script setup>
import { Settings2 } from 'lucide-vue-next'
import { computed } from 'vue'

// Props
const props = defineProps({
  table: Object,
})

// Columns yang bisa di-hide
const columns = computed(() =>
  props.table
    .getAllColumns()
    .filter(column => typeof column.accessorFn !== 'undefined' && column.getCanHide()),
)
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton variant="outline" size="sm" class="hidden h-8 ml-auto lg:flex">
        <Settings2 class="size-4 mr-2" />
        View
      </UiButton>
    </UiDropdownMenuTrigger>

    <UiDropdownMenuContent align="end" class="w-[150px]">
      <UiDropdownMenuLabel>Toggle columns</UiDropdownMenuLabel>
      <UiDropdownMenuSeparator />

      <UiDropdownMenuCheckboxItem
        v-for="column in columns"
        :key="column.id"
        class="capitalize"
        :model-value="column.getIsVisible()"
        @update:model-value="value => column.toggleVisibility(!!value)"
      >
        {{ column.id }}
      </UiDropdownMenuCheckboxItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
