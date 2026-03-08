import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HumorFlavorsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all humor flavors
  const { data: flavors, error } = await supabase
    .from('humor_flavors')
    .select('*')
    .order('created_datetime_utc', { ascending: false })

  if (error) {
    console.error('Error fetching humor flavors:', error)
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
            <h1 style={{ color: '#fff', fontSize: '1.8rem' }}>🎭 Humor Flavors</h1>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Stats */}
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
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Flavors</div>
          <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
            {flavors?.length || 0}
          </div>
        </div>

        {/* Flavors Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {flavors?.map((flavor: any) => (
            <div
              key={flavor.id}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '1rem',
                }}
              >
                <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>
                  {flavor.slug}
                </h3>
                <span
                  style={{
                    background: '#8b5cf6',
                    color: '#fff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  ID: {flavor.id}
                </span>
              </div>

              {flavor.description && (
                <p
                  style={{
                    color: '#cbd5e1',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    marginBottom: '1rem',
                  }}
                >
                  {flavor.description}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Created: {new Date(flavor.created_datetime_utc).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <Link
                  href={`/admin/humor-flavors/${flavor.id}/steps`}
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                  }}
                >
                  View Steps →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {flavors && flavors.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#64748b',
            }}
          >
            No humor flavors found
          </div>
        )}
      </main>
    </div>
  )
}