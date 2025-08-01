<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('erp.buyers.title') }}
        </h1>
        <p class="text-muted-foreground">
          {{ $t('erp.buyers.subtitle') }}
        </p>
      </div>
      <Button>
        <Plus class="mr-2 h-4 w-4" />
        {{ $t('erp.buyers.addBuyer') }}
      </Button>
    </div>

    <!-- Buyers Table -->
    <Card>
      <CardHeader>
        <CardTitle>Buyers List</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left p-4">{{ $t('erp.buyers.buyerName') }}</th>
                <th class="text-left p-4">{{ $t('erp.buyers.contactPerson') }}</th>
                <th class="text-left p-4">{{ $t('erp.buyers.email') }}</th>
                <th class="text-left p-4">{{ $t('erp.buyers.country') }}</th>
                <th class="text-left p-4">{{ $t('erp.buyers.status') }}</th>
                <th class="text-left p-4">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="buyer in buyersStore.buyers" :key="buyer.id" class="border-b hover:bg-muted/50">
                <td class="p-4 font-medium">{{ buyer.buyerName }}</td>
                <td class="p-4">{{ buyer.contactPerson }}</td>
                <td class="p-4">{{ buyer.email }}</td>
                <td class="p-4">{{ buyer.country }}</td>
                <td class="p-4">
                  <Badge :variant="buyer.status === 'active' ? 'success' : 'secondary'">
                    {{ $t(`erp.buyers.${buyer.status}`) }}
                  </Badge>
                </td>
                <td class="p-4">
                  <div class="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" class="text-red-600 hover:text-red-700">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { Edit, Plus, Trash2 } from 'lucide-vue-next'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useBuyersStore } from '@/stores/buyers'

useI18n()
const buyersStore = useBuyersStore()

onMounted(async () => {
  await buyersStore.loadDummyData()
})
</script>
