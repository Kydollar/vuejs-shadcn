<script setup>
const props = defineProps({
  app: Object,
})
</script>

<template>
  <UiCard class="relative">
    <UiCardHeader>
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-center p-2 rounded-lg size-10 bg-muted">
          <component :is="props.app.logo" />
        </div>
        <UiButton
          :variant="props.app.connected ? 'secondary' : 'outline'"
          size="sm"
        >
          {{ props.app.connected ? 'Connected' : 'Connect' }}
        </UiButton>
      </div>
    </UiCardHeader>
    <UiCardContent>
      <UiCardTitle>
        {{ props.app.name }}
      </UiCardTitle>
      <UiCardDescription class="mt-2">
        {{ props.app.desc }}
      </UiCardDescription>
    </UiCardContent>
  </UiCard>
</template>

<style scoped>
</style>
