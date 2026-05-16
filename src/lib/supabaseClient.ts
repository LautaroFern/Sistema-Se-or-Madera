import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: (...args) => {
      const [url, options = {}] = args
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      return fetch(url as RequestInfo | URL, {
        ...(options as RequestInit),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId))
    },
  },
})