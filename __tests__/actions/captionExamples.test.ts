import { makeSupabase, makeChain } from '../setup/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

let mockSupabase: ReturnType<typeof makeSupabase>

jest.mock('../../app/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}))

import {
  createCaptionExample,
  updateCaptionExample,
  deleteCaptionExample,
} from '../../app/admin/caption-examples/actions'
import { revalidatePath } from 'next/cache'

const mockUser = { id: 'user-abc', email: 'admin@test.com' }

describe('Caption Examples Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createCaptionExample', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase = makeSupabase(null)
      const fd = new FormData()
      fd.append('image_description', 'A cat on a chair')
      fd.append('caption', 'Chairman meow')
      fd.append('explanation', 'Pun on chairman')
      fd.append('priority', '1')
      expect(await createCaptionExample(fd)).toEqual({ error: 'Not authenticated' })
    })

    it('creates example and revalidates path', async () => {
      const example = { id: 1, caption: 'Chairman meow', priority: 1 }
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: example, error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('image_description', 'A cat on a chair')
      fd.append('caption', 'Chairman meow')
      fd.append('explanation', 'Pun on chairman')
      fd.append('priority', '1')

      const result = await createCaptionExample(fd)
      expect(result).toEqual({ success: true, data: example })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/caption-examples')
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: 'Chairman meow',
          priority: 1,
        })
      )
    })

    it('defaults priority to 0 when missing', async () => {
      const example = { id: 2, caption: 'Test', priority: 0 }
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: example, error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('image_description', 'desc')
      fd.append('caption', 'Test')
      fd.append('explanation', '')
      fd.append('priority', 'NaN')

      await createCaptionExample(fd)
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 0 })
      )
    })
  })

  describe('updateCaptionExample', () => {
    it('updates example and revalidates path', async () => {
      const updated = { id: 1, caption: 'Updated caption' }
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: updated, error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('image_description', 'Updated desc')
      fd.append('caption', 'Updated caption')
      fd.append('explanation', 'New explanation')
      fd.append('priority', '5')

      const result = await updateCaptionExample(1, fd)
      expect(result).toEqual({ success: true, data: updated })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/caption-examples')
    })
  })

  describe('deleteCaptionExample', () => {
    it('deletes example and revalidates path', async () => {
      const chain = makeChain({ eq: jest.fn().mockResolvedValue({ error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      expect(await deleteCaptionExample(1)).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/caption-examples')
    })
  })
})
