/**
 * Integration tests — LLM Providers + LLM Models CRUD
 *
 * Tests providers first, then creates a model linked to the test provider.
 * All rows are tagged with TEST_MARKER and deleted in afterAll.
 */

import * as dotenv from 'dotenv'
dotenv.config()

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

import { getAdminClient, getTestUserId, TEST_MARKER } from './setup'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createReal } from '@supabase/supabase-js'

let testUserId: string
let admin: SupabaseClient
let createdProviderIds: number[] = []
let createdModelIds: number[] = []

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

import { createProvider, updateProvider, deleteProvider } from '../../app/admin/llm-providers/actions'
import { createModel, updateModel, deleteModel } from '../../app/admin/llm-models/actions'

beforeAll(async () => {
  admin = getAdminClient()
  testUserId = await getTestUserId()
})

afterAll(async () => {
  if (createdModelIds.length > 0) {
    await admin.from('llm_models').delete().in('id', createdModelIds)
  }
  if (createdProviderIds.length > 0) {
    await admin.from('llm_providers').delete().in('id', createdProviderIds)
  }
})

describe('LLM Providers — integration (real DB)', () => {
  let providerId: number

  describe('CREATE', () => {
    it('inserts a new provider row', async () => {
      const fd = new FormData()
      fd.append('name', `${TEST_MARKER} Provider`)

      const result = await createProvider(fd)

      expect(result.error).toBeUndefined()
      expect(result.success).toBe(true)

      providerId = result.data!.id
      createdProviderIds.push(providerId)

      const { data, error } = await admin.from('llm_providers').select('*').eq('id', providerId).single()
      expect(error).toBeNull()
      expect(data.name).toBe(`${TEST_MARKER} Provider`)
    })
  })

  describe('UPDATE', () => {
    it('updates the provider name in the database', async () => {
      expect(providerId).toBeDefined()

      const fd = new FormData()
      fd.append('name', `${TEST_MARKER} Provider UPDATED`)

      const result = await updateProvider(providerId, fd)

      expect(result.error).toBeUndefined()
      expect(result.success).toBe(true)

      const { data } = await admin.from('llm_providers').select('name').eq('id', providerId).single()
      expect(data.name).toBe(`${TEST_MARKER} Provider UPDATED`)
    })
  })

  describe('DELETE', () => {
    it('removes the provider row from the database', async () => {
      expect(providerId).toBeDefined()

      const result = await deleteProvider(providerId)

      expect(result.error).toBeUndefined()
      expect(result.success).toBe(true)

      const { data } = await admin.from('llm_providers').select('id').eq('id', providerId).maybeSingle()
      expect(data).toBeNull()

      createdProviderIds = createdProviderIds.filter((id) => id !== providerId)
    })
  })
})

describe('LLM Models — integration (real DB)', () => {
  let providerId: number
  let modelId: number

  beforeAll(async () => {
    // Create a throw-away provider to link the model to
    const { data } = await admin
      .from('llm_providers')
      .insert({ name: `${TEST_MARKER} ProviderForModel`, created_by_user_id: testUserId, modified_by_user_id: testUserId })
      .select()
      .single()
    providerId = data!.id
    createdProviderIds.push(providerId)
  })

  describe('CREATE', () => {
    it('inserts a new model row linked to the test provider', async () => {
      const fd = new FormData()
      fd.append('name', `${TEST_MARKER} Model`)
      fd.append('provider_model_id', `${TEST_MARKER}-model-id`)
      fd.append('llm_provider_id', String(providerId))

      const result = await createModel(fd)

      expect(result.error).toBeUndefined()
      expect(result.success).toBe(true)

      modelId = result.data!.id
      createdModelIds.push(modelId)

      const { data, error } = await admin.from('llm_models').select('*').eq('id', modelId).single()
      expect(error).toBeNull()
      expect(data.name).toBe(`${TEST_MARKER} Model`)
      expect(data.llm_provider_id).toBe(providerId)
    })
  })

  describe('UPDATE', () => {
    it('updates the model name and provider_model_id', async () => {
      expect(modelId).toBeDefined()

      const fd = new FormData()
      fd.append('name', `${TEST_MARKER} Model UPDATED`)
      fd.append('provider_model_id', `${TEST_MARKER}-model-id-updated`)
      fd.append('llm_provider_id', String(providerId))

      const result = await updateModel(modelId, fd)

      expect(result.error).toBeUndefined()
      expect(result.success).toBe(true)

      const { data } = await admin.from('llm_models').select('name, provider_model_id').eq('id', modelId).single()
      expect(data.name).toBe(`${TEST_MARKER} Model UPDATED`)
      expect(data.provider_model_id).toBe(`${TEST_MARKER}-model-id-updated`)
    })
  })

  describe('DELETE', () => {
    it('removes the model row from the database', async () => {
      expect(modelId).toBeDefined()

      const result = await deleteModel(modelId)

      expect(result.error).toBeUndefined()
      expect(result.success).toBe(true)

      const { data } = await admin.from('llm_models').select('id').eq('id', modelId).maybeSingle()
      expect(data).toBeNull()

      createdModelIds = createdModelIds.filter((id) => id !== modelId)
    })
  })
})
