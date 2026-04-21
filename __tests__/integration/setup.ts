import * as dotenv from 'dotenv'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

dotenv.config()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

if (!url || !serviceKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY in .env')
}

/** Admin client that bypasses RLS — use only in tests */
export function getAdminClient(): SupabaseClient {
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * Returns the ID of the first real profile in the DB.
 * Integration tests use this as the created_by_user_id so FK constraints pass.
 */
export async function getTestUserId(): Promise<string> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .limit(1)
    .single()

  if (error || !data) {
    throw new Error(`Could not fetch a profile to use as test user: ${error?.message}`)
  }
  return data.id
}

/** Unique marker embedded in every test row so cleanup can find strays */
export const TEST_MARKER = '__integration_test__'
