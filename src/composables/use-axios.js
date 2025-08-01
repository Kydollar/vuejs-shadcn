import axios from 'axios'

import env from '@/lib/env'
import { useAuthStore } from '@/modules/auth' // Module Auth

export function useAxios() {
  const axiosInstance = axios.create({
    baseURL: env.API_BASE_URL,
    timeout: env.API_TIMEOUT,
  })

  axiosInstance.interceptors.request.use(
    (config) => {
      // 5. Get the token directly from the Pinia store, which reads from sessionStorage
      //    This is generally safer as the store is the single source of truth for auth state.
      const authStore = useAuthStore() // Access the store inside the interceptor
      if (authStore.token) { // Use authStore.token which is reactive
        config.headers.Authorization = `Bearer ${authStore.token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  axiosInstance.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      // You can handle 401/403 errors globally here.
      // This is often a good place to clear auth and redirect.
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Use the auth store to clear credentials
        const authStore = useAuthStore()
        authStore.clearAuth()
        // Optionally, redirect to login page
        // import router from '@/router'; // Make sure your router instance is importable or passed
        // router.push('/auth/sign-in');
      }
      return Promise.reject(error)
    },
  )

  return {
    axiosInstance,
  }
}
