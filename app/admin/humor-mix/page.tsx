import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HumorMixManager from './HumorMixManager'

export default async function HumorMixPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch humor mix with flavor details
  const { data: mixItems, error } = await supabase
    .from('humor_flavor_mix')
    .select(`
      *,
      humor_flavors(id, slug, description)
    `)
    .order('created_datetime_utc', { ascending: false })

  if (error) {
    console.error('Error fetching humor mix:', error)
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
            <h1 style={{ color: '#fff', fontSize: '1.8rem' }}>🎲 Humor Mix Configuration</h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Configure how many captions to generate per flavor
            </p>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <HumorMixManager mixItems={mixItems || []} />
      </main>
    </div>
  )
}