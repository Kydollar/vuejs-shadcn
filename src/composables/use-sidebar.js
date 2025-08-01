import {
  BadgeHelp,
  BarChart3,
  BellDot,
  Boxes,
  Bug,
  Building,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListTodo,
  Package,
  Palette,
  PictureInPicture2,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
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
          title: 'Dashboard',
          url: MENU_APP.DASHBOARD,
          icon: LayoutDashboard,
        },
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
    {
      title: 'ERP System',
      items: [
        {
          title: 'ERP Dashboard',
          url: MENU_APP.ERP.DASHBOARD,
          icon: LayoutDashboard,
        },
        {
          title: 'Buyers',
          url: MENU_APP.ERP.BUYERS,
          icon: Users,
        },
        {
          title: 'Factories',
          url: MENU_APP.ERP.FACTORIES,
          icon: Building,
        },
        {
          title: 'Products',
          url: MENU_APP.ERP.PRODUCTS,
          icon: Package,
        },
        {
          title: 'Orders',
          url: MENU_APP.ERP.ORDERS,
          icon: ShoppingCart,
        },
        {
          title: 'Decorations',
          url: MENU_APP.ERP.DECORATIONS,
          icon: Sparkles,
        },
        {
          title: 'Reports',
          url: MENU_APP.ERP.REPORTS,
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Workflow',
      items: [
        {
          title: 'Production',
          url: MENU_APP.ERP.PRODUCTION,
          icon: Settings,
        },
        {
          title: 'Quality Control',
          url: MENU_APP.ERP.QC,
          icon: Shield,
        },
        {
          title: 'Farm Out',
          url: MENU_APP.ERP.FARMOUT,
          icon: Truck,
        },
        {
          title: 'Packing List',
          url: MENU_APP.ERP.PACKING_LIST,
          icon: Package,
        },
        {
          title: 'Delivery Note',
          url: MENU_APP.ERP.DELIVERY_NOTE,
          icon: FileText,
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
