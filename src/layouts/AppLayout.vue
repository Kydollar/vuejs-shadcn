<script setup>
import { useCookies } from '@vueuse/integrations/useCookies'
import { onErrorCaptured, ref } from 'vue'

import AppSidebar from '@/components/app-sidebar/index.vue'
import CommandMenuPanel from '@/components/command-menu-panel/index.vue'
import ThemePopover from '@/components/custom-theme/theme-popover.vue'
import ToggleMode from '@/components/toggle-mode.vue'

const defaultOpen = useCookies(['sidebar:state'])
const errorMessage = ref(null)

// Error boundary untuk menangkap error dari child components
onErrorCaptured((error, instance, info) => {
  console.error('AppLayout caught error:', error, info)
  errorMessage.value = error.message || 'An unexpected error occurred'
  return false // prevent error from propagating
})
</script>

<template>
  <UiSidebarProvider :default-open="defaultOpen.get('sidebar:state')">
    <AppSidebar />
    <UiSidebarInset
      class="w-full max-w-full peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)] peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]"
    >
      <header
        class="flex items-center gap-3 sm:gap-4 h-16 p-4 shrink-0 transition-[width,height] ease-linear"
      >
        <UiSidebarTrigger class="-ml-1" />
        <UiSeparator orientation="vertical" class="h-6" />
        <CommandMenuPanel />
        <div class="ml-auto flex items-center space-x-4">
          <LanguageChange />
          <ToggleMode />
          <ThemePopover />
        </div>
      </header>
      <div class="container mx-auto p-4 grow">
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Navigation Error
              </h3>
              <div class="mt-1 text-sm text-red-700">
                {{ errorMessage }}
              </div>
              <div class="mt-2">
                <button
                  class="text-sm text-red-600 hover:text-red-500 underline"
                  @click="errorMessage = null"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
        <Suspense>
          <template #default>
            <RouterView />
          </template>
          <template #fallback>
            <div class="flex items-center justify-center min-h-[400px]">
              <div class="flex flex-col items-center gap-2">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p class="text-sm text-muted-foreground">
                  Loading...
                </p>
              </div>
            </div>
          </template>
        </Suspense>
      </div>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>
