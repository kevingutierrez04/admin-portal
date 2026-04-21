/**
 * Integration tests — Allowed Signup Domains
 *
 * Creates a domain with TEST_MARKER, reads it back, deletes it.
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

import { createDomain, deleteDomain } from '../../app/admin/allowed-domains/actions'

beforeAll(async () => {
  admin = getAdminClient()
  testUserId = await getTestUserId()
})

afterAll(async () => {
  if (createdIds.length > 0) {
    await admin.from('allowed_signup_domains').delete().in('id', createdIds)
  }
})

describe('Allowed Domains — integration (real DB)', () => {
  const testDomain = `integration-test.local`
  let domainId: number

  describe('CREATE', () => {
    it('inserts a new allowed domain row', async () => {
      const fd = new FormData()
      fd.append('apex_domain', testDomain)

      const result = await createDomain(fd)

      expect(result.error).toBeUndefined()
      expect(result.success).toBe(true)

      domainId = result.data!.id
      createdIds.push(domainId)

      const { data, error } = await admin
        .from('allowed_signup_domains')
        .select('*')
        .eq('id', domainId)
        .single()

      expect(error).toBeNull()
      expect(data.apex_domain).toBe(testDomain)
    })
  })

  describe('READ', () => {
    it('the created domain is queryable from the database', async () => {
      const { data, error } = await admin
        .from('allowed_signup_domains')
        .select('apex_domain')
        .eq('id', domainId)
        .single()

      expect(error).toBeNull()
      expect(data.apex_domain).toBe(testDomain)
    })
  })

  describe('DELETE', () => {
    it('removes the domain row from the database', async () => {
      const result = await deleteDomain(domainId)

      expect(result.error).toBeUndefined()
      expect(result.success).toBe(true)

      const { data } = await admin
        .from('allowed_signup_domains')
        .select('id')
        .eq('id', domainId)
        .maybeSingle()

      expect(data).toBeNull()
      createdIds = createdIds.filter((id) => id !== domainId)
    })
  })
})
