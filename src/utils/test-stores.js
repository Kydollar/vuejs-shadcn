// Test halaman untuk menguji semua stores dengan storeToRefs
import { storeToRefs } from 'pinia'

// example stores
import { useBuyersStore } from '@/stores/example/buyers'
import { useDecorationsStore } from '@/stores/example/decorations'
import { useFactoriesStore } from '@/stores/example/factories'
import { useOrdersStore } from '@/stores/example/orders'
import { useProductsStore } from '@/stores/example/products'

// Test reactive stores
export function testStoresReactivity() {
  console.log('Testing stores reactivity...')

  // Test buyers store
  const buyersStore = useBuyersStore()
  const { buyers, loading: buyersLoading, statistics: buyersStats } = storeToRefs(buyersStore)

  // Test factories store
  const factoriesStore = useFactoriesStore()
  const {
    factories,
    loading: factoriesLoading,
    statistics: factoriesStats,
  } = storeToRefs(factoriesStore)

  // Test products store
  const productsStore = useProductsStore()
  const {
    products,
    loading: productsLoading,
    statistics: productsStats,
  } = storeToRefs(productsStore)

  // Test orders store
  const ordersStore = useOrdersStore()
  const { orders, loading: ordersLoading, statistics: ordersStats } = storeToRefs(ordersStore)

  // Test decorations store
  const decorationsStore = useDecorationsStore()
  const { decorations, loading: decorationsLoading } = storeToRefs(decorationsStore)

  console.log('All stores reactive with storeToRefs:', {
    buyers: buyers.value.length,
    factories: factories.value.length,
    products: products.value.length,
    orders: orders.value.length,
    decorations: decorations.value.length,
  })

  return {
    buyersStore,
    factoriesStore,
    productsStore,
    ordersStore,
    decorationsStore,
  }
}
