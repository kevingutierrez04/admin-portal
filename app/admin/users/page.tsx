import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const currentPage = Number(params.page || '1')
  const pageSize = 20
  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1

  // Fetch users with pagination
  const { data: users, error: usersError, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .range(from, to)

  if (usersError) {
    console.error('Error fetching users:', usersError)
  }

  const totalPages = Math.ceil((count || 0) / pageSize)

  // Fetch counts for current page users only
  const usersWithCounts = await Promise.all(
    (users || []).map(async (user: any) => {
      const [
        { count: captionCount },
        { count: imageCount },
        { count: voteCount }
      ] = await Promise.all([
        supabase.from('captions').select('*', { count: 'exact', head: true }).eq('profile_id', user.id),
        supabase.from('images').select('*', { count: 'exact', head: true }).eq('profile_id', user.id),
        supabase.from('caption_votes').select('*', { count: 'exact', head: true }).eq('profile_id', user.id),
      ])

      return {
        ...user,
        captionCount: captionCount || 0,
        imageCount: imageCount || 0,
        voteCount: voteCount || 0,
      }
    })
  )

  const allUsersWithCounts = usersWithCounts

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          padding: '1.5rem 2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Link
              href="/"
              style={{
                color: '#cbd5e1',
                textDecoration: 'none',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                display: 'block',
              }}
            >
              ← Back to Dashboard
            </Link>
            <h1 style={{ color: '#fff', fontSize: '1.8rem' }}>👥 User Management</h1>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Stats Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Users</div>
            <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
              {count || 0}
            </div>
          </div>
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Superadmins</div>
            <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
              {allUsersWithCounts?.filter((u) => u.is_superadmin).length || 0}
            </div>
          </div>
          <div
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Active in Study (Page)</div>
            <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
              {allUsersWithCounts?.filter((u) => u.is_in_study).length || 0}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <th
                    style={{
                      color: '#94a3b8',
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      color: '#94a3b8',
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      color: '#94a3b8',
                      padding: '1rem',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                    }}
                  >
                    Captions
                  </th>
                  <th
                    style={{
                      color: '#94a3b8',
                      padding: '1rem',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                    }}
                  >
                    Images
                  </th>
                  <th
                    style={{
                      color: '#94a3b8',
                      padding: '1rem',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                    }}
                  >
                    Votes
                  </th>
                  <th
                    style={{
                      color: '#94a3b8',
                      padding: '1rem',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      color: '#94a3b8',
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                    }}
                  >
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {allUsersWithCounts?.map((user: any) => (
                  <tr
                    key={user.id}
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <td style={{ color: '#fff', padding: '1rem' }}>{user.email}</td>
                    <td style={{ color: '#cbd5e1', padding: '1rem' }}>
                      {user.first_name || user.last_name
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : '-'}
                    </td>
                    <td style={{ color: '#cbd5e1', padding: '1rem', textAlign: 'center' }}>
                      {user.captionCount}
                    </td>
                    <td style={{ color: '#cbd5e1', padding: '1rem', textAlign: 'center' }}>
                      {user.imageCount}
                    </td>
                    <td style={{ color: '#cbd5e1', padding: '1rem', textAlign: 'center' }}>
                      {user.voteCount}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {user.is_superadmin && (
                          <span
                            style={{
                              background: '#3b82f6',
                              color: '#fff',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                            }}
                          >
                            ADMIN
                          </span>
                        )}
                        {user.is_in_study && (
                          <span
                            style={{
                              background: '#10b981',
                              color: '#fff',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                            }}
                          >
                            STUDY
                          </span>
                        )}
                        {user.is_matrix_admin && (
                          <span
                            style={{
                              background: '#8b5cf6',
                              color: '#fff',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                            }}
                          >
                            MATRIX
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: '#94a3b8', padding: '1rem', fontSize: '0.85rem' }}>
                      {user.created_datetime_utc
                        ? new Date(user.created_datetime_utc).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              alignItems: 'center',
              marginTop: '2rem',
            }}
          >
            {currentPage > 1 && (
              <Link
                href={`/admin/users?page=${currentPage - 1}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                ← Previous
              </Link>
            )}
            <span style={{ color: '#94a3b8', padding: '0 1rem' }}>
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/admin/users?page=${currentPage + 1}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}