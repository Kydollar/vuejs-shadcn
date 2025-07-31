<script setup>
import { useColorMode } from '@vueuse/core'
import ToggleMode from '@/components/toggle-mode.vue'

const mode = useColorMode()
const logo = computed(() => {
  return mode.value === 'dark' ? '/logo.svg' : '/logo-black.svg'
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-4 min-w-screen">
    <main class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h1 class="flex items-center gap-2 text-xl font-bold">
          <img :src="logo" />
          <span>VUEJS SHADCN</span>
        </h1>
        <ToggleMode />
      </div>
      <UiCard>
        <RouterView />
      </UiCard>
    </main>
  </div>
</template>
