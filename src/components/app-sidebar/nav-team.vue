<script setup>
import { ChevronRight } from 'lucide-vue-next'
import { useRoute } from 'vue-router'

import { useSidebar } from '@/components/ui/sidebar'

const { navMain } = defineProps(['navMain'])

const route = useRoute()

const { state, isMobile } = useSidebar()

function isCollapsed(menu) {
  const pathname = route.path
  navMain.forEach(group => {
    group.items.forEach(item => {
      if (item.url === pathname) {
        return true
      }
    })
  })
  return !!menu.items?.some(item => item.url === pathname)
}

function isActive(menu) {
  const pathname = route.path
  if (menu.url) {
    if (pathname === menu.url) return true
  }
  if (menu.items) {
    return menu.items.some(isActive) // cek semua subItem, rekursif
  }
  return false
}
</script>

<template>
  <UiSidebarGroup v-for="group in navMain" :key="group.title">
    <UiSidebarGroupLabel>{{ group.title }}</UiSidebarGroupLabel>
    <UiSidebarMenu>
      <template v-for="menu in group.items" :key="menu.title">
        <UiSidebarMenuItem v-if="!menu.items">
          <UiSidebarMenuButton as-child :is-active="isActive(menu)" :tooltip="menu.title">
            <RouterLink v-if="menu.url" :to="menu.url">
              <component :is="menu.icon" />
              <span>{{ menu.title }}</span>
            </RouterLink>
            <span v-else>
              <component :is="menu.icon" />
              <span>{{ menu.title }}</span>
            </span>
          </UiSidebarMenuButton>
        </UiSidebarMenuItem>

        <UiSidebarMenuItem v-else>
          <!-- sidebar expanded -->
          <UiCollapsible
            v-if="state !== 'collapsed' || isMobile"
            as-child
            :default-open="isCollapsed(menu)"
            class="group/collapsible"
          >
            <UiSidebarMenuItem>
              <UiCollapsibleTrigger as-child>
                <UiSidebarMenuButton :is-active="isActive(menu)" :tooltip="menu.title">
                  <component :is="menu.icon" v-if="menu.icon" />
                  <span>{{ menu.title }}</span>
                  <ChevronRight
                    class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  />
                </UiSidebarMenuButton>
              </UiCollapsibleTrigger>
            </UiSidebarMenuItem>
            <UiCollapsibleContent>
              <UiSidebarMenuSub>
                <UiSidebarMenuSubItem v-for="subItem in menu.items" :key="subItem.title">
                  <UiSidebarMenuSubButton as-child :is-active="isActive(subItem)">
                    <RouterLink v-if="subItem.url" :to="subItem.url">
                      <component :is="subItem.icon" v-if="subItem.icon" />
                      <span>{{ subItem.title }}</span>
                    </RouterLink>
                    <span v-else>
                      <component :is="subItem.icon" v-if="subItem.icon" />
                      <span>{{ subItem.title }}</span>
                    </span>
                  </UiSidebarMenuSubButton>
                </UiSidebarMenuSubItem>
              </UiSidebarMenuSub>
            </UiCollapsibleContent>
          </UiCollapsible>

          <!-- sidebar collapsed -->
          <UiDropdownMenu v-else>
            <UiDropdownMenuTrigger as-child>
              <UiSidebarMenuButton :tooltip="menu.title">
                <component :is="menu.icon" v-if="menu.icon" />
                <span>{{ menu.title }}</span>
              </UiSidebarMenuButton>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="start" side="right">
              <UiDropdownMenuLabel>{{ menu.title }}</UiDropdownMenuLabel>
              <UiDropdownMenuSeparator />
              <UiDropdownMenuItem v-for="subItem in menu.items" :key="subItem.title" as-child>
                <RouterLink v-if="subItem.url" :to="subItem.url">
                  <component :is="subItem.icon" v-if="subItem.icon" />
                  <span>{{ subItem.title }}</span>
                </RouterLink>
                <span v-else>
                  <component :is="subItem.icon" v-if="subItem.icon" />
                  <span>{{ subItem.title }}</span>
                </span>
              </UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
        </UiSidebarMenuItem>
      </template>
    </UiSidebarMenu>
  </UiSidebarGroup>
</template>
