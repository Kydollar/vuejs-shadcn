<script setup>
import { Check, CirclePlus } from 'lucide-vue-next'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

// Props
const props = defineProps({
  column: Object,
  title: String,
  options: {
    type: Array,
    required: true,
  },
})

// Data computed
const facets = computed(() => props.column?.getFacetedUniqueValues())
const selectedValues = computed(() => new Set(props.column?.getFilterValue()))

// Filter function
function filterFunction(list, term) {
  return list.filter(i => i.label.toLowerCase()?.includes(term))
}
</script>

<template>
  <UiPopover>
    <UiPopoverTrigger as-child>
      <UiButton variant="outline" size="sm" class="h-8 border-dashed">
        <CirclePlus class="size-4 mr-2" />
        {{ props.title }}

        <template v-if="selectedValues.size > 0">
          <UiSeparator orientation="vertical" class="h-4 mx-2" />
          <UiBadge variant="secondary" class="px-1 font-normal rounded-sm lg:hidden">
            {{ selectedValues.size }}
          </UiBadge>
          <div class="hidden space-x-1 lg:flex">
            <UiBadge
              v-if="selectedValues.size > 2"
              variant="secondary"
              class="px-1 font-normal rounded-sm"
            >
              {{ selectedValues.size }} selected
            </UiBadge>
            <template v-else>
              <UiBadge
                v-for="option in props.options.filter(option => selectedValues.has(option.value))"
                :key="option.value"
                variant="secondary"
                class="px-1 font-normal rounded-sm"
              >
                {{ option.label }}
              </UiBadge>
            </template>
          </div>
        </template>
      </UiButton>
    </UiPopoverTrigger>

    <UiPopoverContent class="w-[200px] p-0" align="start">
      <UiCommand :filter-function="filterFunction">
        <UiCommandInput :placeholder="props.title" />
        <UiCommandList>
          <UiCommandEmpty>No results found.</UiCommandEmpty>
          <UiCommandGroup>
            <UiCommandItem
              v-for="option in props.options"
              :key="option.value"
              :value="option"
              @select="
                e => {
                  const isSelected = selectedValues.has(option.value)
                  if (isSelected) {
                    selectedValues.delete(option.value)
                  }
                  else {
                    selectedValues.add(option.value)
                  }
                  const filterValues = Array.from(selectedValues)
                  props.column?.setFilterValue(filterValues.length ? filterValues : undefined)
                }
              "
            >
              <div
                :class="
                  cn(
                    'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                    selectedValues.has(option.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'opacity-50 [&_svg]:invisible',
                  )
                "
              >
                <Check class="h-4 w-4" />
              </div>
              <component
                :is="option.icon"
                v-if="option.icon"
                class="size-4 mr-2 text-muted-foreground"
              />
              <span>{{ option.label }}</span>
              <span
                v-if="facets?.get(option.value)"
                class="flex items-center justify-center size-4 ml-auto font-mono text-xs"
              >
                {{ facets.get(option.value) }}
              </span>
            </UiCommandItem>
          </UiCommandGroup>

          <template v-if="selectedValues.size > 0">
            <UiCommandSeparator />
            <UiCommandGroup>
              <UiCommandItem
                :value="{ label: 'Clear filters' }"
                class="justify-center text-center"
                @select="props.column?.setFilterValue(undefined)"
              >
                Clear filters
              </UiCommandItem>
            </UiCommandGroup>
          </template>
        </UiCommandList>
      </UiCommand>
    </UiPopoverContent>
  </UiPopover>
</template>
