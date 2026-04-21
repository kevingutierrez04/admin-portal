import { makeSupabase, makeChain } from '../setup/supabaseMock'

// Mock next/cache before importing actions
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

let mockSupabase: ReturnType<typeof makeSupabase>

jest.mock('../../app/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}))

import { createImage, updateImage, deleteImage } from '../../app/admin/images/actions'
import { revalidatePath } from 'next/cache'

const mockUser = { id: 'user-abc', email: 'admin@test.com' }

describe('Image Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── createImage ─────────────────────────────────────────────────────────────

  describe('createImage', () => {
    it('returns error when user is not authenticated', async () => {
      mockSupabase = makeSupabase(null)

      const fd = new FormData()
      fd.append('url', 'https://example.com/img.jpg')
      fd.append('description', 'Test image')
      fd.append('is_public', 'false')
      fd.append('is_common_use', 'false')

      const result = await createImage(fd)
      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('inserts image and revalidates path on success', async () => {
      const inserted = {
        id: 'img-1',
        url: 'https://example.com/img.jpg',
        image_description: 'A test image',
        is_public: true,
        is_common_use: false,
        profile_id: mockUser.id,
      }
      const chain = makeChain({
        single: jest.fn().mockResolvedValue({ data: inserted, error: null }),
      })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('url', 'https://example.com/img.jpg')
      fd.append('description', 'A test image')
      fd.append('is_public', 'true')
      fd.append('is_common_use', 'false')

      const result = await createImage(fd)

      expect(result).toEqual({ success: true, data: inserted })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/images')
      expect(mockSupabase.from).toHaveBeenCalledWith('images')
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://example.com/img.jpg',
          image_description: 'A test image',
          is_public: true,
          is_common_use: false,
        })
      )
    })

    it('returns error from Supabase on insert failure', async () => {
      const chain = makeChain({
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'duplicate key' } }),
      })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('url', 'https://example.com/dup.jpg')
      fd.append('description', '')
      fd.append('is_public', 'false')
      fd.append('is_common_use', 'false')

      const result = await createImage(fd)
      expect(result).toEqual({ error: 'duplicate key' })
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })

  // ── updateImage ──────────────────────────────────────────────────────────────

  describe('updateImage', () => {
    it('returns error when user is not authenticated', async () => {
      mockSupabase = makeSupabase(null)

      const fd = new FormData()
      fd.append('url', 'https://example.com/updated.jpg')
      fd.append('description', 'Updated')
      fd.append('is_public', 'true')
      fd.append('is_common_use', 'false')

      const result = await updateImage('img-1', fd)
      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('updates image and revalidates path on success', async () => {
      const updated = { id: 'img-1', url: 'https://example.com/updated.jpg' }
      const chain = makeChain({
        single: jest.fn().mockResolvedValue({ data: updated, error: null }),
      })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('url', 'https://example.com/updated.jpg')
      fd.append('description', 'Updated desc')
      fd.append('is_public', 'true')
      fd.append('is_common_use', 'true')

      const result = await updateImage('img-1', fd)

      expect(result).toEqual({ success: true, data: updated })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/images')
      expect(chain.eq).toHaveBeenCalledWith('id', 'img-1')
    })
  })

  // ── deleteImage ──────────────────────────────────────────────────────────────

  describe('deleteImage', () => {
    it('deletes image and revalidates path on success', async () => {
      const chain = makeChain({
        eq: jest.fn().mockResolvedValue({ error: null }),
      })
      mockSupabase = makeSupabase(mockUser, chain)

      const result = await deleteImage('img-1')

      expect(result).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/images')
      expect(mockSupabase.from).toHaveBeenCalledWith('images')
    })

    it('returns error from Supabase on delete failure', async () => {
      const chain = makeChain({
        eq: jest.fn().mockResolvedValue({ error: { message: 'foreign key violation' } }),
      })
      mockSupabase = makeSupabase(mockUser, chain)

      const result = await deleteImage('img-bad')
      expect(result).toEqual({ error: 'foreign key violation' })
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })
})
