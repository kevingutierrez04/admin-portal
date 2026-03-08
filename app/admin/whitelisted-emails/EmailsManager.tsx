'use client'

import { useState } from 'react'
import { createWhitelistedEmail, deleteWhitelistedEmail } from './actions'

type Email = {
  id: number
  email_address: string
  created_datetime_utc: string
}

export default function EmailsManager({ emails }: { emails: Email[] }) {
  const [showModal, setShowModal] = useState(false)
  const [newInviteeEmail, setNewInviteeEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('email_address', newInviteeEmail)
    const result = await createWhitelistedEmail(formData)
    if (result.success) {
      setNewInviteeEmail('')
      setShowModal(false)
    } else {
      alert(result.error)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
        <div
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Whitelisted Emails</div>
          <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
            {emails.length}
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
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
          + Add Email
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
        {emails.map((email) => (
          <div
            key={email.id}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>
                {email.email_address}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Added {new Date(email.created_datetime_utc).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
            <button
              onClick={async () => {
                if (confirm(`Remove "${email.email_address}" from whitelist?`)) {
                  await deleteWhitelistedEmail(email.id)
                }
              }}
              style={{
                background: '#ef4444',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {emails.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
          }}
        >
          No whitelisted emails. Add one to grant specific users access!
        </div>
      )}

      {showModal && (
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
          onClick={() => setShowModal(false)}
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
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Add Whitelisted Email</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newInviteeEmail}
                  onChange={(e) => setNewInviteeEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                  style={{
                    width: '100%',
                    background: '#000',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    color: '#fff',
                  }}
                />
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  This specific email will be allowed to sign up
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  Add Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}