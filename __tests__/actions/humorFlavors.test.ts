import { makeSupabase, makeChain } from '../setup/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

let mockSupabase: ReturnType<typeof makeSupabase>

jest.mock('../../app/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}))

import { duplicateFlavor } from '../../app/admin/humor-flavors/actions'
import { revalidatePath } from 'next/cache'

const mockUser = { id: 'user-abc', email: 'admin@test.com' }

describe('Humor Flavor Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('duplicateFlavor', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase = makeSupabase(null)
      expect(await duplicateFlavor(1, 'new-slug')).toEqual({ error: 'Not authenticated' })
    })

    it('returns error when original flavor not found', async () => {
      // First .from call (fetch original) returns null
      let callCount = 0
      const supabase = {
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) },
        from: jest.fn().mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            // Fetching original flavor
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
            }
          }
          return makeChain()
        }),
        _chain: makeChain(),
      }
      mockSupabase = supabase as unknown as ReturnType<typeof makeSupabase>

      expect(await duplicateFlavor(999, 'new-slug')).toEqual({ error: 'Flavor not found' })
    })

    it('returns error when slug already exists', async () => {
      let callCount = 0
      const supabase = {
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) },
        from: jest.fn().mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            // Fetch original flavor — success
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { id: 1, slug: 'original', description: null }, error: null }),
            }
          }
          if (callCount === 2) {
            // Check slug uniqueness — existing found
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              maybeSingle: jest.fn().mockResolvedValue({ data: { id: 5 }, error: null }),
            }
          }
          return makeChain()
        }),
        _chain: makeChain(),
      }
      mockSupabase = supabase as unknown as ReturnType<typeof makeSupabase>

      expect(await duplicateFlavor(1, 'original')).toEqual({
        error: 'A flavor with that slug already exists',
      })
    })

    it('duplicates flavor with steps and revalidates path', async () => {
      const originalFlavor = { id: 1, slug: 'original', description: 'Funny', is_pinned: false }
      const newFlavor = { id: 2, slug: 'original-copy', description: 'Funny', is_pinned: false }
      const steps = [
        { order_by: 1, humor_flavor_step_type_id: 1, llm_model_id: 1, llm_input_type_id: 1, llm_output_type_id: 1, llm_temperature: 0.7, llm_system_prompt: 'sys', llm_user_prompt: 'usr', description: 'Step 1' },
      ]

      let callCount = 0
      const supabase = {
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) },
        from: jest.fn().mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            // Fetch original
            return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: originalFlavor, error: null }) }
          }
          if (callCount === 2) {
            // Check slug — none found
            return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }) }
          }
          if (callCount === 3) {
            // Insert new flavor
            return { select: jest.fn().mockReturnThis(), insert: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: newFlavor, error: null }) }
          }
          if (callCount === 4) {
            // Fetch steps
            return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), order: jest.fn().mockResolvedValue({ data: steps, error: null }) }
          }
          if (callCount === 5) {
            // Insert steps
            return { insert: jest.fn().mockResolvedValue({ error: null }) }
          }
          return makeChain()
        }),
        _chain: makeChain(),
      }
      mockSupabase = supabase as unknown as ReturnType<typeof makeSupabase>

      const result = await duplicateFlavor(1, 'original-copy')

      expect(result).toEqual({ success: true, data: newFlavor, stepsCopied: 1 })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/humor-flavors')
    })
  })
})
