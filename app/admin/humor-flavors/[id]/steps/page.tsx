import { createClient } from '../../../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HumorFlavorStepsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch flavor details
  const { data: flavor } = await supabase
    .from('humor_flavors')
    .select('*')
    .eq('id', id)
    .single()

  // Fetch steps for this flavor
  const { data: steps, error } = await supabase
    .from('humor_flavor_steps')
    .select(`
      *,
      humor_flavor_step_types(slug, description),
      llm_models(name),
      llm_input_types(slug, description),
      llm_output_types(slug, description)
    `)
    .eq('humor_flavor_id', id)
    .order('order_by', { ascending: true })

  if (error) {
    console.error('Error fetching steps:', error)
  }

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
          }}
        >
          <Link
            href="/admin/humor-flavors"
            style={{
              color: '#cbd5e1',
              textDecoration: 'none',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              display: 'block',
            }}
          >
            ← Back to Humor Flavors
          </Link>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            ⚙️ Flavor Steps: {flavor?.slug}
          </h1>
          {flavor?.description && (
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
              {flavor.description}
            </p>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Steps List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {steps?.map((step: any, index: number) => (
            <div
              key={step.id}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                position: 'relative',
              }}
            >
              {/* Step Number */}
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '20px',
                  background: '#8b5cf6',
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                }}
              >
                Step {step.order_by}
              </div>

              {/* Step Header */}
              <div style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {step.description || step.humor_flavor_step_types?.slug || 'Unnamed Step'}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: '#3b82f6',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}
                  >
                    {step.llm_models?.name || 'No Model'}
                  </span>
                  <span
                    style={{
                      background: '#10b981',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}
                  >
                    {step.llm_input_types?.slug || 'Unknown Input'}
                  </span>
                  <span
                    style={{
                      background: '#f59e0b',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}
                  >
                    {step.llm_output_types?.slug || 'Unknown Output'}
                  </span>
                  {step.llm_temperature && (
                    <span
                      style={{
                        background: '#ef4444',
                        color: '#fff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Temp: {step.llm_temperature}
                    </span>
                  )}
                </div>
              </div>

              {/* Prompts */}
              <div style={{ display: 'grid', gap: '1rem' }}>
                {step.llm_system_prompt && (
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      System Prompt:
                    </div>
                    <div
                      style={{
                        background: '#000',
                        padding: '1rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {step.llm_system_prompt}
                    </div>
                  </div>
                )}

                {step.llm_user_prompt && (
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      User Prompt:
                    </div>
                    <div
                      style={{
                        background: '#000',
                        padding: '1rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {step.llm_user_prompt}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {steps && steps.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#64748b',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
            }}
          >
            No steps configured for this flavor
          </div>
        )}
      </main>
    </div>
  )
}