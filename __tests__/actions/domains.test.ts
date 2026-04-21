import { makeSupabase, makeChain } from '../setup/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

let mockSupabase: ReturnType<typeof makeSupabase>

jest.mock('../../app/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}))

import { createDomain, deleteDomain } from '../../app/admin/allowed-domains/actions'
import { revalidatePath } from 'next/cache'

const mockUser = { id: 'user-abc', email: 'admin@test.com' }

describe('Allowed Domains Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createDomain', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase = makeSupabase(null)
      const fd = new FormData()
      fd.append('apex_domain', 'example.com')
      expect(await createDomain(fd)).toEqual({ error: 'Not authenticated' })
    })

    it('creates domain and revalidates path', async () => {
      const domain = { id: 1, apex_domain: 'example.com' }
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: domain, error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('apex_domain', 'example.com')
      const result = await createDomain(fd)

      expect(result).toEqual({ success: true, data: domain })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/allowed-domains')
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ apex_domain: 'example.com' })
      )
    })

    it('returns Supabase error on failure', async () => {
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: null, error: { message: 'unique violation' } }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('apex_domain', 'duplicate.com')
      expect(await createDomain(fd)).toEqual({ error: 'unique violation' })
    })
  })

  describe('deleteDomain', () => {
    it('deletes domain and revalidates path', async () => {
      const chain = makeChain({ eq: jest.fn().mockResolvedValue({ error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      expect(await deleteDomain(1)).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/allowed-domains')
    })

    it('returns error on failure', async () => {
      const chain = makeChain({ eq: jest.fn().mockResolvedValue({ error: { message: 'not found' } }) })
      mockSupabase = makeSupabase(mockUser, chain)

      expect(await deleteDomain(999)).toEqual({ error: 'not found' })
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })
})
