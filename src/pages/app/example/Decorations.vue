<script setup>
import {
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Loader2,
  Paintbrush,
  Plus,
  Search,
  Trash2,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useDecorationsStore } from '@/stores/example/decorations'

useI18n()
const decorationsStore = useDecorationsStore()

// State
const searchQuery = ref('')
const typeFilter = ref('all')
const complexityFilter = ref('all')
const showDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const decorationToDelete = ref(null)

// Form data
const formData = ref({
  designCode: '',
  decorationType: '',
  technique: '',
  category: '',
  description: '',
  complexity: 'Medium',
  placement: '',
  size: '',
  costPerUnit: 0,
  minOrderQty: 0,
  setupTime: 0,
  productionTime: 0,
  maxColors: '',
  threadType: '',
  stitchCount: null,
  colors: [],
  status: 'active',
})

// Store getters
const {
  decorations,
  loading,
  selectedDecoration,
  activeDecorations,
  decorationsByTechnique,
  averageSetupTime,
  averageCostPerUnit,
} = decorationsStore

// Computed
const filteredDecorations = computed(() => {
  let filtered = decorations

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      decoration =>
        decoration.decorationType.toLowerCase().includes(query)
        || decoration.designCode.toLowerCase().includes(query)
        || decoration.technique.toLowerCase().includes(query)
        || decoration.category?.toLowerCase().includes(query)
        || decoration.description?.toLowerCase().includes(query),
    )
  }

  // Type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(decoration => decoration.decorationType === typeFilter.value)
  }

  // Complexity filter
  if (complexityFilter.value !== 'all') {
    filtered = filtered.filter(decoration => decoration.complexity === complexityFilter.value)
  }

  return filtered
})

// Methods
function getComplexityVariant(complexity) {
  switch (complexity) {
    case 'Low':
      return 'secondary'
    case 'Medium':
      return 'default'
    case 'High':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getStatusVariant(status) {
  switch (status) {
    case 'active':
      return 'default'
    case 'low_demand':
      return 'secondary'
    case 'discontinued':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function resetForm() {
  formData.value = {
    designCode: '',
    decorationType: '',
    technique: '',
    category: '',
    description: '',
    complexity: 'Medium',
    placement: '',
    size: '',
    costPerUnit: 0,
    minOrderQty: 0,
    setupTime: 0,
    productionTime: 0,
    maxColors: '',
    threadType: '',
    stitchCount: null,
    colors: [],
    status: 'active',
  }
}

function openCreateDialog() {
  resetForm()
  isEditing.value = false
  showDialog.value = true
}

function editDecoration(decoration) {
  formData.value = { ...decoration }
  isEditing.value = true
  showDialog.value = true
}

function viewDecoration(decoration) {
  decorationsStore.selectedDecoration = decoration
  showViewDialog.value = true
}

function confirmDelete(decoration) {
  decorationToDelete.value = decoration
  showDeleteDialog.value = true
}

async function saveDecoration() {
  try {
    if (isEditing.value) {
      await decorationsStore.updateDecoration(formData.value.id, formData.value)
    }
    else {
      const newDecoration = {
        ...formData.value,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      }
      await decorationsStore.createDecoration(newDecoration)
    }
    showDialog.value = false
    resetForm()
  }
  catch (error) {
    console.error('Error saving decoration:', error)
  }
}

async function handleDelete() {
  try {
    await decorationsStore.deleteDecoration(decorationToDelete.value.id)
    showDeleteDialog.value = false
    decorationToDelete.value = null
  }
  catch (error) {
    console.error('Error deleting decoration:', error)
  }
}

// Initialize
onMounted(() => {
  decorationsStore.loadDummyData()
})
</script>

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
      <Button class="gap-2" @click="openCreateDialog">
        <Plus class="h-4 w-4" />
        {{ $t('erp.decorations.addDecoration') }}
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Paintbrush class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.decorations.stats.total') }}
              </p>
              <p class="text-2xl font-bold">
                {{ decorations.length }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.decorations.stats.active') }}
              </p>
              <p class="text-2xl font-bold">
                {{ activeDecorations.length }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock class="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.decorations.stats.avgSetup') }}
              </p>
              <p class="text-2xl font-bold">
                {{ averageSetupTime }}min
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.decorations.stats.avgCost') }}
              </p>
              <p class="text-2xl font-bold">
                ${{ averageCostPerUnit }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters and Search -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
              />
              <Input
                v-model="searchQuery"
                :placeholder="$t('erp.decorations.search')"
                class="pl-10"
              />
            </div>
          </div>
          <Select v-model="typeFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue :placeholder="$t('erp.decorations.filterType')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {{ $t('common.all') }}
              </SelectItem>
              <SelectItem
                v-for="type in Object.keys(decorationsByTechnique)"
                :key="type"
                :value="type"
              >
                {{ type }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="complexityFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue :placeholder="$t('erp.decorations.filterComplexity')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {{ $t('common.all') }}
              </SelectItem>
              <SelectItem value="Low">
                {{ $t('erp.decorations.low') }}
              </SelectItem>
              <SelectItem value="Medium">
                {{ $t('erp.decorations.medium') }}
              </SelectItem>
              <SelectItem value="High">
                {{ $t('erp.decorations.high') }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Decorations Table -->
    <Card>
      <CardHeader>
        <CardTitle>{{ $t('erp.decorations.list') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ $t('erp.decorations.table.decoration') }}</TableHead>
                <TableHead>{{ $t('erp.decorations.table.technique') }}</TableHead>
                <TableHead>{{ $t('erp.decorations.table.complexity') }}</TableHead>
                <TableHead>{{ $t('erp.decorations.table.cost') }}</TableHead>
                <TableHead>{{ $t('erp.decorations.table.setupTime') }}</TableHead>
                <TableHead>{{ $t('erp.decorations.table.status') }}</TableHead>
                <TableHead class="text-right">
                  {{ $t('common.actions') }}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="loading">
                <TableRow v-for="n in 5" :key="n">
                  <TableCell class="py-4">
                    <div class="flex items-center gap-3">
                      <Skeleton class="h-10 w-10 rounded-md" />
                      <div class="space-y-2">
                        <Skeleton class="h-4 w-[150px]" />
                        <Skeleton class="h-3 w-[100px]" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[60px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <div class="flex justify-end gap-2">
                      <Skeleton class="h-8 w-8" />
                      <Skeleton class="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              </template>

              <TableRow v-else-if="filteredDecorations.length === 0">
                <TableCell colspan="7" class="text-center py-8 text-muted-foreground">
                  {{ $t('erp.decorations.noData') }}
                </TableCell>
              </TableRow>

              <TableRow v-for="decoration in filteredDecorations" v-else :key="decoration.id">
                <TableCell class="font-medium">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <Paintbrush class="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div class="font-semibold">
                        {{ decoration.decorationType }}
                      </div>
                      <div class="text-sm text-muted-foreground">
                        {{ decoration.designCode }}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div class="font-medium">
                      {{ decoration.technique }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      {{ decoration.category }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getComplexityVariant(decoration.complexity)">
                    {{ $t(`erp.decorations.${decoration.complexity.toLowerCase()}`) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="font-medium">
                    ${{ decoration.costPerUnit.toFixed(2) }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    Min: {{ decoration.minOrderQty }}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div class="font-medium">
                      {{ decoration.setupTime }}min
                    </div>
                    <div class="text-sm text-muted-foreground">
                      Prod: {{ decoration.productionTime }}min
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(decoration.status)">
                    {{ $t(`erp.decorations.${decoration.status}`) }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" @click="viewDecoration(decoration)">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="editDecoration(decoration)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="confirmDelete(decoration)">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showDialog">
      <DialogContent class="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? $t('erp.decorations.edit') : $t('erp.decorations.addDecoration') }}
          </DialogTitle>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="saveDecoration">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="designCode">{{ $t('erp.decorations.designCode') }} *</Label>
              <Input
                id="designCode"
                v-model="formData.designCode"
                required
                :placeholder="$t('erp.decorations.designCodePlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="decorationType">{{ $t('erp.decorations.decorationType') }} *</Label>
              <Input
                id="decorationType"
                v-model="formData.decorationType"
                required
                :placeholder="$t('erp.decorations.decorationTypePlaceholder')"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="technique">{{ $t('erp.decorations.technique') }} *</Label>
              <Input
                id="technique"
                v-model="formData.technique"
                required
                :placeholder="$t('erp.decorations.techniquePlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="category">{{ $t('erp.decorations.category') }}</Label>
              <Input
                id="category"
                v-model="formData.category"
                :placeholder="$t('erp.decorations.categoryPlaceholder')"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="description">{{ $t('erp.decorations.description') }}</Label>
            <Textarea
              id="description"
              v-model="formData.description"
              :placeholder="$t('erp.decorations.descriptionPlaceholder')"
              rows="3"
            />
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="complexity">{{ $t('erp.decorations.complexity') }}</Label>
              <Select v-model="formData.complexity">
                <SelectTrigger>
                  <SelectValue :placeholder="$t('erp.decorations.complexityPlaceholder')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">
                    {{ $t('erp.decorations.low') }}
                  </SelectItem>
                  <SelectItem value="Medium">
                    {{ $t('erp.decorations.medium') }}
                  </SelectItem>
                  <SelectItem value="High">
                    {{ $t('erp.decorations.high') }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="placement">{{ $t('erp.decorations.placement') }}</Label>
              <Input
                id="placement"
                v-model="formData.placement"
                :placeholder="$t('erp.decorations.placementPlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="size">{{ $t('erp.decorations.size') }}</Label>
              <Input
                id="size"
                v-model="formData.size"
                :placeholder="$t('erp.decorations.sizePlaceholder')"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="costPerUnit">{{ $t('erp.decorations.costPerUnit') }} *</Label>
              <Input
                id="costPerUnit"
                v-model.number="formData.costPerUnit"
                type="number"
                step="0.01"
                required
                :placeholder="$t('erp.decorations.costPerUnitPlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="minOrderQty">{{ $t('erp.decorations.minOrderQty') }}</Label>
              <Input
                id="minOrderQty"
                v-model.number="formData.minOrderQty"
                type="number"
                :placeholder="$t('erp.decorations.minOrderQtyPlaceholder')"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="setupTime">{{ $t('erp.decorations.setupTime') }} (min)</Label>
              <Input
                id="setupTime"
                v-model.number="formData.setupTime"
                type="number"
                :placeholder="$t('erp.decorations.setupTimePlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="productionTime">{{ $t('erp.decorations.productionTime') }} (min)</Label>
              <Input
                id="productionTime"
                v-model.number="formData.productionTime"
                type="number"
                :placeholder="$t('erp.decorations.productionTimePlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="maxColors">{{ $t('erp.decorations.maxColors') }}</Label>
              <Input
                id="maxColors"
                v-model="formData.maxColors"
                :placeholder="$t('erp.decorations.maxColorsPlaceholder')"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="threadType">{{ $t('erp.decorations.threadType') }}</Label>
              <Input
                id="threadType"
                v-model="formData.threadType"
                :placeholder="$t('erp.decorations.threadTypePlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="stitchCount">{{ $t('erp.decorations.stitchCount') }}</Label>
              <Input
                id="stitchCount"
                v-model.number="formData.stitchCount"
                type="number"
                :placeholder="$t('erp.decorations.stitchCountPlaceholder')"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showDialog = false">
              {{ $t('common.cancel') }}
            </Button>
            <Button type="submit" :disabled="loading">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ isEditing ? $t('common.update') : $t('common.create') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- View Dialog -->
    <Dialog v-model:open="showViewDialog">
      <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ $t('erp.decorations.details') }}</DialogTitle>
        </DialogHeader>

        <div v-if="selectedDecoration" class="space-y-6">
          <div class="flex items-start gap-4">
            <div class="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
              <Paintbrush class="h-10 w-10 text-muted-foreground" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold">
                {{ selectedDecoration.decorationType }}
              </h3>
              <p class="text-muted-foreground">
                {{ selectedDecoration.designCode }}
              </p>
              <Badge class="mt-2" variant="outline">
                {{ selectedDecoration.technique }}
              </Badge>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.decorations.description')
              }}</Label>
              <p>{{ selectedDecoration.description }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.decorations.category')
              }}</Label>
              <p>{{ selectedDecoration.category }}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.decorations.complexity')
              }}</Label>
              <Badge :variant="getComplexityVariant(selectedDecoration.complexity)">
                {{ $t(`erp.decorations.${selectedDecoration.complexity.toLowerCase()}`) }}
              </Badge>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.decorations.placement')
              }}</Label>
              <p>{{ selectedDecoration.placement }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.decorations.size')
              }}</Label>
              <p>{{ selectedDecoration.size }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.decorations.costPerUnit')
              }}</Label>
              <p class="text-lg font-semibold">
                ${{ selectedDecoration.costPerUnit?.toFixed(2) }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.decorations.minOrderQty')
              }}</Label>
              <p>{{ selectedDecoration.minOrderQty }}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.decorations.setupTime')
              }}</Label>
              <p>{{ selectedDecoration.setupTime }} min</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.decorations.productionTime')
              }}</Label>
              <p>{{ selectedDecoration.productionTime }} min</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.decorations.maxColors')
              }}</Label>
              <p>{{ selectedDecoration.maxColors }}</p>
            </div>
          </div>

          <div v-if="selectedDecoration.threadType" class="grid grid-cols-2 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.decorations.threadType')
              }}</Label>
              <p>{{ selectedDecoration.threadType }}</p>
            </div>
            <div v-if="selectedDecoration.stitchCount">
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.decorations.stitchCount')
              }}</Label>
              <p>{{ selectedDecoration.stitchCount?.toLocaleString() }}</p>
            </div>
          </div>

          <div v-if="selectedDecoration.colors && selectedDecoration.colors.length > 0">
            <Label class="text-sm font-medium text-muted-foreground">{{
              $t('erp.decorations.colors')
            }}</Label>
            <div class="flex flex-wrap gap-2 mt-2">
              <Badge v-for="color in selectedDecoration.colors" :key="color" variant="outline">
                {{ color }}
              </Badge>
            </div>
          </div>

          <div>
            <Label class="text-sm font-medium text-muted-foreground">{{
              $t('erp.decorations.status')
            }}</Label>
            <Badge :variant="getStatusVariant(selectedDecoration.status)">
              {{ $t(`erp.decorations.${selectedDecoration.status}`) }}
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button @click="showViewDialog = false">
            {{ $t('common.close') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ $t('erp.decorations.confirmDelete') }}</DialogTitle>
        </DialogHeader>

        <p class="text-muted-foreground">
          {{ $t('erp.decorations.deleteMessage', { name: decorationToDelete?.decorationType }) }}
        </p>

        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false">
            {{ $t('common.cancel') }}
          </Button>
          <Button variant="destructive" :disabled="loading" @click="handleDelete">
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ $t('common.delete') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
