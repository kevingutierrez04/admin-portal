import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LLMModelResponsesPage({
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

  const { data: responses, error, count } = await supabase
    .from('llm_model_responses')
    .select(`
      *,
      llm_models(name),
      llm_prompt_chains(id, caption_request_id),
      humor_flavors(id)
    `, { count: 'exact' })
    .order('created_datetime_utc', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching LLM responses:', error)
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
          <h1 style={{ color: '#fff', fontSize: '1.8rem' }}>💬 LLM Model Responses</h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            View all LLM responses and prompts
          </p>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'inline-block',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Responses</div>
          <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
            {count?.toLocaleString('en-US') || 0}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {responses?.map((response: any) => (
            <div
              key={response.id}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: '#3b82f6',
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {response.llm_models?.name || 'Unknown Model'}
                  </span>
                  {response.humor_flavors && (
                    <span
                      style={{
                        background: '#8b5cf6',
                        color: '#fff',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                      }}
                    >
                      Flavor {response.humor_flavors.id}
                    </span>
                  )}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'right' }}>
                  {new Date(response.created_datetime_utc).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Prompt */}
              {response.llm_user_prompt && (
                <details style={{ marginBottom: '1rem' }}>
                  <summary
                    style={{
                      color: '#94a3b8',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    📝 User Prompt (click to expand)
                  </summary>
                  <div
                    style={{
                      background: '#000',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#cbd5e1',
                      fontSize: '0.95rem',
                      lineHeight: 1.8,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '300px',
                      overflow: 'auto',
                      marginTop: '0.5rem',
                    }}
                  >
                    {response.llm_user_prompt}
                  </div>
                </details>
              )}

              {/* Response */}
              {response.llm_response_text && (
                <div>
                  <div style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                    💬 Response:
                  </div>
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '1.25rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      color: '#fff',
                      fontSize: '1rem',
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap',
                      maxHeight: '400px',
                      overflow: 'auto',
                    }}
                  >
                    {response.llm_response_text}
                  </div>
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
                href={`/admin/llm-model-responses?page=${currentPage - 1}`}
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
                href={`/admin/llm-model-responses?page=${currentPage + 1}`}
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