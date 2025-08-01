<script setup>
import { Plus, Truck } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

useI18n()
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('erp.deliveryNote.title') }}
        </h1>
        <p class="text-muted-foreground">
          {{ $t('erp.deliveryNote.subtitle') }}
        </p>
      </div>
      <Button>
        <Plus class="mr-2 h-4 w-4" />
        {{ $t('erp.deliveryNote.create') }}
      </Button>
    </div>

    <!-- Coming Soon Card -->
    <Card>
      <CardContent class="pt-6">
        <div class="text-center py-12">
          <Truck class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 class="text-lg font-semibold mb-2">
            {{ $t('erp.deliveryNote.title') }}
          </h3>
          <p class="text-muted-foreground mb-4">
            This feature is coming soon!
          </p>
          <p class="text-sm text-muted-foreground">
            Generate delivery notes for completed shipments with tracking information.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
