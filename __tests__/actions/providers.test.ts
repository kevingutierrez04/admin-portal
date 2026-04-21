import { makeSupabase, makeChain } from '../setup/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

let mockSupabase: ReturnType<typeof makeSupabase>

jest.mock('../../app/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}))

import { createProvider, updateProvider, deleteProvider } from '../../app/admin/llm-providers/actions'
import { revalidatePath } from 'next/cache'

const mockUser = { id: 'user-abc', email: 'admin@test.com' }

describe('LLM Provider Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createProvider', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase = makeSupabase(null)
      const fd = new FormData()
      fd.append('name', 'OpenAI')
      expect(await createProvider(fd)).toEqual({ error: 'Not authenticated' })
    })

    it('creates provider and revalidates path', async () => {
      const provider = { id: 1, name: 'OpenAI' }
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: provider, error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('name', 'OpenAI')
      const result = await createProvider(fd)

      expect(result).toEqual({ success: true, data: provider })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/llm-providers')
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'OpenAI' })
      )
    })

    it('returns Supabase error on failure', async () => {
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: null, error: { message: 'unique violation' } }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('name', 'OpenAI')
      expect(await createProvider(fd)).toEqual({ error: 'unique violation' })
    })
  })

  describe('updateProvider', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase = makeSupabase(null)
      const fd = new FormData()
      fd.append('name', 'Anthropic')
      expect(await updateProvider(1, fd)).toEqual({ error: 'Not authenticated' })
    })

    it('updates provider and revalidates path', async () => {
      const updated = { id: 1, name: 'Anthropic' }
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: updated, error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('name', 'Anthropic')
      const result = await updateProvider(1, fd)

      expect(result).toEqual({ success: true, data: updated })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/llm-providers')
      expect(chain.eq).toHaveBeenCalledWith('id', 1)
    })
  })

  describe('deleteProvider', () => {
    it('deletes provider and revalidates path', async () => {
      const chain = makeChain({ eq: jest.fn().mockResolvedValue({ error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      expect(await deleteProvider(1)).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/llm-providers')
    })

    it('returns error on failure', async () => {
      const chain = makeChain({ eq: jest.fn().mockResolvedValue({ error: { message: 'constraint violation' } }) })
      mockSupabase = makeSupabase(mockUser, chain)

      expect(await deleteProvider(99)).toEqual({ error: 'constraint violation' })
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })
})
