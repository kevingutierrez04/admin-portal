import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LLMPromptChainsPage({
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

  const { data: chains, error, count } = await supabase
    .from('llm_prompt_chains')
    .select(`
      *,
      caption_requests(id, image_id, profile_id)
    `, { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching prompt chains:', error)
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
          <h1 style={{ color: '#fff', fontSize: '1.8rem' }}>⛓️ LLM Prompt Chains</h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            View all prompt chain executions
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
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Chains</div>
          <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
            {count || 0}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {chains?.map((chain: any) => (
            <div
              key={chain.id}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Chain ID: {chain.id}
                  </h3>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    Created: {new Date(chain.created_datetime_utc).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                {chain.caption_requests && (
                  <Link
                    href={`/admin/caption-requests?id=${chain.caption_request_id}`}
                    style={{
                      background: '#3b82f6',
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      height: 'fit-content',
                    }}
                  >
                    View Request →
                  </Link>
                )}
              </div>

              {chain.caption_request_id && (
                <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                  Caption Request ID: {chain.caption_request_id}
                </div>
              )}
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
                href={`/admin/llm-prompt-chains?page=${currentPage - 1}`}
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
                href={`/admin/llm-prompt-chains?page=${currentPage + 1}`}
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