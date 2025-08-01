<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('erp.decorations.title') }}
        </h1>
        <p class="text-muted-foreground">
          {{ $t('erp.decorations.subtitle') }}
        </p>
      </div>
      <Button>
        <Plus class="mr-2 h-4 w-4" />
        {{ $t('erp.decorations.add') }}
      </Button>
    </div>

    <!-- Coming Soon Card -->
    <Card>
      <CardContent class="pt-6">
        <div class="text-center py-12">
          <Paintbrush class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 class="text-lg font-semibold mb-2">{{ $t('erp.decorations.title') }}</h3>
          <p class="text-muted-foreground mb-4">This feature is coming soon!</p>
          <p class="text-sm text-muted-foreground">
            Manage decoration types, techniques, and design customizations.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { Paintbrush, Plus } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

useI18n()
</script>
