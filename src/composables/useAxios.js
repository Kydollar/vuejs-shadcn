import axios from 'axios'

import env from '@/utils/env'

export function useAxios() {
  const cleanBase = env.VITE_SERVER_API_URL.trim().replace(/\/+$/, '')
  const prefix = env.VITE_SERVER_API_PREFIX.trim().replace(/^\/?/, '/')

  const baseURL = `${cleanBase}${prefix}`

  if (import.meta.env.DEV && !env.VITE_SERVER_API_PREFIX) {
    console.warn('[useAxios] ⚠️ No API prefix set — using base URL only:', env.VITE_SERVER_API_URL)
  }

  const axiosInstance = axios.create({
    baseURL,
    timeout: env.VITE_SERVER_API_TIMEOUT,
  })

  return {
    axiosInstance,
  }
}
