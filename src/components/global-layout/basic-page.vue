<script setup>
import BasicHeader from './basic-header.vue'

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
  <main>
    <BasicHeader :title="props.title" :description="props.description" :sticky="props.sticky">
      <template #actions>
        <slot name="actions" />
      </template>
    </BasicHeader>

    <main class="py-4">
      <slot />
    </main>
  </main>
</template>
