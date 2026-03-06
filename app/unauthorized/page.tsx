'use client'

import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #7f1d1d 0%, #0f172a 100%)',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          padding: '3rem',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '500px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
        <h1 style={{ color: '#fff', marginBottom: '1rem', fontSize: '2rem' }}>
          Access Denied
        </h1>
        <p style={{ color: '#cbd5e1', marginBottom: '2rem', lineHeight: 1.6 }}>
          You need superadmin privileges to access the admin panel.
        </p>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>
          If you believe this is an error, please contact an administrator to
          grant you superadmin access.
        </p>
        <button
          onClick={handleLogout}
          style={{
            background: '#ef4444',
            color: '#fff',
            padding: '0.875rem 2rem',
            borderRadius: '10px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#dc2626'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#ef4444'
          }}
        >
          Sign Out
        </button>
      </div>
    </main>
  )
}
