/**
 * Factory that creates a fresh Supabase client mock for each test.
 * Callers override individual methods as needed.
 */

export type MockSupabaseClient = {
  auth: {
    getUser: jest.Mock
  }
  from: jest.Mock
  _chain: MockChain
}

export type MockChain = {
  select: jest.Mock
  insert: jest.Mock
  update: jest.Mock
  delete: jest.Mock
  eq: jest.Mock
  maybeSingle: jest.Mock
  single: jest.Mock
  order: jest.Mock
  limit: jest.Mock
  range: jest.Mock
  gt: jest.Mock
  head: jest.Mock
}

export function makeChain(overrides: Partial<MockChain> = {}): MockChain {
  const chain: MockChain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    single: jest.fn().mockResolvedValue({ data: { id: 1, name: 'test' }, error: null }),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    head: jest.fn().mockReturnThis(),
    ...overrides,
  }
  return chain
}

export function makeSupabase(
  user: object | null = { id: 'user-123', email: 'admin@test.com' },
  chain: Partial<MockChain> = {}
): MockSupabaseClient {
  const c = makeChain(chain)
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: jest.fn().mockReturnValue(c),
    _chain: c,
  }
}
