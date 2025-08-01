<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('erp.production.title') }}
        </h1>
        <p class="text-muted-foreground">
          {{ $t('erp.production.subtitle') }}
        </p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="mr-2 h-4 w-4" />
        {{ $t('erp.production.addEntry') }}
      </Button>
    </div>

    <!-- Metrics Cards -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">{{ $t('dashboard.dailyOutput') }}</CardTitle>
          <Activity class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ productionStore.totalProducedToday }}</div>
          <p class="text-xs text-muted-foreground">Units produced today</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">{{ $t('dashboard.productionEfficiency') }}</CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ productionStore.averageEfficiency }}%</div>
          <p class="text-xs text-muted-foreground">Average efficiency today</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Active Lines</CardTitle>
          <Factory class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ Object.keys(productionStore.entriesByLine).length }}</div>
          <p class="text-xs text-muted-foreground">Production lines running</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Today's Entries</CardTitle>
          <Calendar class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ productionStore.todayEntries.length }}</div>
          <p class="text-xs text-muted-foreground">Production entries logged</p>
        </CardContent>
      </Card>
    </div>

    <!-- Production Entries Table -->
    <Card>
      <CardHeader>
        <CardTitle>Production Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left p-4">{{ $t('erp.orders.orderNumber') }}</th>
                <th class="text-left p-4">{{ $t('erp.production.line') }}</th>
                <th class="text-left p-4">{{ $t('erp.production.shift') }}</th>
                <th class="text-left p-4">{{ $t('erp.production.operator') }}</th>
                <th class="text-left p-4">{{ $t('erp.production.hour') }}</th>
                <th class="text-left p-4">{{ $t('erp.production.targetPerHour') }}</th>
                <th class="text-left p-4">{{ $t('erp.production.actualProduction') }}</th>
                <th class="text-left p-4">{{ $t('erp.production.efficiency') }}</th>
                <th class="text-left p-4">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in productionStore.productionEntries" :key="entry.id" class="border-b hover:bg-muted/50">
                <td class="p-4 font-medium">{{ entry.orderNumber }}</td>
                <td class="p-4">{{ entry.line }}</td>
                <td class="p-4">
                  <Badge :variant="getShiftVariant(entry.shift)">
                    {{ $t(`erp.production.${entry.shift}`) }}
                  </Badge>
                </td>
                <td class="p-4">{{ entry.operator }}</td>
                <td class="p-4">{{ entry.hour }}:00</td>
                <td class="p-4">{{ entry.targetPerHour }}</td>
                <td class="p-4">{{ entry.actualProduction }}</td>
                <td class="p-4">
                  <span :class="getEfficiencyColor(entry.efficiency)">
                    {{ entry.efficiency }}%
                  </span>
                </td>
                <td class="p-4">
                  <div class="flex space-x-2">
                    <Button variant="ghost" size="sm" @click="editEntry(entry)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="deleteEntry(entry)" class="text-red-600 hover:text-red-700">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="productionStore.productionEntries.length === 0" class="text-center py-8">
            <p class="text-muted-foreground">{{ $t('common.noData') }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog :open="showDialog" @update:open="showDialog = $event">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? 'Edit Production Entry' : $t('erp.production.addEntry') }}
          </DialogTitle>
        </DialogHeader>
        
        <form @submit.prevent="saveEntry" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="orderNumber">{{ $t('erp.orders.orderNumber') }}</Label>
              <Select v-model="entryForm.orderNumber">
                <SelectTrigger>
                  <SelectValue :placeholder="$t('erp.orders.orderNumber')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORD-2024-001">ORD-2024-001</SelectItem>
                  <SelectItem value="ORD-2024-002">ORD-2024-002</SelectItem>
                  <SelectItem value="ORD-2024-003">ORD-2024-003</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="line">{{ $t('erp.production.line') }}</Label>
              <Select v-model="entryForm.line">
                <SelectTrigger>
                  <SelectValue :placeholder="$t('erp.production.line')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Line A">Line A</SelectItem>
                  <SelectItem value="Line B">Line B</SelectItem>
                  <SelectItem value="Line C">Line C</SelectItem>
                  <SelectItem value="Line D">Line D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="shift">{{ $t('erp.production.shift') }}</Label>
              <Select v-model="entryForm.shift">
                <SelectTrigger>
                  <SelectValue :placeholder="$t('erp.production.shift')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">{{ $t('erp.production.morning') }}</SelectItem>
                  <SelectItem value="afternoon">{{ $t('erp.production.afternoon') }}</SelectItem>
                  <SelectItem value="night">{{ $t('erp.production.night') }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="operator">{{ $t('erp.production.operator') }}</Label>
              <Input
                id="operator"
                v-model="entryForm.operator"
                :placeholder="$t('erp.production.operator')"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="hour">{{ $t('erp.production.hour') }}</Label>
              <Input
                id="hour"
                v-model.number="entryForm.hour"
                type="number"
                min="0"
                max="23"
                :placeholder="$t('erp.production.hour')"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="targetPerHour">{{ $t('erp.production.targetPerHour') }}</Label>
              <Input
                id="targetPerHour"
                v-model.number="entryForm.targetPerHour"
                type="number"
                :placeholder="$t('erp.production.targetPerHour')"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="actualProduction">{{ $t('erp.production.actualProduction') }}</Label>
              <Input
                id="actualProduction"
                v-model.number="entryForm.actualProduction"
                type="number"
                :placeholder="$t('erp.production.actualProduction')"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="rejected">{{ $t('erp.production.rejected') }}</Label>
              <Input
                id="rejected"
                v-model.number="entryForm.rejected"
                type="number"
                :placeholder="$t('erp.production.rejected')"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="remarks">{{ $t('erp.production.remarks') }}</Label>
            <Textarea
              id="remarks"
              v-model="entryForm.remarks"
              :placeholder="$t('erp.production.remarks')"
              class="min-h-[80px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showDialog = false">
              {{ $t('common.cancel') }}
            </Button>
            <Button type="submit" :disabled="productionStore.loading">
              {{ productionStore.loading ? $t('common.loading') : $t('common.save') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { Activity, Calendar, Edit, Factory, Plus, Trash2, TrendingUp } from 'lucide-vue-next'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useProductionStore } from '@/stores/production'

useI18n()
const productionStore = useProductionStore()

// Reactive state
const showDialog = ref(false)
const isEditing = ref(false)

// Form state
const entryForm = reactive({
  id: null,
  orderNumber: '',
  line: '',
  shift: '',
  operator: '',
  date: new Date().toISOString().split('T')[0],
  hour: new Date().getHours(),
  targetPerHour: 0,
  actualProduction: 0,
  rejected: 0,
  rework: 0,
  efficiency: 0,
  remarks: ''
})

// Methods
function getShiftVariant(shift) {
  const variants = {
    morning: 'default',
    afternoon: 'secondary',
    night: 'outline'
  }
  return variants[shift] || 'default'
}

function getEfficiencyColor(efficiency) {
  if (efficiency >= 100) return 'text-green-600 font-semibold'
  if (efficiency >= 90) return 'text-blue-600 font-semibold'
  if (efficiency >= 80) return 'text-yellow-600 font-semibold'
  return 'text-red-600 font-semibold'
}

function openCreateDialog() {
  resetForm()
  isEditing.value = false
  showDialog.value = true
}

function editEntry(entry) {
  Object.assign(entryForm, entry)
  isEditing.value = true
  showDialog.value = true
}

async function deleteEntry(entry) {
  try {
    await productionStore.deleteEntry(entry.id)
  } catch (error) {
    console.error('Error deleting entry:', error)
  }
}

function resetForm() {
  Object.assign(entryForm, {
    id: null,
    orderNumber: '',
    line: '',
    shift: '',
    operator: '',
    date: new Date().toISOString().split('T')[0],
    hour: new Date().getHours(),
    targetPerHour: 0,
    actualProduction: 0,
    rejected: 0,
    rework: 0,
    efficiency: 0,
    remarks: ''
  })
}

async function saveEntry() {
  try {
    // Calculate efficiency
    entryForm.efficiency = entryForm.targetPerHour > 0 
      ? Math.round((entryForm.actualProduction / entryForm.targetPerHour) * 100)
      : 0

    if (isEditing.value) {
      await productionStore.updateEntry(entryForm.id, entryForm)
    } else {
      await productionStore.createEntry(entryForm)
    }

    showDialog.value = false
    resetForm()
  } catch (error) {
    console.error('Error saving entry:', error)
  }
}

onMounted(async () => {
  await productionStore.loadDummyData()
})
</script>
