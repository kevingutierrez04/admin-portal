import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ModelsManager from './ModelsManager'

export default async function LLMModelsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: models, error: modelsError } = await supabase
    .from('llm_models')
    .select(`
      *,
      llm_providers(id, name)
    `)
    .order('created_datetime_utc', { ascending: false })

  const { data: providers, error: providersError } = await supabase
    .from('llm_providers')
    .select('*')
    .order('name', { ascending: true })

  if (modelsError) {
    console.error('Error fetching LLM models:', modelsError)
  }

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
          <h1 style={{ color: '#fff', fontSize: '1.8rem' }}>🧠 LLM Models</h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Manage AI models (GPT-4, Claude, etc.)
          </p>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <ModelsManager models={models || []} providers={providers || []} />
      </main>
    </div>
  )
}