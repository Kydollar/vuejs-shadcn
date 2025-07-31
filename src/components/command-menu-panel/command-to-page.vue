<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useSidebar } from '@/composables/use-sidebar'

import CommandItemHasIcon from './command-item-has-icon.vue'

const emit = defineEmits(['click'])

const { navData, otherPages } = useSidebar()

function getFlatNavItems(navData) {
  const flatItems = []
  navData.forEach(group => {
    group.items.forEach(item => {
      if (item.items) {
        flatItems.push(...getFlatNavItems([item]))
      } else {
        flatItems.push(item)
      }
    })
  })
  return flatItems
}

const commands = getFlatNavItems([...(navData.value || []), ...(otherPages.value || [])])

const router = useRouter()
const route = useRoute()
function commandItemClick(url) {
  emit('click')
  if (route.fullPath !== url) {
    router.push(url)
  }
}
</script>

<template>
  <UiCommandGroup heading="Pages">
    <UiCommandItem
      v-for="command in commands"
      :key="command.title"
      :value="command.title"
      @click="commandItemClick(command.url)"
    >
      <CommandItemHasIcon :name="command.title" :icon="command.icon" />
    </UiCommandItem>
  </UiCommandGroup>
</template>

<style scoped></style>
