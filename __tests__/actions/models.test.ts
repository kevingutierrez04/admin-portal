import { makeSupabase, makeChain } from '../setup/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

let mockSupabase: ReturnType<typeof makeSupabase>

jest.mock('../../app/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}))

import { createModel, updateModel, deleteModel } from '../../app/admin/llm-models/actions'
import { revalidatePath } from 'next/cache'

const mockUser = { id: 'user-abc', email: 'admin@test.com' }

describe('LLM Model Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createModel', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase = makeSupabase(null)
      const fd = new FormData()
      fd.append('name', 'GPT-4o')
      fd.append('provider_model_id', 'gpt-4o')
      fd.append('llm_provider_id', '1')
      expect(await createModel(fd)).toEqual({ error: 'Not authenticated' })
    })

    it('creates model and revalidates path', async () => {
      const model = { id: 1, name: 'GPT-4o', provider_model_id: 'gpt-4o', llm_provider_id: 1 }
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: model, error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('name', 'GPT-4o')
      fd.append('provider_model_id', 'gpt-4o')
      fd.append('llm_provider_id', '1')
      const result = await createModel(fd)

      expect(result).toEqual({ success: true, data: model })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/llm-models')
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'GPT-4o',
          provider_model_id: 'gpt-4o',
          llm_provider_id: 1,
        })
      )
    })

    it('returns error from Supabase on failure', async () => {
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: null, error: { message: 'fk violation' } }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('name', 'BadModel')
      fd.append('provider_model_id', 'x')
      fd.append('llm_provider_id', '9999')
      expect(await createModel(fd)).toEqual({ error: 'fk violation' })
    })
  })

  describe('updateModel', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase = makeSupabase(null)
      const fd = new FormData()
      fd.append('name', 'Claude')
      fd.append('provider_model_id', 'claude-3')
      fd.append('llm_provider_id', '2')
      expect(await updateModel(1, fd)).toEqual({ error: 'Not authenticated' })
    })

    it('updates model and revalidates path', async () => {
      const updated = { id: 1, name: 'Claude 3.5' }
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: updated, error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('name', 'Claude 3.5')
      fd.append('provider_model_id', 'claude-3-5')
      fd.append('llm_provider_id', '2')
      const result = await updateModel(1, fd)

      expect(result).toEqual({ success: true, data: updated })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/llm-models')
      expect(chain.eq).toHaveBeenCalledWith('id', 1)
    })
  })

  describe('deleteModel', () => {
    it('deletes model and revalidates path', async () => {
      const chain = makeChain({ eq: jest.fn().mockResolvedValue({ error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      expect(await deleteModel(1)).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/llm-models')
    })

    it('returns error on failure', async () => {
      const chain = makeChain({ eq: jest.fn().mockResolvedValue({ error: { message: 'model in use' } }) })
      mockSupabase = makeSupabase(mockUser, chain)

      expect(await deleteModel(1)).toEqual({ error: 'model in use' })
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })
})
