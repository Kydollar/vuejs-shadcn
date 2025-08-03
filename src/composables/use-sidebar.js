import {
  BadgeHelp,
  BarChart3,
  BellDot,
  Boxes,
  Bug,
  Building2,
  CheckCircle,
  ClipboardList,
  CreditCard,
  Factory,
  FileText,
  GitBranch,
  LayoutDashboard,
  ListTodo,
  Package,
  Paintbrush,
  Palette,
  PictureInPicture2,
  Settings,
  ShoppingCart,
  SquareUserRound,
  Truck,
  User,
  Users,
  Wrench,
} from 'lucide-vue-next'
import { ref } from 'vue'
import { MENU_APP } from '@/constants/menu-app'

export function useSidebar() {
  const navData = ref([])

  navData.value = [
    {
      title: 'General',
      items: [
        {
          title: 'Tasks',
          url: MENU_APP.TASKS,
          icon: ListTodo,
        },
        {
          title: 'Apps',
          url: MENU_APP.APPS,
          icon: Boxes,
        },
        {
          title: 'Users',
          icon: Users,
          items: [
            { title: 'User List', url: MENU_APP.USERS.ROOT },
            { title: 'User Detail', url: MENU_APP.USERS.DETAIL },
          ],
        },
      ],
    },
    // ERP Menu
    {
      title: 'Master Data',
      items: [
        {
          title: 'Buyers Management',
          url: MENU_APP.ERP.MASTER_DATA.BUYERS,
          icon: Building2,
        },
        {
          title: 'Factories Management',
          url: MENU_APP.ERP.MASTER_DATA.FACTORIES,
          icon: Factory,
        },
        {
          title: 'Styles/Products Management',
          url: MENU_APP.ERP.MASTER_DATA.PRODUCTS,
          icon: Package,
        },
      ],
    },
    {
      title: 'Orders Management',
      items: [
        {
          title: 'Order List',
          url: MENU_APP.ERP.ORDERS,
          icon: Building2,
        },
      ],
    },
    {
      title: 'ERP System',
      items: [
        {
          title: 'Dashboard',
          url: MENU_APP.ERP.DASHBOARD,
          icon: LayoutDashboard,
        },
        {
          title: 'Production',
          url: MENU_APP.ERP.PRODUCTION,
          icon: ClipboardList,
        },
        {
          title: 'Quality Control',
          url: MENU_APP.ERP.QC,
          icon: CheckCircle,
        },
        {
          title: 'Farm Out',
          url: MENU_APP.ERP.FARM_OUT,
          icon: Wrench,
        },
        {
          title: 'Packing List',
          url: MENU_APP.ERP.PACKING_LIST,
          icon: Package,
        },
        {
          title: 'Delivery Note',
          url: MENU_APP.ERP.DELIVERY_NOTE,
          icon: Truck,
        },
      ],
    },

    // Example ERP Menu
    {
      title: 'Example ERP System',
      items: [
        {
          title: 'Dashboard',
          url: MENU_APP.EXAMPLE_ERP.DASHBOARD,
          icon: LayoutDashboard,
        },
        {
          title: 'Buyers',
          url: MENU_APP.EXAMPLE_ERP.BUYERS,
          icon: Building2,
        },
        {
          title: 'Factories',
          url: MENU_APP.EXAMPLE_ERP.FACTORIES,
          icon: Factory,
        },
        {
          title: 'Products',
          url: MENU_APP.EXAMPLE_ERP.PRODUCTS,
          icon: Package,
        },
        {
          title: 'Orders',
          url: MENU_APP.EXAMPLE_ERP.ORDERS,
          icon: ShoppingCart,
        },
        {
          title: 'Order Recap',
          url: MENU_APP.EXAMPLE_ERP.ORDER_RECAP,
          icon: FileText,
        },
        {
          title: 'Decorations',
          url: MENU_APP.EXAMPLE_ERP.DECORATIONS,
          icon: Paintbrush,
        },
        {
          title: 'Production',
          url: MENU_APP.EXAMPLE_ERP.PRODUCTION,
          icon: ClipboardList,
        },
        {
          title: 'Production Reports',
          url: MENU_APP.EXAMPLE_ERP.PRODUCTION_REPORTS,
          icon: BarChart3,
        },
        {
          title: 'Process Flow',
          url: MENU_APP.EXAMPLE_ERP.PROCESS_FLOW,
          icon: GitBranch,
        },
        {
          title: 'Quality Control',
          url: MENU_APP.EXAMPLE_ERP.QC,
          icon: CheckCircle,
        },
        {
          title: 'Farm Out',
          url: MENU_APP.EXAMPLE_ERP.FARM_OUT,
          icon: Wrench,
        },
        {
          title: 'Packing List',
          url: MENU_APP.EXAMPLE_ERP.PACKING_LIST,
          icon: Package,
        },
        {
          title: 'Delivery Note',
          url: MENU_APP.EXAMPLE_ERP.DELIVERY_NOTE,
          icon: Truck,
        },
      ],
    },
    {
      title: 'Pages',
      items: [
        {
          title: 'Auth',
          icon: SquareUserRound,
          items: [
            { title: 'Sign In', url: '/auth/sign-in' },
            { title: 'Sign In(2 Col)', url: '/auth/sign-in-2' },
            { title: 'Sign Up', url: '/auth/sign-up' },
            { title: 'Forgot Password', url: '/auth/forgot-password' },
            { title: 'OTP', url: '/auth/otp' },
          ],
        },
        {
          title: 'Errors',
          icon: Bug,
          items: [
            { title: '401 | Unauthorized', url: '/errors/401' },
            { title: '403 | Forbidden', url: '/errors/403' },
            { title: '404 | Not Found', url: '/errors/404' },
            { title: '500 | Internal Server Error', url: '/errors/500' },
            { title: '503 | Maintenance Error', url: '/errors/503' },
          ],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            { title: 'Profile', url: '/settings/', icon: User },
            { title: 'Account', url: '/settings/account', icon: Wrench },
            { title: 'Appearance', url: '/settings/appearance', icon: Palette },
            { title: 'Notifications', url: '/settings/notifications', icon: BellDot },
            { title: 'Display', url: '/settings/display', icon: PictureInPicture2 },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: BadgeHelp,
        },
      ],
    },
  ]

  const otherPages = ref([
    {
      title: 'Other',
      items: [
        {
          title: 'Plans & Pricing',
          icon: CreditCard,
          url: '/billing',
        },
      ],
    },
  ])

  return {
    navData,
    otherPages,
  }
}
