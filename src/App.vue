<script setup>
import Loading from '@/components/loading.vue'
</script>

<template>
  <Suspense>
    <template #default>
      <RouterView />
    </template>
    <template #fallback>
      <Loading />
    </template>
  </Suspense>
</template>
