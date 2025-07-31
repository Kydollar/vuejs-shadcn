<script setup>
import Loading from '@/components/Loading.vue'
</script>

<template>
  <Suspense>
    <template #default>
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.fullPath" />
      </RouterView>
    </template>
    <template #fallback>
      <Loading />
    </template>
  </Suspense>
</template>
