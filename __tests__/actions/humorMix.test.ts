import { makeSupabase, makeChain } from '../setup/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

let mockSupabase: ReturnType<typeof makeSupabase>

jest.mock('../../app/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}))

import { updateHumorMix } from '../../app/admin/humor-mix/actions'
import { revalidatePath } from 'next/cache'

const mockUser = { id: 'user-abc', email: 'admin@test.com' }

describe('Humor Mix Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateHumorMix', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase = makeSupabase(null)
      expect(await updateHumorMix(1, 3)).toEqual({ error: 'Not authenticated' })
    })

    it('updates mix caption count and revalidates path', async () => {
      const updated = { id: 1, caption_count: 3 }
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: updated, error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const result = await updateHumorMix(1, 3)

      expect(result).toEqual({ success: true, data: updated })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/humor-mix')
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ caption_count: 3 })
      )
      expect(chain.eq).toHaveBeenCalledWith('id', 1)
    })

    it('returns error from Supabase on failure', async () => {
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: null, error: { message: 'row not found' } }) })
      mockSupabase = makeSupabase(mockUser, chain)

      expect(await updateHumorMix(999, 5)).toEqual({ error: 'row not found' })
      expect(revalidatePath).not.toHaveBeenCalled()
    })

    it('updates to zero caption count', async () => {
      const updated = { id: 2, caption_count: 0 }
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: updated, error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const result = await updateHumorMix(2, 0)
      expect(result).toEqual({ success: true, data: updated })
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ caption_count: 0 })
      )
    })
  })
})
