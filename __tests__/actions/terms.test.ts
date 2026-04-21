import { makeSupabase, makeChain } from '../setup/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

let mockSupabase: ReturnType<typeof makeSupabase>

jest.mock('../../app/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}))

import { createTerm, updateTerm, deleteTerm } from '../../app/admin/terms/actions'
import { revalidatePath } from 'next/cache'

const mockUser = { id: 'user-abc', email: 'admin@test.com' }

describe('Terms Dictionary Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createTerm', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase = makeSupabase(null)
      const fd = new FormData()
      fd.append('term', 'sarcasm')
      fd.append('definition', 'a form of humor')
      fd.append('example', 'Nice work...')
      fd.append('term_type_id', '1')
      expect(await createTerm(fd)).toEqual({ error: 'Not authenticated' })
    })

    it('creates term and revalidates path', async () => {
      const term = { id: 1, term: 'sarcasm', definition: 'a form of humor' }
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: term, error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('term', 'sarcasm')
      fd.append('definition', 'a form of humor')
      fd.append('example', 'Nice work...')
      fd.append('term_type_id', '1')

      const result = await createTerm(fd)
      expect(result).toEqual({ success: true, data: term })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/terms')
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ term: 'sarcasm', term_type_id: 1 })
      )
    })
  })

  describe('updateTerm', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase = makeSupabase(null)
      const fd = new FormData()
      fd.append('term', 'irony')
      fd.append('definition', 'opposite of what is expected')
      fd.append('example', '')
      fd.append('term_type_id', '1')
      expect(await updateTerm(1, fd)).toEqual({ error: 'Not authenticated' })
    })

    it('updates term and revalidates path', async () => {
      const updated = { id: 1, term: 'irony' }
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: updated, error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('term', 'irony')
      fd.append('definition', 'opposite of what is expected')
      fd.append('example', 'It rained on his wedding day')
      fd.append('term_type_id', '2')

      const result = await updateTerm(1, fd)
      expect(result).toEqual({ success: true, data: updated })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/terms')
      expect(chain.eq).toHaveBeenCalledWith('id', 1)
    })

    it('returns error on Supabase failure', async () => {
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('term', 'x')
      fd.append('definition', 'y')
      fd.append('example', '')
      fd.append('term_type_id', '1')

      expect(await updateTerm(999, fd)).toEqual({ error: 'not found' })
    })
  })

  describe('deleteTerm', () => {
    it('deletes term and revalidates path', async () => {
      const chain = makeChain({ eq: jest.fn().mockResolvedValue({ error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      expect(await deleteTerm(1)).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/terms')
    })

    it('returns error on failure', async () => {
      const chain = makeChain({ eq: jest.fn().mockResolvedValue({ error: { message: 'deletion blocked' } }) })
      mockSupabase = makeSupabase(mockUser, chain)

      expect(await deleteTerm(99)).toEqual({ error: 'deletion blocked' })
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })
})
