/**
 * Environment configuration utility
 */

const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  API_TIMEOUT: Number.parseInt(import.meta.env.VITE_API_TIMEOUT, 10) || 10000,

  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'InysDev',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Environment
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,

  // Feature Flags
  ENABLE_REGISTRATION: import.meta.env.VITE_ENABLE_REGISTRATION === 'true',
  ENABLE_PASSWORD_RESET: import.meta.env.VITE_ENABLE_PASSWORD_RESET === 'true',
}

export default env
