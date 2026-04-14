'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { duplicateFlavor } from './actions'

type Flavor = {
  id: number
  slug: string
  description: string | null
  is_pinned: boolean
  created_datetime_utc: string
}

type VoteStats = {
  upvotes: number
  downvotes: number
  total: number
}

export default function HumorFlavorsManager({
  flavors,
  voteStats,
}: {
  flavors: Flavor[]
  voteStats: Record<number, VoteStats>
}) {
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null)
  const [newSlug, setNewSlug] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const startDuplicate = (flavor: Flavor) => {
    setDuplicatingId(flavor.id)
    setNewSlug(`${flavor.slug}-copy`)
    setError(null)
  }

  const cancelDuplicate = () => {
    setDuplicatingId(null)
    setNewSlug('')
    setError(null)
  }

  const confirmDuplicate = (flavorId: number) => {
    if (!newSlug.trim()) {
      setError('Slug is required')
      return
    }
    startTransition(async () => {
      const result = await duplicateFlavor(flavorId, newSlug.trim())
      if (result.error) {
        setError(result.error)
      } else {
        setSuccessId(flavorId)
        setDuplicatingId(null)
        setNewSlug('')
        setTimeout(() => setSuccessId(null), 3000)
      }
    })
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {flavors.map(flavor => {
        const stats = voteStats[flavor.id]
        const upDownTotal = stats ? stats.upvotes + stats.downvotes : 0
        const approvalPct = upDownTotal > 0 ? Math.round((stats.upvotes / upDownTotal) * 100) : null
        const isDuplicating = duplicatingId === flavor.id
        const isSuccess = successId === flavor.id

        return (
          <div
            key={flavor.id}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: `1px solid ${
                isSuccess
                  ? 'rgba(16, 185, 129, 0.5)'
                  : isDuplicating
                  ? 'rgba(139, 92, 246, 0.5)'
                  : 'rgba(255, 255, 255, 0.1)'
              }`,
              transition: 'border-color 0.2s',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '0.75rem',
              }}
            >
              <h3
                style={{
                  color: '#fff',
                  fontSize: '1.05rem',
                  margin: 0,
                  flex: 1,
                  marginRight: '0.5rem',
                  wordBreak: 'break-all',
                }}
              >
                {flavor.slug}
                {flavor.is_pinned && (
                  <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem' }}>📌</span>
                )}
              </h3>
              <span
                style={{
                  background: '#8b5cf6',
                  color: '#fff',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}
              >
                ID: {flavor.id}
              </span>
            </div>

            {/* Description */}
            {flavor.description && (
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  margin: '0 0 0.75rem',
                }}
              >
                {flavor.description.length > 120
                  ? flavor.description.slice(0, 120) + '…'
                  : flavor.description}
              </p>
            )}

            {/* Vote Stats */}
            {stats && stats.total > 0 ? (
              <div style={{ marginBottom: '0.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.3rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <span style={{ color: '#10b981' }}>👍 {stats.upvotes.toLocaleString()}</span>
                  <span style={{ color: '#94a3b8' }}>{stats.total.toLocaleString()} votes</span>
                  <span style={{ color: '#ef4444' }}>👎 {stats.downvotes.toLocaleString()}</span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${approvalPct ?? 50}%`,
                      background: (approvalPct ?? 50) >= 50 ? '#10b981' : '#ef4444',
                      borderRadius: '3px',
                    }}
                  />
                </div>
                {approvalPct !== null && (
                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '0.75rem',
                      marginTop: '0.25rem',
                      textAlign: 'right',
                    }}
                  >
                    {approvalPct}% approval
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#475569', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                No votes yet
              </div>
            )}

            {/* Duplicate slug input */}
            {isDuplicating && (
              <div style={{ marginBottom: '0.75rem' }}>
                <label
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    display: 'block',
                    marginBottom: '0.3rem',
                  }}
                >
                  New slug for duplicate:
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={e => {
                    setNewSlug(e.target.value)
                    setError(null)
                  }}
                  onKeyDown={e => e.key === 'Enter' && confirmDuplicate(flavor.id)}
                  autoFocus
                  placeholder="new-unique-slug"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${error ? '#ef4444' : 'rgba(139, 92, 246, 0.6)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {error && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span style={{ color: '#475569', fontSize: '0.75rem' }}>
                {new Date(flavor.created_datetime_utc).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isDuplicating ? (
                  <>
                    <button
                      onClick={cancelDuplicate}
                      disabled={isPending}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#94a3b8',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => confirmDuplicate(flavor.id)}
                      disabled={isPending}
                      style={{
                        background: isPending ? 'rgba(139,92,246,0.5)' : '#8b5cf6',
                        border: 'none',
                        color: '#fff',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: isPending ? 'default' : 'pointer',
                      }}
                    >
                      {isPending ? 'Duplicating…' : 'Confirm'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startDuplicate(flavor)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(139,92,246,0.4)',
                        color: '#a78bfa',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Duplicate
                    </button>
                    <Link
                      href={`/admin/humor-flavors/${flavor.id}/steps`}
                      style={{
                        background: '#3b82f6',
                        color: '#fff',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                      }}
                    >
                      Steps →
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {flavors.length === 0 && (
        <div
          style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b',
          }}
        >
          No humor flavors found
        </div>
      )}
    </div>
  )
}
