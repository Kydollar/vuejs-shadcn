<script setup>
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps({
  column: Object,
  title: String,
})
</script>

<script>
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    v-if="props.column.getCanSort()"
    :class="cn('flex items-center space-x-2', $attrs.class ?? '')"
  >
    <UiDropdownMenu>
      <UiDropdownMenuTrigger as-child>
        <UiButton variant="ghost" size="sm" class="-ml-3 h-8 data-[state=open]:bg-accent">
          <span>{{ props.title }}</span>
          <ArrowDown v-if="props.column.getIsSorted() === 'desc'" class="size-4 ml-2" />
          <ArrowUp v-else-if="props.column.getIsSorted() === 'asc'" class="size-4 ml-2" />
          <ChevronsUpDown v-else class="size-4 ml-2" />
        </UiButton>
      </UiDropdownMenuTrigger>
      <UiDropdownMenuContent align="start">
        <UiDropdownMenuItem @click="props.column.toggleSorting(false)">
          <ArrowUp class="mr-2 size-4 text-muted-foreground/70" />
          Asc
        </UiDropdownMenuItem>
        <UiDropdownMenuItem @click="props.column.toggleSorting(true)">
          <ArrowDown class="mr-2 size-4 text-muted-foreground/70" />
          Desc
        </UiDropdownMenuItem>
        <UiDropdownMenuSeparator />
        <UiDropdownMenuItem @click="props.column.toggleVisibility(false)">
          <EyeOff class="mr-2 size-4 text-muted-foreground/70" />
          Hide
        </UiDropdownMenuItem>
      </UiDropdownMenuContent>
    </UiDropdownMenu>
  </div>

  <div v-else :class="$attrs.class">
    {{ props.title }}
  </div>
</template>
