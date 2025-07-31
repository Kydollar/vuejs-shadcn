import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-vue-next'
import { useSidebar } from '@/composables/use-sidebar'

const user = {
  name: 'shadcn',
  email: 'm@example.com',
  avatar: '/avatars/shadcn.jpg',
}

const teams = [
  {
    name: 'Acme Inc',
    logo: GalleryVerticalEnd,
    plan: 'Enterprise',
  },
  {
    name: 'Acme Corp.',
    logo: AudioWaveform,
    plan: 'Startup',
  },
  {
    name: 'Evil Corp.',
    logo: Command,
    plan: 'Free',
  },
]

const { navData } = useSidebar()

export const sidebarData = {
  user,
  teams,
  navMain: navData?.value,
}
