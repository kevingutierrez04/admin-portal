import { createClient } from './lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './components/LogoutButton'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all statistics
  const [
    { count: totalUsers },
    { count: totalImages },
    { count: totalCaptions },
    { count: totalVotes },
    { data: recentUsers },
    { data: recentActivity },
    { count: upvotesCount },
    { count: downvotesCount },
  ] = await Promise.all([
    // Total counts (head: true = no data, just count)
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }),

    // Recent users (last 10 signups)
    supabase
      .from('profiles')
      .select('id, email, created_datetime_utc, is_superadmin, is_in_study')
      .order('created_datetime_utc', { ascending: false })
      .limit(10),

    // Recent activity (last 10 captions)
    supabase
      .from('captions')
      .select('id, content, created_datetime_utc, profiles(email), images(url)')
      .order('created_datetime_utc', { ascending: false })
      .limit(10),

    // Upvotes count (just count, no data)
    supabase
      .from('caption_votes')
      .select('*', { count: 'exact', head: true })
      .eq('vote_value', 1),

    // Downvotes count (just count, no data)
    supabase
      .from('caption_votes')
      .select('*', { count: 'exact', head: true })
      .eq('vote_value', -1),
  ])

  const upvotes = upvotesCount || 0
  const downvotes = downvotesCount || 0

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
            <h1 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.25rem' }}>
              🎭 Admin Dashboard
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
              Logged in as {user.email}
            </p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Quick Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <StatCard
            icon="👥"
            title="Total Users"
            value={totalUsers || 0}
            color="#3b82f6"
          />
          <StatCard
            icon="🖼️"
            title="Total Images"
            value={totalImages || 0}
            color="#8b5cf6"
          />
          <StatCard
            icon="💬"
            title="Total Captions"
            value={totalCaptions || 0}
            color="#10b981"
          />
          <StatCard
            icon="🗳️"
            title="Total Votes"
            value={totalVotes || 0}
            color="#f59e0b"
          />
        </div>

        {/* Navigation Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <NavCard
            href="/admin/users"
            icon="👥"
            title="Manage Users"
            description="View and manage user profiles"
            color="#3b82f6"
          />
          <NavCard
            href="/admin/images"
            icon="🖼️"
            title="Manage Images"
            description="Create, read, update, and delete images"
            color="#8b5cf6"
          />
          <NavCard
            href="/admin/captions"
            icon="💬"
            title="View Captions"
            description="Browse all captions in the system"
            color="#10b981"
          />
          <NavCard
            href="/admin/humor-flavors"
            icon="🎭"
            title="Humor Flavors"
            description="View humor flavors and their steps"
            color="#f59e0b"
          />
          <NavCard
            href="/admin/humor-mix"
            icon="🎲"
            title="Humor Mix"
            description="Configure caption generation mix"
            color="#ec4899"
          />
          <NavCard
            href="/admin/caption-examples"
            icon="📚"
            title="Caption Examples"
            description="Manage training examples (CRUD)"
            color="#06b6d4"
          />
          <NavCard
            href="/admin/terms"
            icon="📖"
            title="Terms Dictionary"
            description="Manage terminology (CRUD)"
            color="#8b5cf6"
          />
          <NavCard
            href="/admin/llm-providers"
            icon="🤖"
            title="LLM Providers"
            description="Manage AI providers (CRUD)"
            color="#3b82f6"
          />
          <NavCard
            href="/admin/llm-models"
            icon="🧠"
            title="LLM Models"
            description="Manage AI models (CRUD)"
            color="#06b6d4"
          />
          <NavCard
            href="/admin/llm-prompt-chains"
            icon="⛓️"
            title="Prompt Chains"
            description="View LLM prompt executions"
            color="#f59e0b"
          />
          <NavCard
            href="/admin/llm-model-responses"
            icon="💬"
            title="LLM Responses"
            description="View all LLM responses"
            color="#10b981"
          />
          <NavCard
            href="/admin/caption-requests"
            icon="📋"
            title="Caption Requests"
            description="View all caption generation requests"
            color="#ec4899"
          />
          <NavCard
            href="/admin/allowed-domains"
            icon="🔐"
            title="Allowed Domains"
            description="Manage signup domains (CRUD)"
            color="#ef4444"
          />
          <NavCard
            href="/admin/whitelisted-emails"
            icon="✉️"
            title="Whitelisted Emails"
            description="Manage allowed emails (CRUD)"
            color="#8b5cf6"
          />
        </div>

        {/* Two Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {/* Vote Distribution */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.3rem' }}>
              📊 Vote Distribution
            </h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    background: '#10b981',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
                    {upvotes}
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>Upvotes</div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    background: '#ef4444',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
                    {downvotes}
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>Downvotes</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              Total engagement: {upvotes + downvotes} votes
            </div>
          </div>

          {/* Recent Users */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.3rem' }}>
              🆕 Recent Signups
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentUsers?.slice(0, 2).map((user: any) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                      {user.email}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {new Date(user.created_datetime_utc).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {user.is_superadmin && (
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
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                        }}
                      >
                        STUDY
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h2 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.3rem' }}>
            ⚡ Recent Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentActivity?.map((caption: any) => (
              <div
                key={caption.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  alignItems: 'center',
                }}
              >
                {caption.images?.url && (
                  <img
                    src={caption.images.url}
                    alt="Caption"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', marginBottom: '0.25rem' }}>
                    "{caption.content}"
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    by {caption.profiles?.email} •{' '}
                    {new Date(caption.created_datetime_utc).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: string
  title: string
  value: number
  color: string
}) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'transform 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            {title}
          </div>
          <div style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold' }}>
            {value.toLocaleString('en-US')}
          </div>
        </div>
        <div style={{ fontSize: '2.5rem' }}>{icon}</div>
      </div>
    </div>
  )
}

function NavCard({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string
  icon: string
  title: string
  description: string
  color: string
}) {
  return (
    <Link
      href={href}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textDecoration: 'none',
        transition: 'all 0.2s',
        display: 'block',
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
      <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>{description}</p>
    </Link>
  )
}