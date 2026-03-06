import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CaptionsPage({
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
  const pageSize = 50
  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1

  // Fetch captions with related data
  const { data: captions, count } = await supabase
    .from('captions')
    .select(
      `
      *,
      profiles(email),
      images(url, image_description),
      caption_votes(count)
    `,
      { count: 'exact' }
    )
    .order('created_datetime_utc', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count || 0) / pageSize)

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
            <h1 style={{ color: '#fff', fontSize: '1.8rem' }}>💬 Caption Browser</h1>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Stats */}
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
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Captions</div>
            <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
              {count?.toLocaleString() || 0}
            </div>
          </div>
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Public Captions</div>
            <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
              {captions?.filter((c) => c.is_public).length || 0}
            </div>
          </div>
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Featured Captions</div>
            <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
              {captions?.filter((c) => c.is_featured).length || 0}
            </div>
          </div>
        </div>

        {/* Captions Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {captions?.map((caption: any) => (
            <div
              key={caption.id}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {caption.images?.url && (
                <div
                  style={{
                    width: '100%',
                    height: '200px',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={caption.images.url}
                    alt={caption.images.image_description || 'Image'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              )}
              <div style={{ padding: '1.25rem' }}>
                <p
                  style={{
                    color: '#fff',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    marginBottom: '1rem',
                  }}
                >
                  "{caption.content}"
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {caption.is_public && (
                    <span
                      style={{
                        background: '#10b981',
                        color: '#fff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                      }}
                    >
                      PUBLIC
                    </span>
                  )}
                  {caption.is_featured && (
                    <span
                      style={{
                        background: '#f59e0b',
                        color: '#fff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                      }}
                    >
                      ⭐ FEATURED
                    </span>
                  )}
                  <span
                    style={{
                      background: '#3b82f6',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {caption.caption_votes?.[0]?.count || 0} votes
                  </span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  by {caption.profiles?.email || 'Unknown'} •{' '}
                  {new Date(caption.created_datetime_utc).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            {currentPage > 1 && (
              <Link
                href={`/admin/captions?page=${currentPage - 1}`}
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
                href={`/admin/captions?page=${currentPage + 1}`}
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
