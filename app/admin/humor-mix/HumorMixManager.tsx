'use client'

import { useState } from 'react'
import { updateHumorMix } from './actions'

type MixItem = {
  id: number
  humor_flavor_id: number
  caption_count: number
  created_datetime_utc: string
  humor_flavors?: {
    id: number
    slug: string
    description: string | null
  }
}

export default function HumorMixManager({ mixItems }: { mixItems: MixItem[] }) {
  const [editing, setEditing] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<number>(0)

  const handleEdit = (item: MixItem) => {
    setEditing(item.id)
    setEditValue(item.caption_count)
  }

  const handleSave = async (mixId: number) => {
    const result = await updateHumorMix(mixId, editValue)
    if (result.error) {
      alert(result.error)
    } else {
      setEditing(null)
    }
  }

  const handleCancel = () => {
    setEditing(null)
  }

  return (
    <div>
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
        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Mix Configurations</div>
        <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
          {mixItems.length}
        </div>
      </div>

      {/* Mix Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mixItems.map((item) => (
          <div
            key={item.id}
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
            <div style={{ flex: 1 }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                {item.humor_flavors?.slug || `Flavor ID: ${item.humor_flavor_id}`}
              </h3>
              {item.humor_flavors?.description && (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {item.humor_flavors.description}
                </p>
              )}
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                Mix ID: {item.id}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              {editing === item.id ? (
                <>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                    style={{
                      background: '#000',
                      border: '2px solid #3b82f6',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '0.5rem',
                      width: '80px',
                      fontSize: '1rem',
                      textAlign: 'center',
                    }}
                  />
                  <button
                    onClick={() => handleSave(item.id)}
                    style={{
                      background: '#10b981',
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      background: '#64748b',
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      background: '#8b5cf6',
                      color: '#fff',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      minWidth: '80px',
                      textAlign: 'center',
                    }}
                  >
                    {item.caption_count}
                  </div>
                  <button
                    onClick={() => handleEdit(item)}
                    style={{
                      background: '#3b82f6',
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Edit Count
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {mixItems.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
          }}
        >
          No humor mix configurations found
        </div>
      )}
    </div>
  )
}