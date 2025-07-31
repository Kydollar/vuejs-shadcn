import { h } from 'vue'
import { toast } from 'vue-sonner'
import { z } from 'zod'

/**
 * Load .env file and validate it against the schema
 * Has this file, it will be loaded automatically by vite and we will be have environment variables available type
 * If EnvSchema Object has Key but not in .env file, it will be have a error in page
 */

const EnvSchema = z.object({
  // Add your environment variables here, for example:
  // VITE_API_BASE_URL: z.string().url(),
  VITE_SERVER_API_URL: z.string().url(),
  VITE_SERVER_API_PREFIX: z.string().optional().default(''),
  VITE_SERVER_API_TIMEOUT: z.coerce.number().default(5000),
})

const { data: env, error } = EnvSchema.safeParse(import.meta.env)

if (error) {
  console.error('❌ Invalid env')
  console.error(error.flatten().fieldErrors)
  toast.error('Env error: Invalid or missing environment variables', {
    description: h(
      'pre',
      { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4 overflow-x-auto' },
      h(
        'code',
        { class: 'text-white text-sm' },
        JSON.stringify(error.flatten().fieldErrors, null, 2),
      ),
    ),
  })
}

export default env
