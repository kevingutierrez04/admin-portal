/**
 * Integration tests — Whitelisted Emails
 *
 * Creates an email with TEST_MARKER, reads it back, deletes it.
 */

import * as dotenv from 'dotenv'
dotenv.config()

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

import { getAdminClient, getTestUserId, TEST_MARKER } from './setup'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createReal } from '@supabase/supabase-js'

let testUserId: string
let admin: SupabaseClient
let createdIds: number[] = []

jest.mock('../../app/lib/supabase/server', () => ({
  createClient: jest.fn(() => {
    const client = createReal(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
    client.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: testUserId, email: 'integration@test.local' } },
      error: null,
    })
    return Promise.resolve(client)
  }),
}))

import { createWhitelistedEmail, deleteWhitelistedEmail } from '../../app/admin/whitelisted-emails/actions'

beforeAll(async () => {
  admin = getAdminClient()
  testUserId = await getTestUserId()
})

afterAll(async () => {
  if (createdIds.length > 0) {
    await admin.from('whitelist_email_addresses').delete().in('id', createdIds)
  }
})

describe('Whitelisted Emails — integration (real DB)', () => {
  const testEmail = `${TEST_MARKER}@integration-test.local`
  let emailId: number

  describe('CREATE', () => {
    it('inserts a new whitelisted email row', async () => {
      const fd = new FormData()
      fd.append('email_address', testEmail)

      const result = await createWhitelistedEmail(fd)

      expect(result.error).toBeUndefined()
      expect(result.success).toBe(true)

      emailId = result.data!.id
      createdIds.push(emailId)

      const { data, error } = await admin
        .from('whitelist_email_addresses')
        .select('*')
        .eq('id', emailId)
        .single()

      expect(error).toBeNull()
      expect(data.email_address).toBe(testEmail)
    })
  })

  describe('READ', () => {
    it('the created email is queryable from the database', async () => {
      const { data, error } = await admin
        .from('whitelist_email_addresses')
        .select('email_address')
        .eq('id', emailId)
        .single()

      expect(error).toBeNull()
      expect(data.email_address).toBe(testEmail)
    })
  })

  describe('DELETE', () => {
    it('removes the email row from the database', async () => {
      const result = await deleteWhitelistedEmail(emailId)

      expect(result.error).toBeUndefined()
      expect(result.success).toBe(true)

      const { data } = await admin
        .from('whitelist_email_addresses')
        .select('id')
        .eq('id', emailId)
        .maybeSingle()

      expect(data).toBeNull()
      createdIds = createdIds.filter((id) => id !== emailId)
    })
  })
})
