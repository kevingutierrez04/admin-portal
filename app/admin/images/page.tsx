import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ImageManager from './ImageManager'

export default async function ImagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all images with caption counts and profile info
  const { data: rawImages } = await supabase
    .from('images')
    .select(`
      *,
      profiles(email),
      captions(id)
    `)
    .order('created_datetime_utc', { ascending: false })

  // Transform to add caption counts
  const images = (rawImages || []).map((image: any) => ({
    ...image,
    captions: [{ count: image.captions?.length || 0 }],
  }))

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
            <h1 style={{ color: '#fff', fontSize: '1.8rem' }}>🖼️ Image Management</h1>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Images</div>
            <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
              {images?.length || 0}
            </div>
          </div>
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Public Images</div>
            <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
              {images?.filter((i) => i.is_public).length || 0}
            </div>
          </div>
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Common Use</div>
            <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
              {images?.filter((i) => i.is_common_use).length || 0}
            </div>
          </div>
        </div>

        <ImageManager images={images || []} />
      </main>
    </div>
  )
}
