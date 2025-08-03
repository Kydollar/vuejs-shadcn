<script setup>
import { ref, watch } from 'vue'

import Page from '@/components/global-layout/basic-page.vue'
import SortSelect from '@/components/sort-select/index.vue'
import AppCard from './components/app-card.vue'
import apps from './components/data/apps'

// Reactive states
const appList = ref(apps)
const searchTerm = ref('')
const appType = ref('all') // 'all' | 'connected' | 'notConnected'
const sort = ref('asc') // 'asc' | 'desc'

const appTypes = ['all', 'connected', 'notConnected']

// Watchers
watch(searchTerm, (newValue) => {
  if (!newValue) {
    appList.value = apps
    return
  }

  appList.value = apps.filter((app) => {
    return app.name.toLowerCase().includes(newValue.toLowerCase())
  })
})

watch(sort, (newValue) => {
  appList.value = [...apps].sort((a, b) => {
    return newValue === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  })
})

watch(appType, (newValue) => {
  appList.value = apps.filter((app) => {
    if (newValue === 'all')
      return true
    return newValue === 'connected' ? app.connected : !app.connected
  })
})
</script>

<template>
  <Page title="Apps" description="Apps description" sticky>
    <div class="flex items-end justify-between sm:items-center">
      <div class="flex flex-col gap-4 sm:flex-row">
        <UiInput
          v-model:model-value="searchTerm"
          placeholder="Filter apps..."
          class="h-9 w-40 lg:w-[250px]"
        />

        <UiSelect v-model:model-value="appType">
          <UiSelectTrigger class-name="w-36">
            <UiSelectValue>{{ appType }}</UiSelectValue>
          </UiSelectTrigger>
          <UiSelectContent>
            <UiSelectItem v-for="type in appTypes" :key="type" :value="type">
              {{ type }}
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>
      </div>

      <SortSelect v-model:sort="sort" />
    </div>

    <main class="grid grid-cols-1 gap-4 mt-2 lg:grid-cols-3">
      <AppCard v-for="(app, index) in appList" :key="index" :app="app" />
    </main>
  </Page>
</template>

<style scoped></style>

<route lang="yaml">
meta:
  auth: true
</route>
