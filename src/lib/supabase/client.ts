import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  console.log("URL Value:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("KEY Value:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}