<script setup>
import { useRouter } from 'vue-router'
import { MENU_APP } from '@/constants/menu-app'

const router = useRouter()
router.replace({ name: `${MENU_APP.DASHBOARD}` })
</script>
