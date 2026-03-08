'use client'

import { useState } from 'react'
import { createProvider, updateProvider, deleteProvider } from './actions'

type Provider = {
  id: number
  name: string
  created_datetime_utc: string
}

export default function ProvidersManager({ providers }: { providers: Provider[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Providers</div>
          <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
            {providers.length}
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            background: '#10b981',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          + Create Provider
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {providers.map((provider) => (
          <div
            key={provider.id}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                {provider.name}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setEditingProvider(provider)}
                style={{
                  flex: 1,
                  background: '#3b82f6',
                  color: '#fff',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Delete provider "${provider.name}"?`)) {
                    await deleteProvider(provider.id)
                  }
                }}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  color: '#fff',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <ProviderModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (formData) => {
            await createProvider(formData)
            setShowCreateModal(false)
          }}
        />
      )}

      {editingProvider && (
        <ProviderModal
          provider={editingProvider}
          onClose={() => setEditingProvider(null)}
          onSubmit={async (formData) => {
            await updateProvider(editingProvider.id, formData)
            setEditingProvider(null)
          }}
        />
      )}
    </div>
  )
}

function ProviderModal({
  provider,
  onClose,
  onSubmit,
}: {
  provider?: Provider
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
}) {
  const [name, setName] = useState(provider?.name || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting provider:', { name })
    const formData = new FormData()
    formData.append('name', name)
    const result = await onSubmit(formData)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1e293b',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>
          {provider ? 'Edit Provider' : 'Create Provider'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., OpenAI"
              style={{
                width: '100%',
                background: '#000',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '0.75rem',
                color: '#fff',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: '#475569',
                color: '#fff',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                background: '#10b981',
                color: '#fff',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {provider ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}