import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HumorFlavorsManager from './HumorFlavorsManager'

export default async function HumorFlavorsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: flavors }, { data: voteData }] = await Promise.all([
    supabase
      .from('humor_flavors')
      .select('id, slug, description, is_pinned, created_datetime_utc')
      .order('created_datetime_utc', { ascending: false }),
    supabase
      .from('caption_votes')
      .select('vote_value, captions!inner(humor_flavor_id)'),
  ])

  // Aggregate vote stats per flavor in JS
  const voteStats: Record<number, { upvotes: number; downvotes: number; total: number }> = {}
  ;(voteData as any[])?.forEach(v => {
    const flavorId = v.captions?.humor_flavor_id
    if (!flavorId) return
    if (!voteStats[flavorId]) voteStats[flavorId] = { upvotes: 0, downvotes: 0, total: 0 }
    voteStats[flavorId].total++
    if (v.vote_value === 1) voteStats[flavorId].upvotes++
    else if (v.vote_value === -1) voteStats[flavorId].downvotes++
  })

  const flavorsWithVotes = Object.keys(voteStats).length
  const totalLinkedVotes = Object.values(voteStats).reduce((sum, s) => sum + s.total, 0)

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
          <h1 style={{ color: '#fff', fontSize: '1.8rem' }}>🎭 Humor Flavors</h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Click <strong>Duplicate</strong> on any flavor to clone it with all its steps under a new slug.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Summary stats */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <StatBadge label="Total Flavors" value={flavors?.length ?? 0} color="#8b5cf6" />
          <StatBadge label="Flavors With Votes" value={flavorsWithVotes} color="#10b981" />
          <StatBadge
            label="Total Votes (flavor-linked)"
            value={totalLinkedVotes.toLocaleString()}
            color="#3b82f6"
          />
        </div>

        <HumorFlavorsManager flavors={flavors ?? []} voteStats={voteStats} />
      </main>
    </div>
  )
}

function StatBadge({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color: string
}) {
  return (
    <div
      style={{
        background: `${color}18`,
        border: `1px solid ${color}4d`,
        borderRadius: '8px',
        padding: '0.75rem 1.25rem',
      }}
    >
      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{label}</div>
      <div style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 'bold' }}>{value}</div>
    </div>
  )
}
