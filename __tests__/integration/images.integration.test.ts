/**
 * Integration tests — Images CRUD
 *
 * Mocks only auth (we have no test user credentials).
 * All DB calls go to the real Supabase dev database.
 * Every row created is tagged with TEST_MARKER and deleted in afterAll.
 */

import * as dotenv from 'dotenv'
dotenv.config()

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

import { getAdminClient, getTestUserId, TEST_MARKER } from './setup'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createReal } from '@supabase/supabase-js'

let testUserId: string
let admin: SupabaseClient
let createdIds: string[] = []

// Replace the server Supabase client with a real one that has auth mocked
jest.mock('../../app/lib/supabase/server', () => ({
  createClient: jest.fn(() => {
    const client = createReal(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
    // Inject our test user so auth guards pass
    client.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: testUserId, email: 'integration@test.local' } },
      error: null,
    })
    return Promise.resolve(client)
  }),
}))

import { createImage, updateImage, deleteImage } from '../../app/admin/images/actions'

beforeAll(async () => {
  admin = getAdminClient()
  testUserId = await getTestUserId()
})

afterAll(async () => {
  // Safety net: delete any test rows that weren't cleaned up mid-test
  if (createdIds.length > 0) {
    await admin.from('images').delete().in('id', createdIds)
  }
})

describe('Images — integration (real DB)', () => {
  const testUrl = `https://example.com/${TEST_MARKER}-image.jpg`

  describe('CREATE', () => {
    it('inserts a new image row into the database', async () => {
      const fd = new FormData()
      fd.append('url', testUrl)
      fd.append('description', `${TEST_MARKER} description`)
      fd.append('is_public', 'true')
      fd.append('is_common_use', 'false')

      const result = await createImage(fd)

      expect(result.error).toBeUndefined()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()

      const id = result.data!.id
      createdIds.push(id)

      // Verify the row actually exists in the DB
      const { data, error } = await admin.from('images').select('*').eq('id', id).single()
      expect(error).toBeNull()
      expect(data.url).toBe(testUrl)
      expect(data.is_public).toBe(true)
      expect(data.is_common_use).toBe(false)
      expect(data.image_description).toBe(`${TEST_MARKER} description`)
    })
  })

  describe('READ', () => {
    it('created image is queryable by the admin client', async () => {
      // Re-use the last created id
      const id = createdIds[createdIds.length - 1]
      expect(id).toBeDefined()

      const { data, error } = await admin.from('images').select('*').eq('id', id).single()
      expect(error).toBeNull()
      expect(data.url).toBe(testUrl)
    })
  })

  describe('UPDATE', () => {
    it('updates image description and is_common_use in the database', async () => {
      const id = createdIds[createdIds.length - 1]
      expect(id).toBeDefined()

      const fd = new FormData()
      fd.append('url', testUrl)
      fd.append('description', `${TEST_MARKER} UPDATED`)
      fd.append('is_public', 'true')
      fd.append('is_common_use', 'true')

      const result = await updateImage(id, fd)

      expect(result.error).toBeUndefined()
      expect(result.success).toBe(true)

      // Verify the change persisted in the DB
      const { data } = await admin.from('images').select('*').eq('id', id).single()
      expect(data.image_description).toBe(`${TEST_MARKER} UPDATED`)
      expect(data.is_common_use).toBe(true)
    })
  })

  describe('DELETE', () => {
    it('removes the image row from the database', async () => {
      const id = createdIds[createdIds.length - 1]
      expect(id).toBeDefined()

      const result = await deleteImage(id)

      expect(result.error).toBeUndefined()
      expect(result.success).toBe(true)

      // Verify the row is gone
      const { data } = await admin.from('images').select('id').eq('id', id).maybeSingle()
      expect(data).toBeNull()

      // Remove from cleanup list since it's already deleted
      createdIds = createdIds.filter((i) => i !== id)
    })
  })
})
