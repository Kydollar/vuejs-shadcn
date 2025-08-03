<script setup>
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  Loader2,
  Package,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
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
import { useProductsStore } from '@/stores/master-data/products'

useI18n()
const productsStore = useProductsStore()

// State
const searchQuery = ref('')
const categoryFilter = ref('all')
const statusFilter = ref('all')
const showDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const productToDelete = ref(null)

// Form data
const formData = ref({
  productCode: '',
  productName: '',
  category: '',
  description: '',
  material: '',
  colors: [],
  sizes: [],
  unit: 'pieces',
  price: 0,
  cost: 0,
  stock: 0,
  minOrder: 0,
  leadTime: 14,
  weight: 0,
  dimensions: '',
  supplier: '',
  images: [],
  specifications: {
    weight: 0,
    fit: '',
    care: '',
  },
})

// Additional reactive variables for color/size input
const colorInput = ref('')
const sizeInput = ref('')

// Store getters (reactive)
const { products, loading, selectedProduct, activeProducts, uniqueCategories, lowStockProducts }
  = storeToRefs(productsStore)

// Computed
const filteredProducts = computed(() => {
  // Safety check untuk products array
  if (!products.value || !Array.isArray(products.value)) {
    return []
  }

  let filtered = products.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      product =>
        product?.productName?.toLowerCase().includes(query)
        || product?.productCode?.toLowerCase().includes(query)
        || product?.category?.toLowerCase().includes(query)
        || product?.material?.toLowerCase().includes(query)
        || product?.supplier?.toLowerCase().includes(query),
    )
  }

  // Category filter
  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(product => product?.category === categoryFilter.value)
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(product => getProductStatus(product) === statusFilter.value)
  }

  return filtered
})

const categoryOptions = computed(() => [
  'T-Shirts',
  'Polo Shirts',
  'Shirts',
  'Jeans',
  'Dresses',
  'Hoodies',
  'Sweaters',
  'Jackets',
  'Pants',
  'Shorts',
])

const weightUnit = computed(() => {
  switch (formData.value.category) {
    case 'Jeans':
      return 'oz'
    case 'T-Shirts':
    case 'Polo Shirts':
    case 'Shirts':
    case 'Hoodies':
    case 'Sweaters':
      return 'gsm'
    case 'Dresses':
    case 'Jackets':
    case 'Pants':
    case 'Shorts':
      return 'g'
    default:
      return 'g'
  }
})

// Methods
function formatWeight(weight, category) {
  if (!weight)
    return 'N/A'

  // Format berdasarkan kategori produk
  switch (category) {
    case 'Jeans':
      return `${weight}oz`
    case 'T-Shirts':
    case 'Polo Shirts':
    case 'Shirts':
    case 'Hoodies':
    case 'Sweaters':
      return `${weight}gsm`
    case 'Dresses':
    case 'Jackets':
    case 'Pants':
    case 'Shorts':
      return `${weight}g`
    default:
      return `${weight}g`
  }
}

function getProductStatus(product) {
  if (!product?.stock && product?.stock !== 0)
    return 'out_of_stock'
  if (product.stock === 0)
    return 'out_of_stock'
  if (product.status === 'limited')
    return 'limited'
  if (product.stock <= (product.minOrder || 50))
    return 'low_stock'
  return 'active'
}

function getStatusVariant(status) {
  switch (status) {
    case 'active':
      return 'default'
    case 'low_stock':
      return 'secondary'
    case 'out_of_stock':
      return 'destructive'
    case 'limited':
      return 'outline'
    default:
      return 'secondary'
  }
}

function resetForm() {
  formData.value = {
    productCode: '',
    productName: '',
    category: '',
    description: '',
    material: '',
    colors: [],
    sizes: [],
    unit: 'pieces',
    price: 0,
    cost: 0,
    stock: 0,
    minOrder: 0,
    leadTime: 14,
    weight: 0,
    dimensions: '',
    supplier: '',
    images: [],
    specifications: {
      weight: 0,
      fit: '',
      care: '',
    },
  }
  colorInput.value = ''
  sizeInput.value = ''
}

function openCreateDialog() {
  resetForm()
  isEditing.value = false
  showDialog.value = true
}

function editProduct(product) {
  // Map JSON structure to form structure
  formData.value = {
    ...product,
    colors: product.colors || [],
    sizes: product.sizes || [],
    specifications: product.specifications || {
      weight: product.specifications?.weight || 0,
      fit: product.specifications?.fit || '',
      care: product.specifications?.care || '',
    },
    images: product.images || [],
    weight: product.specifications?.weight || 0,
    dimensions: product.specifications?.dimensions || '',
  }
  isEditing.value = true
  showDialog.value = true
}

function viewProduct(product) {
  productsStore.selectedProduct = product
  showViewDialog.value = true
}

function confirmDelete(product) {
  productToDelete.value = product
  showDeleteDialog.value = true
}

async function saveProduct() {
  try {
    if (isEditing.value) {
      // Prepare data with proper JSON structure
      const updatedProduct = {
        ...formData.value,
        specifications: {
          weight: formData.value.weight,
          fit: formData.value.specifications.fit,
          care: formData.value.specifications.care,
          dimensions: formData.value.dimensions,
        },
        updatedAt: new Date().toISOString(),
      }
      await productsStore.updateProduct(formData.value.id, updatedProduct)
    }
    else {
      const newProduct = {
        ...formData.value,
        id: Date.now(),
        status: getProductStatus(formData.value),
        totalSold: 0,
        rating: 0,
        specifications: {
          weight: formData.value.weight,
          fit: formData.value.specifications.fit || 'Regular',
          care: formData.value.specifications.care || 'Machine wash cold',
          dimensions: formData.value.dimensions,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await productsStore.createProduct(newProduct)
    }
    showDialog.value = false
    resetForm()
  }
  catch (error) {
    console.error('Error saving product:', error)
  }
}

// Color and Size management functions
function addColor() {
  if (colorInput.value.trim() && !formData.value.colors.includes(colorInput.value.trim())) {
    formData.value.colors.push(colorInput.value.trim())
    colorInput.value = ''
  }
}

function removeColor(index) {
  formData.value.colors.splice(index, 1)
}

function addSize() {
  if (sizeInput.value.trim() && !formData.value.sizes.includes(sizeInput.value.trim())) {
    formData.value.sizes.push(sizeInput.value.trim())
    sizeInput.value = ''
  }
}

function removeSize(index) {
  formData.value.sizes.splice(index, 1)
}

async function handleDelete() {
  try {
    await productsStore.deleteProduct(productToDelete.value.id)
    showDeleteDialog.value = false
    productToDelete.value = null
  }
  catch (error) {
    console.error('Error deleting product:', error)
  }
}

// Initialize
onMounted(async () => {
  // Prevent multiple fetch calls during navigation
  if (products.value.length === 0) {
    await productsStore.fetchProducts()
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('erp.products.title') }}
        </h1>
        <p class="text-muted-foreground">
          {{ $t('erp.products.subtitle') }}
        </p>
      </div>
      <Button class="gap-2" :disabled="loading" @click="openCreateDialog">
        <Plus class="h-4 w-4" />
        {{ $t('erp.products.addProduct') }}
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Package class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.products.stats.total') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ products.length }}</span>
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
                {{ $t('erp.products.stats.active') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ activeProducts.length }}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertTriangle class="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.products.stats.lowStock') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ lowStockProducts.length }}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Tag class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('erp.products.stats.categories') }}
              </p>
              <p class="text-2xl font-bold">
                <Skeleton v-if="loading" class="h-8 w-12" />
                <span v-else>{{ uniqueCategories.length }}</span>
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
                :placeholder="$t('erp.products.search')"
                :disabled="loading"
                class="pl-10"
              />
            </div>
          </div>
          <Select v-model="categoryFilter" :disabled="loading">
            <SelectTrigger class="w-[180px]">
              <SelectValue :placeholder="$t('erp.products.filterCategory')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {{ $t('common.all') }}
              </SelectItem>
              <SelectItem v-for="category in uniqueCategories" :key="category" :value="category">
                {{ category }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="statusFilter" :disabled="loading">
            <SelectTrigger class="w-[180px]">
              <SelectValue :placeholder="$t('erp.products.filterStatus')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {{ $t('common.all') }}
              </SelectItem>
              <SelectItem value="active">
                {{ $t('common.active') }}
              </SelectItem>
              <SelectItem value="low_stock">
                {{ $t('erp.products.lowStock') }}
              </SelectItem>
              <SelectItem value="out_of_stock">
                {{ $t('erp.products.outOfStock') }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Products Table -->
    <Card>
      <CardHeader>
        <CardTitle>{{ $t('erp.products.list') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ $t('erp.products.table.product') }}</TableHead>
                <TableHead>{{ $t('erp.products.table.category') }}</TableHead>
                <TableHead>{{ $t('erp.products.table.stock') }}</TableHead>
                <TableHead>{{ $t('erp.products.table.price') }}</TableHead>
                <TableHead>{{ $t('erp.products.table.rating') }}</TableHead>
                <TableHead>{{ $t('erp.products.table.sales') }}</TableHead>
                <TableHead>{{ $t('erp.products.table.status') }}</TableHead>
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
                    <Skeleton class="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[60px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton class="h-4 w-[80px]" />
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

              <TableRow v-else-if="filteredProducts.length === 0">
                <TableCell colspan="8" class="h-24 text-center">
                  {{ $t('erp.products.noData') }}
                </TableCell>
              </TableRow>

              <TableRow v-for="product in filteredProducts" v-else :key="product?.id">
                <TableCell class="font-medium">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <Package class="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div class="font-semibold">
                        {{ product?.productName }}
                      </div>
                      <div class="text-sm text-muted-foreground">
                        {{ product?.productCode }}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {{ product?.category }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div class="font-medium">
                      {{ product?.stock }} pieces
                    </div>
                    <div class="text-sm text-muted-foreground">
                      Min: {{ product?.minOrder }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div class="font-medium">
                      ${{ product?.price?.toFixed(2) }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      Cost: ${{ product?.cost?.toFixed(2) }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1">
                    <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span class="font-medium">{{ product?.rating || 'N/A' }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div class="font-medium">
                      {{ product?.totalSold?.toLocaleString() || '0' }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                      sold
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(getProductStatus(product))">
                    {{ $t(`erp.products.${getProductStatus(product)}`) }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" @click="viewProduct(product)">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="editProduct(product)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="confirmDelete(product)">
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
      <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {{ isEditing ? $t('erp.products.edit') : $t('erp.products.addProduct') }}
          </DialogTitle>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="saveProduct">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="productCode">{{ $t('erp.products.productCode') }} *</Label>
              <Input
                id="productCode"
                v-model="formData.productCode"
                required
                :placeholder="$t('erp.products.productCodePlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="productName">{{ $t('erp.products.productName') }} *</Label>
              <Input
                id="productName"
                v-model="formData.productName"
                required
                :placeholder="$t('erp.products.productNamePlaceholder')"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="category">{{ $t('erp.products.category') }} *</Label>
              <Select v-model="formData.category" required>
                <SelectTrigger>
                  <SelectValue :placeholder="$t('erp.products.categoryPlaceholder')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="category in categoryOptions" :key="category" :value="category">
                    {{ category }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="material">{{ $t('erp.products.material') }}</Label>
              <Input
                id="material"
                v-model="formData.material"
                :placeholder="$t('erp.products.materialPlaceholder')"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="description">{{ $t('erp.products.description') }}</Label>
            <Textarea
              id="description"
              v-model="formData.description"
              :placeholder="$t('erp.products.descriptionPlaceholder')"
              rows="3"
            />
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="colors">{{ $t('erp.products.color') }}</Label>
              <Input
                id="colors"
                v-model="colorInput"
                :placeholder="$t('erp.products.colorPlaceholder')"
                @keydown.enter="addColor"
              />
              <div v-if="formData.colors.length > 0" class="flex flex-wrap gap-1 mt-2">
                <Badge
                  v-for="(color, index) in formData.colors"
                  :key="index"
                  variant="secondary"
                  class="cursor-pointer"
                  @click="removeColor(index)"
                >
                  {{ color }} ×
                </Badge>
              </div>
            </div>
            <div class="space-y-2">
              <Label for="sizes">{{ $t('erp.products.size') }}</Label>
              <Input
                id="sizes"
                v-model="sizeInput"
                :placeholder="$t('erp.products.sizePlaceholder')"
                @keydown.enter="addSize"
              />
              <div v-if="formData.sizes.length > 0" class="flex flex-wrap gap-1 mt-2">
                <Badge
                  v-for="(size, index) in formData.sizes"
                  :key="index"
                  variant="secondary"
                  class="cursor-pointer"
                  @click="removeSize(index)"
                >
                  {{ size }} ×
                </Badge>
              </div>
            </div>
            <div class="space-y-2">
              <Label for="unit">{{ $t('erp.products.unit') }}</Label>
              <Input
                id="unit"
                v-model="formData.unit"
                :placeholder="$t('erp.products.unitPlaceholder')"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="price">{{ $t('erp.products.unitPrice') }} *</Label>
              <Input
                id="price"
                v-model.number="formData.price"
                type="number"
                step="0.01"
                required
                :placeholder="$t('erp.products.unitPricePlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="cost">{{ $t('erp.products.costPrice') }}</Label>
              <Input
                id="cost"
                v-model.number="formData.cost"
                type="number"
                step="0.01"
                :placeholder="$t('erp.products.costPricePlaceholder')"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="stock">{{ $t('erp.products.stockQuantity') }}</Label>
              <Input
                id="stock"
                v-model.number="formData.stock"
                type="number"
                :placeholder="$t('erp.products.stockQuantityPlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="minOrder">{{ $t('erp.products.minStockLevel') }}</Label>
              <Input
                id="minOrder"
                v-model.number="formData.minOrder"
                type="number"
                :placeholder="$t('erp.products.minStockLevelPlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <Label for="leadTime">Lead Time (days)</Label>
              <Input
                id="leadTime"
                v-model.number="formData.leadTime"
                type="number"
                placeholder="14"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="weight">
                {{ $t('erp.products.weight') }}
                <span v-if="formData.category" class="text-sm text-muted-foreground">({{ weightUnit }})</span>
              </Label>
              <Input
                id="weight"
                v-model.number="formData.weight"
                type="number"
                step="1"
                :placeholder="`Enter weight in ${weightUnit}`"
              />
              <p v-if="formData.category" class="text-xs text-muted-foreground">
                Weight unit for {{ formData.category }}: {{ weightUnit }}
              </p>
            </div>
            <div class="space-y-2">
              <Label for="dimensions">{{ $t('erp.products.dimensions') }}</Label>
              <Input
                id="dimensions"
                v-model="formData.dimensions"
                :placeholder="$t('erp.products.dimensionsPlaceholder')"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="supplier">{{ $t('erp.products.supplier') }}</Label>
            <Input
              id="supplier"
              v-model="formData.supplier"
              :placeholder="$t('erp.products.supplierPlaceholder')"
            />
          </div>

          <!-- Specifications Section -->
          <div class="space-y-4">
            <Label class="text-base font-semibold">Specifications</Label>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="fit">Fit Type</Label>
                <Select v-model="formData.specifications.fit">
                  <SelectTrigger>
                    <SelectValue placeholder="Select fit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">
                      Regular
                    </SelectItem>
                    <SelectItem value="Slim fit">
                      Slim Fit
                    </SelectItem>
                    <SelectItem value="Loose fit">
                      Loose Fit
                    </SelectItem>
                    <SelectItem value="Tight fit">
                      Tight Fit
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-2">
                <Label for="care">Care Instructions</Label>
                <Input
                  id="care"
                  v-model="formData.specifications.care"
                  placeholder="e.g., Machine wash cold"
                />
              </div>
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
          <DialogTitle>{{ $t('erp.products.details') }}</DialogTitle>
        </DialogHeader>

        <div v-if="selectedProduct" class="space-y-6">
          <div class="flex items-start gap-4">
            <div class="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
              <Package class="h-10 w-10 text-muted-foreground" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold">
                {{ selectedProduct.productName }}
              </h3>
              <p class="text-muted-foreground">
                {{ selectedProduct.productCode }}
              </p>
              <Badge class="mt-2" variant="outline">
                {{ selectedProduct.category }}
              </Badge>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.products.description')
              }}</Label>
              <p>{{ selectedProduct.description }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.products.material')
              }}</Label>
              <p>{{ selectedProduct.material }}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.products.color')
              }}</Label>
              <p>
                {{
                  Array.isArray(selectedProduct.colors)
                    ? selectedProduct.colors.join(', ')
                    : selectedProduct.color || 'N/A'
                }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.products.size')
              }}</Label>
              <p>
                {{
                  Array.isArray(selectedProduct.sizes)
                    ? selectedProduct.sizes.join(', ')
                    : selectedProduct.size || 'N/A'
                }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.products.unit')
              }}</Label>
              <p>pieces</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.products.unitPrice')
              }}</Label>
              <p class="text-lg font-semibold">
                ${{ selectedProduct.price?.toFixed(2) }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.products.costPrice')
              }}</Label>
              <p>${{ selectedProduct.cost?.toFixed(2) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">Rating</Label>
              <div class="flex items-center gap-1">
                <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span class="font-medium">{{ selectedProduct.rating || 'N/A' }}</span>
              </div>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">Total Sold</Label>
              <p class="font-medium">
                {{ selectedProduct.totalSold?.toLocaleString() || '0' }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">Lead Time</Label>
              <p>{{ selectedProduct.leadTime ? `${selectedProduct.leadTime} days` : 'N/A' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.products.stockQuantity')
              }}</Label>
              <p>{{ selectedProduct.stock }} pieces</p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.products.minStockLevel')
              }}</Label>
              <p>{{ selectedProduct.minOrder }} pieces</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.products.weight')
              }}</Label>
              <p>
                {{ formatWeight(selectedProduct.specifications?.weight, selectedProduct.category) }}
              </p>
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground">{{
                $t('erp.products.dimensions')
              }}</Label>
              <p>{{ selectedProduct.specifications?.dimensions || 'N/A' }}</p>
            </div>
          </div>

          <div>
            <Label class="text-sm font-medium text-muted-foreground">{{
              $t('erp.products.supplier')
            }}</Label>
            <p>{{ selectedProduct.supplier || 'N/A' }}</p>
          </div>

          <!-- Images section -->
          <div v-if="selectedProduct.images && selectedProduct.images.length > 0">
            <Label class="text-sm font-medium text-muted-foreground">Product Images</Label>
            <div class="flex gap-2 mt-2">
              <div
                v-for="(image, index) in selectedProduct.images"
                :key="index"
                class="h-16 w-16 rounded-md bg-muted flex items-center justify-center border"
              >
                <Package class="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </div>

          <!-- Specifications section -->
          <div v-if="selectedProduct.specifications">
            <Label class="text-sm font-medium text-muted-foreground">Specifications</Label>
            <div class="grid grid-cols-2 gap-4 mt-2">
              <div
                v-for="(value, key) in selectedProduct.specifications"
                :key="key"
                class="flex justify-between"
              >
                <span class="text-sm text-muted-foreground capitalize">{{ key.replace(/([A-Z])/g, ' $1') }}:</span>
                <span class="text-sm font-medium">
                  {{ key === 'weight' ? formatWeight(value, selectedProduct.category) : value }}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label class="text-sm font-medium text-muted-foreground">{{
              $t('erp.products.status')
            }}</Label>
            <Badge :variant="getStatusVariant(getProductStatus(selectedProduct))">
              {{ $t(`erp.products.${getProductStatus(selectedProduct)}`) }}
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
          <DialogTitle>{{ $t('erp.products.confirmDelete') }}</DialogTitle>
        </DialogHeader>

        <p class="text-muted-foreground">
          {{ $t('erp.products.deleteMessage', { name: productToDelete?.productName }) }}
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
