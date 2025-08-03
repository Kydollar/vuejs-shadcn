<script setup>
const { code, subtitle, error } = defineProps({
  code: {
    type: Number,
    default: 404,
  },
  subtitle: {
    type: String,
    default: 'Page Not Found',
  },
  error: {
    type: String,
    default:
      'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
  },
})
</script>

<template>
  <div class="max-w-2xl mx-auto text-center">
    <h1 class="font-bold text-8xl">
      {{ code }}
    </h1>
    <h2 class="mt-4 text-2xl font-bold">
      {{ subtitle }}
    </h2>
    <p class="text-stone-400">
      {{ error }}
    </p>

    <footer class="mt-8">
      <slot>
        <div class="flex justify-center gap-2">
          <UiButton variant="outline" @click="$router.back()">
            Go Back
          </UiButton>

          <UiButton @click="$router.push('/')">
            Back to Home
          </UiButton>
        </div>
      </slot>
    </footer>
  </div>
</template>

<style scoped></style>
