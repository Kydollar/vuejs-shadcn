<script setup>
import { countries } from 'countries-list'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Select country...',
  },
  searchPlaceholder: {
    type: String,
    default: 'Search country...',
  },
  emptyMessage: {
    type: String,
    default: 'No country found.',
  },
  loadingMessage: {
    type: String,
    default: 'Loading more countries...',
  },
  loadMoreMessage: {
    type: String,
    default: 'Load more countries...',
  },
  initialPageSize: {
    type: Number,
    default: 10,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  defaultCountry: {
    type: String,
    default: 'Indonesia',
  },
})

const emit = defineEmits(['update:modelValue'])

// State
const isOpen = ref(false)
const searchQuery = ref('')
const loadedCount = ref(props.initialPageSize)
const isLoadingMore = ref(false)
const listRef = ref(null)

// Computed
const countryOptions = computed(() => {
  const allCountries = Object.entries(countries).map(([_code, country]) => ({
    value: country.name,
    label: country.name,
  })).sort((a, b) => a.label.localeCompare(b.label))

  // Find default country (current modelValue or defaultCountry prop)
  const defaultCountry = props.modelValue || props.defaultCountry

  // Separate default country and others
  const defaultCountryOption = allCountries.find(country => country.value === defaultCountry)
  const otherCountries = allCountries.filter(country => country.value !== defaultCountry)

  // Put default country first, then others
  if (defaultCountryOption) {
    return [defaultCountryOption, ...otherCountries]
  }

  return allCountries
})

const filteredOptions = computed(() => {
  let filtered = countryOptions.value

  if (searchQuery.value) {
    filtered = filtered.filter(country =>
      country.label.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
    // When searching, show all results
    return filtered
  }

  // Apply pagination when not searching
  return filtered.slice(0, loadedCount.value)
})

const hasMore = computed(() => {
  if (searchQuery.value)
    return false
  return loadedCount.value < countryOptions.value.length
})

// Methods
function selectCountry(value) {
  emit('update:modelValue', value)
  isOpen.value = false
  searchQuery.value = ''
  resetPagination()
}

function resetPagination() {
  loadedCount.value = props.initialPageSize
  isLoadingMore.value = false
}

function loadMore() {
  if (isLoadingMore.value || !hasMore.value)
    return

  isLoadingMore.value = true

  setTimeout(() => {
    loadedCount.value += props.pageSize
    isLoadingMore.value = false
  }, 300)
}

function handleScroll(event) {
  const { scrollTop, scrollHeight, clientHeight } = event.target

  if (scrollTop + clientHeight >= scrollHeight * 0.8 && hasMore.value) {
    loadMore()
  }
}
</script>

<template>
  <UiPopover v-model:open="isOpen">
    <UiPopoverTrigger as-child>
      <UiButton
        variant="outline"
        role="combobox"
        :aria-expanded="isOpen"
        :class="cn(
          'w-full justify-between',
          !modelValue && 'text-muted-foreground',
        )"
      >
        {{
          modelValue
            ? countryOptions.find((country) => country.value === modelValue)?.label
            : placeholder
        }}
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </UiButton>
    </UiPopoverTrigger>
    <UiPopoverContent class="w-full p-0">
      <UiCommand>
        <UiCommandInput
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          class="h-9"
          @input="resetPagination"
        />
        <UiCommandList
          ref="listRef"
          class="max-h-60 overflow-auto"
          @scroll="handleScroll"
        >
          <UiCommandEmpty v-if="filteredOptions.length === 0">
            {{ emptyMessage }}
          </UiCommandEmpty>
          <UiCommandGroup v-if="filteredOptions.length > 0">
            <transition-group name="country-list" tag="div">
              <UiCommandItem
                v-for="option in filteredOptions"
                :key="option.value"
                :value="option.label"
                @select="selectCountry(option.value)"
              >
                {{ option.label }}
                <Check
                  :class="cn(
                    'ml-auto h-4 w-4',
                    option.value === modelValue ? 'opacity-100' : 'opacity-0',
                  )"
                />
              </UiCommandItem>
            </transition-group>

            <!-- Loading indicator -->
            <transition name="fade">
              <div
                v-if="isLoadingMore && !searchQuery"
                class="flex items-center justify-center py-3"
              >
                <Loader2 class="h-4 w-4 animate-spin text-muted-foreground" />
                <span class="ml-2 text-sm text-muted-foreground">{{ loadingMessage }}</span>
              </div>
            </transition>

            <!-- Load more button -->
            <transition name="fade">
              <div
                v-if="hasMore && !isLoadingMore && !searchQuery"
                class="flex items-center justify-center py-2"
              >
                <UiButton
                  variant="ghost"
                  size="sm"
                  class="w-full text-muted-foreground hover:text-foreground transition-colors"
                  @click="loadMore"
                >
                  {{ loadMoreMessage }}
                </UiButton>
              </div>
            </transition>
          </UiCommandGroup>
        </UiCommandList>
      </UiCommand>
    </UiPopoverContent>
  </UiPopover>
</template>

<style scoped>
/* Smooth transitions for country list */
.country-list-enter-active,
.country-list-leave-active {
  transition: all 0.3s ease;
}

.country-list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.country-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Fade transition for loaders */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Smooth scrolling for the command list */
.max-h-60 {
  scroll-behavior: smooth;
}

/* Loading skeleton animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
