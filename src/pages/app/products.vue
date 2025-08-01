<script setup>
import {
  CheckCircle,
  DollarSign,
  Edit,
  Eye,
  Grid,
  MoreVertical,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useProductStore } from '@/stores/product'

// Store
const productStore = useProductStore()

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const dialogOpen = ref(false)
const viewDialogOpen = ref(false)
const isEditing = ref(false)
const selectedProduct = ref(null)
const searchQuery = ref('')
const categoryFilter = ref('all')
const statusFilter = ref('all')
const sizeRangeInput = ref('')

const formData = ref({
  style_no: '',
  name: '',
  category: '',
  body_color: '',
  graphic_no: '',
  price: '',
  material: '',
  weight: '',
  tech_description: '',
  specifications: {
    fabric_type: '',
    gsm: '',
    shrinkage: '',
    color_fastness: '',
  },
})

// Computed
const categories = computed(() => {
  const cats = [...new Set(productStore.products.map(p => p.category))]
  return cats.sort()
})

const filteredProducts = computed(() => {
  let filtered = productStore.products

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query)
      || product.style_no.toLowerCase().includes(query)
      || product.category.toLowerCase().includes(query)
      || product.body_color.toLowerCase().includes(query),
    )
  }

  // Filter by category
  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(product => product.category === categoryFilter.value)
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(product => product.status === statusFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

// Methods
function resetForm() {
  formData.value = {
    style_no: '',
    name: '',
    category: '',
    body_color: '',
    graphic_no: '',
    price: '',
    material: '',
    weight: '',
    tech_description: '',
    specifications: {
      fabric_type: '',
      gsm: '',
      shrinkage: '',
      color_fastness: '',
    },
  }
  sizeRangeInput.value = ''
}

function openCreateDialog() {
  isEditing.value = false
  resetForm()
  dialogOpen.value = true
}

function editProduct(product) {
  isEditing.value = true
  formData.value = {
    ...product,
    specifications: { ...product.specifications },
  }
  sizeRangeInput.value = product.size_range.join(', ')
  dialogOpen.value = true
}

function viewProduct(product) {
  selectedProduct.value = product
  viewDialogOpen.value = true
}

async function deleteProduct(product) {
  // eslint-disable-next-line no-alert
  if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
    try {
      await productStore.deleteProduct(product.id)
    }
    catch (error) {
      console.error('Error deleting product:', error)
    }
  }
}

async function submitForm() {
  submitting.value = true
  try {
    const productData = {
      ...formData.value,
      size_range: sizeRangeInput.value.split(',').map(s => s.trim()).filter(s => s),
    }

    if (isEditing.value) {
      await productStore.updateProduct(formData.value.id, productData)
    }
    else {
      await productStore.createProduct(productData)
    }
    dialogOpen.value = false
    resetForm()
  }
  catch (error) {
    console.error('Error saving product:', error)
  }
  finally {
    submitting.value = false
  }
}

async function fetchProducts() {
  loading.value = true
  try {
    await productStore.fetchProducts()
  }
  catch (error) {
    console.error('Error fetching products:', error)
  }
  finally {
    loading.value = false
  }
}

// Initialize
onMounted(async () => {
  await fetchProducts()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Products Management
        </h1>
        <p class="text-muted-foreground">
          Manage your product catalog and specifications.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="fetchProducts">
          <RefreshCw class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" @click="openCreateDialog">
          <Plus class="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex-1 max-w-sm">
        <div class="relative">
          <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search products..."
            class="pl-8"
          />
        </div>
      </div>
      <Select v-model="categoryFilter">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All Categories
          </SelectItem>
          <SelectItem v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="statusFilter">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All Status
          </SelectItem>
          <SelectItem value="active">
            Active
          </SelectItem>
          <SelectItem value="inactive">
            Inactive
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Products Stats -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Products
          </CardTitle>
          <Package class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ productStore.totalProducts }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Categories
          </CardTitle>
          <Grid class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ categories.length }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Average Price
          </CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            ${{ productStore.averagePrice.toFixed(2) }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Active Products
          </CardTitle>
          <CheckCircle class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ productStore.activeProducts.length }}
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span class="text-sm text-muted-foreground">Loading products...</span>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="product in filteredProducts" :key="product.id" class="hover:shadow-lg transition-shadow">
        <div class="relative">
          <img
            :src="product.images[0] || '/placeholder.png'"
            :alt="product.name"
            class="w-full h-48 object-cover rounded-t-lg"
          />
          <Badge
            :variant="product.status === 'active' ? 'default' : 'secondary'"
            class="absolute top-2 right-2"
          >
            {{ product.status }}
          </Badge>
        </div>

        <CardHeader class="pb-3">
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <CardTitle class="text-lg">
                {{ product.name }}
              </CardTitle>
              <div class="flex items-center space-x-2">
                <Badge variant="outline">
                  {{ product.style_no }}
                </Badge>
                <Badge variant="secondary">
                  {{ product.category }}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="sm">
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="viewProduct(product)">
                  <Eye class="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem @click="editProduct(product)">
                  <Edit class="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="text-destructive" @click="deleteProduct(product)">
                  <Trash2 class="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent class="space-y-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Color:</span>
              <span class="font-medium">{{ product.body_color }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Material:</span>
              <span class="font-medium">{{ product.material }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Weight:</span>
              <span class="font-medium">{{ product.weight }} GSM</span>
            </div>
          </div>

          <Separator />

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">
                Price
              </p>
              <p class="text-2xl font-bold">
                ${{ product.price.toFixed(2) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm text-muted-foreground">
                Sizes
              </p>
              <p class="text-sm font-medium">
                {{ product.size_range.length }} sizes
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-medium text-muted-foreground">
              Description
            </p>
            <p class="text-sm text-muted-foreground">
              {{ product.tech_description }}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredProducts.length === 0" class="text-center py-12">
      <Package class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">
        No products found
      </h3>
      <p class="text-muted-foreground mb-4">
        {{ searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding your first product.' }}
      </p>
      <Button v-if="!searchQuery" @click="openCreateDialog">
        <Plus class="h-4 w-4 mr-2" />
        Add First Product
      </Button>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
      <DialogContent class="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Edit' : 'Add New' }} Product</DialogTitle>
          <DialogDescription>
            {{ isEditing ? 'Update product information.' : 'Add a new product to your catalog.' }}
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="submitForm">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="style_no">Style Number</Label>
              <Input
                id="style_no"
                v-model="formData.style_no"
                placeholder="e.g., TS-001"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="name">Product Name</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="Basic Cotton T-Shirt"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="category">Category</Label>
              <Input
                id="category"
                v-model="formData.category"
                placeholder="T-Shirt"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="body_color">Body Color</Label>
              <Input
                id="body_color"
                v-model="formData.body_color"
                placeholder="White"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="graphic_no">Graphic Number</Label>
              <Input
                id="graphic_no"
                v-model="formData.graphic_no"
                placeholder="GR-001"
              />
            </div>
            <div class="space-y-2">
              <Label for="price">Price ($)</Label>
              <Input
                id="price"
                v-model.number="formData.price"
                type="number"
                step="0.01"
                placeholder="12.50"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="material">Material</Label>
            <Input
              id="material"
              v-model="formData.material"
              placeholder="100% Cotton"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="weight">Weight (GSM)</Label>
              <Input
                id="weight"
                v-model.number="formData.weight"
                type="number"
                placeholder="180"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="size_range">Size Range (comma separated)</Label>
              <Input
                id="size_range"
                v-model="sizeRangeInput"
                placeholder="XS, S, M, L, XL, XXL"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="tech_description">Technical Description</Label>
            <Textarea
              id="tech_description"
              v-model="formData.tech_description"
              placeholder="100% Cotton, Single Jersey, 180 GSM"
              rows="3"
              required
            />
          </div>

          <!-- Specifications -->
          <div class="space-y-4">
            <h4 class="font-semibold">
              Specifications
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="fabric_type">Fabric Type</Label>
                <Input
                  id="fabric_type"
                  v-model="formData.specifications.fabric_type"
                  placeholder="Single Jersey"
                />
              </div>
              <div class="space-y-2">
                <Label for="gsm">GSM</Label>
                <Input
                  id="gsm"
                  v-model.number="formData.specifications.gsm"
                  type="number"
                  placeholder="180"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="shrinkage">Shrinkage</Label>
                <Input
                  id="shrinkage"
                  v-model="formData.specifications.shrinkage"
                  placeholder="3-5%"
                />
              </div>
              <div class="space-y-2">
                <Label for="color_fastness">Color Fastness</Label>
                <Input
                  id="color_fastness"
                  v-model="formData.specifications.color_fastness"
                  placeholder="Grade 4-5"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="dialogOpen = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="submitting">
              {{ submitting ? 'Saving...' : (isEditing ? 'Update' : 'Create') }} Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- View Product Dialog -->
    <Dialog :open="viewDialogOpen" @update:open="viewDialogOpen = $event">
      <DialogContent class="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{{ selectedProduct?.name }}</DialogTitle>
          <DialogDescription>Product details and specifications</DialogDescription>
        </DialogHeader>

        <div v-if="selectedProduct" class="space-y-6">
          <div class="flex space-x-6">
            <img
              :src="selectedProduct.images[0] || '/placeholder.png'"
              :alt="selectedProduct.name"
              class="w-32 h-32 object-cover rounded-lg"
            />
            <div class="flex-1 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h4 class="font-semibold mb-2">
                    Basic Information
                  </h4>
                  <div class="space-y-1 text-sm">
                    <div><strong>Style No:</strong> {{ selectedProduct.style_no }}</div>
                    <div><strong>Category:</strong> {{ selectedProduct.category }}</div>
                    <div><strong>Color:</strong> {{ selectedProduct.body_color }}</div>
                    <div><strong>Price:</strong> ${{ selectedProduct.price.toFixed(2) }}</div>
                  </div>
                </div>
                <div>
                  <h4 class="font-semibold mb-2">
                    Material & Specs
                  </h4>
                  <div class="space-y-1 text-sm">
                    <div><strong>Material:</strong> {{ selectedProduct.material }}</div>
                    <div><strong>Weight:</strong> {{ selectedProduct.weight }} GSM</div>
                    <div><strong>Graphic No:</strong> {{ selectedProduct.graphic_no }}</div>
                    <div><strong>Status:</strong> {{ selectedProduct.status }}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="font-semibold mb-2">
                  Size Range
                </h4>
                <div class="flex flex-wrap gap-2">
                  <Badge v-for="size in selectedProduct.size_range" :key="size" variant="outline">
                    {{ size }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-semibold mb-2">
              Technical Description
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ selectedProduct.tech_description }}
            </p>
          </div>

          <div v-if="selectedProduct.specifications">
            <h4 class="font-semibold mb-2">
              Detailed Specifications
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div v-if="selectedProduct.specifications.fabric_type">
                <strong>Fabric Type:</strong> {{ selectedProduct.specifications.fabric_type }}
              </div>
              <div v-if="selectedProduct.specifications.gsm">
                <strong>GSM:</strong> {{ selectedProduct.specifications.gsm }}
              </div>
              <div v-if="selectedProduct.specifications.shrinkage">
                <strong>Shrinkage:</strong> {{ selectedProduct.specifications.shrinkage }}
              </div>
              <div v-if="selectedProduct.specifications.color_fastness">
                <strong>Color Fastness:</strong> {{ selectedProduct.specifications.color_fastness }}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
