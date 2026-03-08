import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CaptionRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; id?: string }>
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
  const searchId = params.id
  const pageSize = 20
  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('caption_requests')
    .select(`
      *,
      profiles(email),
      images(url, image_description)
    `, { count: 'exact' })

  if (searchId) {
    query = query.eq('id', searchId)
  }

  const { data: requests, error, count } = await query
    .order('created_datetime_utc', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching caption requests:', error)
  }

  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <header
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          padding: '1.5rem 2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
          <h1 style={{ color: '#fff', fontSize: '1.8rem' }}>📋 Caption Requests</h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            View all caption generation requests
          </p>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'inline-block',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Requests</div>
          <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
            {count?.toLocaleString('en-US') || 0}
          </div>
        </div>

        {searchId && (
          <div style={{ marginBottom: '1rem' }}>
            <Link
              href="/admin/caption-requests"
              style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              ← Show all requests
            </Link>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {requests?.map((request: any) => (
            <div
              key={request.id}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  Request ID: {request.id}
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {request.profiles?.email || 'Unknown User'}
                </h3>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  {new Date(request.created_datetime_utc).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {request.images && (
                <div style={{ marginBottom: '1rem' }}>
                  {request.images.url && (
                    <img
                      src={request.images.url}
                      alt="Request image"
                      style={{
                        width: '100%',
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                      }}
                    />
                  )}
                  {request.images.image_description && (
                    <div
                      style={{
                        color: '#cbd5e1',
                        fontSize: '0.85rem',
                        fontStyle: 'italic',
                      }}
                    >
                      {request.images.image_description}
                    </div>
                  )}
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <div style={{ color: '#64748b' }}>Image ID:</div>
                  <div style={{ color: '#fff' }}>{request.image_id}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b' }}>Profile ID:</div>
                  <div style={{ color: '#fff' }}>{request.profile_id?.slice(0, 8)}...</div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
                href={`/admin/caption-requests?page=${currentPage - 1}`}
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
                href={`/admin/caption-requests?page=${currentPage + 1}`}
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