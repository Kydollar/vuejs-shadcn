<script setup>
import { cn } from '@/lib/utils'

const props = defineProps({
  title: String,
  description: String,
  sticky: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <header
    :class="
      cn(
        'flex flex-col md:flex-row gap-2 p-2 justify-between shadow-xs',
        props.sticky ? 'sticky top-0 z-40 bg-background' : '',
      )
    "
  >
    <main>
      <h1 class="text-2xl font-bold">
        {{ props.title }}
      </h1>
      <p v-if="props.description" class="text-muted-foreground">
        {{ props.description }}
      </p>
    </main>

    <aside class="flex items-center gap-2">
      <slot name="actions" />
    </aside>
  </header>
</template>
