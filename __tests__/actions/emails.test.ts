import { makeSupabase, makeChain } from '../setup/supabaseMock'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

let mockSupabase: ReturnType<typeof makeSupabase>

jest.mock('../../app/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}))

import { createWhitelistedEmail, deleteWhitelistedEmail } from '../../app/admin/whitelisted-emails/actions'
import { revalidatePath } from 'next/cache'

const mockUser = { id: 'user-abc', email: 'admin@test.com' }

describe('Whitelisted Emails Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createWhitelistedEmail', () => {
    it('returns error when not authenticated', async () => {
      mockSupabase = makeSupabase(null)
      const fd = new FormData()
      fd.append('email_address', 'test@example.com')
      expect(await createWhitelistedEmail(fd)).toEqual({ error: 'Not authenticated' })
    })

    it('creates whitelisted email and revalidates path', async () => {
      const entry = { id: 1, email_address: 'test@example.com' }
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: entry, error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('email_address', 'test@example.com')
      const result = await createWhitelistedEmail(fd)

      expect(result).toEqual({ success: true, data: entry })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/whitelisted-emails')
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ email_address: 'test@example.com' })
      )
    })

    it('returns Supabase error on failure', async () => {
      const chain = makeChain({ single: jest.fn().mockResolvedValue({ data: null, error: { message: 'duplicate email' } }) })
      mockSupabase = makeSupabase(mockUser, chain)

      const fd = new FormData()
      fd.append('email_address', 'dup@example.com')
      expect(await createWhitelistedEmail(fd)).toEqual({ error: 'duplicate email' })
    })
  })

  describe('deleteWhitelistedEmail', () => {
    it('deletes email and revalidates path', async () => {
      const chain = makeChain({ eq: jest.fn().mockResolvedValue({ error: null }) })
      mockSupabase = makeSupabase(mockUser, chain)

      expect(await deleteWhitelistedEmail(1)).toEqual({ success: true })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/whitelisted-emails')
    })

    it('returns error on failure', async () => {
      const chain = makeChain({ eq: jest.fn().mockResolvedValue({ error: { message: 'record not found' } }) })
      mockSupabase = makeSupabase(mockUser, chain)

      expect(await deleteWhitelistedEmail(999)).toEqual({ error: 'record not found' })
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })
})
