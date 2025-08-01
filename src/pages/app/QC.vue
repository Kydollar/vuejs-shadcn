<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('erp.qc.title') }}
        </h1>
        <p class="text-muted-foreground">
          {{ $t('erp.qc.subtitle') }}
        </p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="mr-2 h-4 w-4" />
        {{ $t('erp.qc.addInspection') }}
      </Button>
    </div>

    <!-- QC Metrics -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">{{ $t('dashboard.qualityRate') }}</CardTitle>
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ qcStore.qualityRate }}%</div>
          <p class="text-xs text-muted-foreground">Overall quality pass rate</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">{{ $t('erp.qc.passed') }}</CardTitle>
          <ThumbsUp class="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-green-600">{{ qcStore.passedInspections.length }}</div>
          <p class="text-xs text-muted-foreground">Passed inspections</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">{{ $t('erp.qc.failed') }}</CardTitle>
          <ThumbsDown class="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-red-600">{{ qcStore.failedInspections.length }}</div>
          <p class="text-xs text-muted-foreground">Failed inspections</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Today's Inspections</CardTitle>
          <Calendar class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ qcStore.todayInspections.length }}</div>
          <p class="text-xs text-muted-foreground">Inspections today</p>
        </CardContent>
      </Card>
    </div>

    <!-- QC Inspections Table -->
    <Card>
      <CardHeader>
        <CardTitle>QC Inspections</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left p-4">{{ $t('erp.orders.orderNumber') }}</th>
                <th class="text-left p-4">{{ $t('erp.qc.inspector') }}</th>
                <th class="text-left p-4">{{ $t('erp.qc.inspectionDate') }}</th>
                <th class="text-left p-4">{{ $t('erp.qc.sampleSize') }}</th>
                <th class="text-left p-4">{{ $t('erp.qc.passedQty') }}</th>
                <th class="text-left p-4">{{ $t('erp.qc.rejectedQty') }}</th>
                <th class="text-left p-4">{{ $t('erp.qc.qcStatus') }}</th>
                <th class="text-left p-4">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inspection in qcStore.inspections" :key="inspection.id" class="border-b hover:bg-muted/50">
                <td class="p-4 font-medium">{{ inspection.orderNumber }}</td>
                <td class="p-4">{{ inspection.inspector }}</td>
                <td class="p-4">{{ formatDate(inspection.inspectionDate) }}</td>
                <td class="p-4">{{ inspection.sampleSize }}</td>
                <td class="p-4 text-green-600">{{ inspection.passedQty }}</td>
                <td class="p-4 text-red-600">{{ inspection.rejectedQty }}</td>
                <td class="p-4">
                  <Badge :variant="getStatusVariant(inspection.qcStatus)">
                    {{ $t(`erp.qc.${inspection.qcStatus}`) }}
                  </Badge>
                </td>
                <td class="p-4">
                  <div class="flex space-x-2">
                    <Button variant="ghost" size="sm" @click="editInspection(inspection)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="deleteInspection(inspection)" class="text-red-600 hover:text-red-700">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="qcStore.inspections.length === 0" class="text-center py-8">
            <p class="text-muted-foreground">{{ $t('common.noData') }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog :open="showDialog" @update:open="showDialog = $event">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? 'Edit QC Inspection' : $t('erp.qc.addInspection') }}
          </DialogTitle>
        </DialogHeader>
        
        <form @submit.prevent="saveInspection" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="orderNumber">{{ $t('erp.orders.orderNumber') }}</Label>
              <Select v-model="inspectionForm.orderNumber">
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
              <Label for="inspector">{{ $t('erp.qc.inspector') }}</Label>
              <Input
                id="inspector"
                v-model="inspectionForm.inspector"
                :placeholder="$t('erp.qc.inspector')"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="sampleSize">{{ $t('erp.qc.sampleSize') }}</Label>
              <Input
                id="sampleSize"
                v-model.number="inspectionForm.sampleSize"
                type="number"
                :placeholder="$t('erp.qc.sampleSize')"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="passedQty">{{ $t('erp.qc.passedQty') }}</Label>
              <Input
                id="passedQty"
                v-model.number="inspectionForm.passedQty"
                type="number"
                :placeholder="$t('erp.qc.passedQty')"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="rejectedQty">{{ $t('erp.qc.rejectedQty') }}</Label>
              <Input
                id="rejectedQty"
                v-model.number="inspectionForm.rejectedQty"
                type="number"
                :placeholder="$t('erp.qc.rejectedQty')"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="qcStatus">{{ $t('erp.qc.qcStatus') }}</Label>
              <Select v-model="inspectionForm.qcStatus">
                <SelectTrigger>
                  <SelectValue :placeholder="$t('erp.qc.qcStatus')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passed">{{ $t('erp.qc.passed') }}</SelectItem>
                  <SelectItem value="failed">{{ $t('erp.qc.failed') }}</SelectItem>
                  <SelectItem value="rework">{{ $t('erp.qc.rework') }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label>{{ $t('erp.qc.rejectionReasons') }}</Label>
            <div class="grid grid-cols-2 gap-2">
              <label class="flex items-center space-x-2">
                <input type="checkbox" v-model="rejectionReasons" value="sizeIssue" />
                <span class="text-sm">{{ $t('erp.qc.sizeIssue') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input type="checkbox" v-model="rejectionReasons" value="colorIssue" />
                <span class="text-sm">{{ $t('erp.qc.colorIssue') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input type="checkbox" v-model="rejectionReasons" value="stitchingDefect" />
                <span class="text-sm">{{ $t('erp.qc.stitchingDefect') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input type="checkbox" v-model="rejectionReasons" value="fabricDefect" />
                <span class="text-sm">{{ $t('erp.qc.fabricDefect') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input type="checkbox" v-model="rejectionReasons" value="decorationDefect" />
                <span class="text-sm">{{ $t('erp.qc.decorationDefect') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input type="checkbox" v-model="rejectionReasons" value="other" />
                <span class="text-sm">{{ $t('erp.qc.other') }}</span>
              </label>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="notes">{{ $t('erp.qc.notes') }}</Label>
            <Textarea
              id="notes"
              v-model="inspectionForm.notes"
              :placeholder="$t('erp.qc.notes')"
              class="min-h-[80px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showDialog = false">
              {{ $t('common.cancel') }}
            </Button>
            <Button type="submit" :disabled="qcStore.loading">
              {{ qcStore.loading ? $t('common.loading') : $t('common.save') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { Calendar, CheckCircle, Edit, Plus, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-vue-next'
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
import { useQCStore } from '@/stores/qc'

useI18n()
const qcStore = useQCStore()

// Reactive state
const showDialog = ref(false)
const isEditing = ref(false)
const rejectionReasons = ref([])

// Form state
const inspectionForm = reactive({
  id: null,
  orderNumber: '',
  inspector: '',
  inspectionDate: new Date().toISOString().split('T')[0],
  sampleSize: 0,
  passedQty: 0,
  rejectedQty: 0,
  qcStatus: 'passed',
  notes: ''
})

// Methods
function getStatusVariant(status) {
  const variants = {
    passed: 'success',
    failed: 'destructive',
    rework: 'secondary'
  }
  return variants[status] || 'secondary'
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

function openCreateDialog() {
  resetForm()
  isEditing.value = false
  showDialog.value = true
}

function editInspection(inspection) {
  Object.assign(inspectionForm, inspection)
  rejectionReasons.value = inspection.rejectionReasons || []
  isEditing.value = true
  showDialog.value = true
}

async function deleteInspection(inspection) {
  try {
    await qcStore.deleteInspection(inspection.id)
  } catch (error) {
    console.error('Error deleting inspection:', error)
  }
}

function resetForm() {
  Object.assign(inspectionForm, {
    id: null,
    orderNumber: '',
    inspector: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    sampleSize: 0,
    passedQty: 0,
    rejectedQty: 0,
    qcStatus: 'passed',
    notes: ''
  })
  rejectionReasons.value = []
}

async function saveInspection() {
  try {
    const inspectionData = {
      ...inspectionForm,
      rejectionReasons: rejectionReasons.value
    }

    if (isEditing.value) {
      await qcStore.updateInspection(inspectionForm.id, inspectionData)
    } else {
      await qcStore.createInspection(inspectionData)
    }

    showDialog.value = false
    resetForm()
  } catch (error) {
    console.error('Error saving inspection:', error)
  }
}

onMounted(async () => {
  await qcStore.loadDummyData()
})
</script>
