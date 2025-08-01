<script setup>
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// Function to change language and persist to localStorage
function changeLanguage(newLocale) {
  if (locale.value === newLocale)
    return

  locale.value = newLocale
  localStorage.setItem('language', newLocale)
  document.documentElement.setAttribute('lang', newLocale)
}
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <span>
        <Icon :icon="locale === 'en' ? 'flag:us-4x3' : 'flag:id-4x3'" class="size-6.5" />
      </span>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent class="w-56">
      <UiDropdownMenuLabel>{{ $t('changeLanguage') }}</UiDropdownMenuLabel>
      <UiDropdownMenuSeparator />
      <UiDropdownMenuRadioGroup :model-value="locale" @update:model-value="changeLanguage">
        <UiDropdownMenuRadioItem value="en">
          <Icon icon="flag:us-4x3" />
          <span class="ml-2">English</span>
        </UiDropdownMenuRadioItem>
        <UiDropdownMenuRadioItem value="id">
          <Icon icon="flag:id-4x3" />
          <span class="ml-2">Indonesian</span>
        </UiDropdownMenuRadioItem>
      </UiDropdownMenuRadioGroup>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
