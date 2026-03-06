'use client'

import { createClient } from '../lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error logging in:', error.message)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          padding: '3rem',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '400px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
        <h1 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.8rem' }}>
          Admin Panel
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Superadmin access required
        </p>
        <button
          onClick={handleGoogleLogin}
          style={{
            background: '#3b82f6',
            color: '#fff',
            padding: '0.875rem 2rem',
            borderRadius: '10px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#2563eb'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#3b82f6'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Sign in with Google
        </button>
        <p style={{ color: '#64748b', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          Only superadmin users can access this panel
        </p>
      </div>
    </main>
  )
}
