// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we have valid Supabase credentials (not placeholder values)
function isValidSupabaseConfig(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false
  if (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) return false
  if (supabaseUrl === 'https://your-project.supabase.co') return false
  return true
}

export const isSupabaseConfigured = isValidSupabaseConfig()

// Only create client if configured properly, otherwise create a dummy that will be checked
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null
