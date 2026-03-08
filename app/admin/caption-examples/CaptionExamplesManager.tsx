'use client'

import { useState } from 'react'
import { createCaptionExample, updateCaptionExample, deleteCaptionExample } from './actions'

type CaptionExample = {
  id: number
  image_description: string
  caption: string
  explanation: string
  priority: number
  image_id: string | null
  created_datetime_utc: string
  images?: {
    url: string | null
    image_description: string | null
  }
}

export default function CaptionExamplesManager({ examples }: { examples: CaptionExample[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingExample, setEditingExample] = useState<CaptionExample | null>(null)

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Examples</div>
          <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
            {examples.length}
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
          + Create Example
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {examples.map((example) => (
          <div
            key={example.id}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Priority</span>
                <span
                  style={{
                    background: example.priority > 0 ? '#f59e0b' : '#64748b',
                    color: '#fff',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {example.priority}
                </span>
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {example.image_description}
              </div>
            </div>

            <div
              style={{
                background: '#000',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Caption:</div>
              <div style={{ color: '#fff', fontStyle: 'italic' }}>"{example.caption}"</div>
            </div>

            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <strong>Explanation:</strong> {example.explanation}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setEditingExample(example)}
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
                  if (confirm('Delete this example?')) {
                    await deleteCaptionExample(example.id)
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
        <ExampleModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (formData) => {
            await createCaptionExample(formData)
            setShowCreateModal(false)
          }}
        />
      )}

      {editingExample && (
        <ExampleModal
          example={editingExample}
          onClose={() => setEditingExample(null)}
          onSubmit={async (formData) => {
            await updateCaptionExample(editingExample.id, formData)
            setEditingExample(null)
          }}
        />
      )}
    </div>
  )
}

function ExampleModal({
  example,
  onClose,
  onSubmit,
}: {
  example?: CaptionExample
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
}) {
  const [imageDescription, setImageDescription] = useState(example?.image_description || '')
  const [caption, setCaption] = useState(example?.caption || '')
  const [explanation, setExplanation] = useState(example?.explanation || '')
  const [priority, setPriority] = useState(example?.priority || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('image_description', imageDescription)
    formData.append('caption', caption)
    formData.append('explanation', explanation)
    formData.append('priority', priority.toString())
    await onSubmit(formData)
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
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>
          {example ? 'Edit Example' : 'Create Example'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
              Image Description *
            </label>
            <textarea
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              required
              rows={3}
              style={{
                width: '100%',
                background: '#000',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '0.75rem',
                color: '#fff',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
              Caption *
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
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

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
              Explanation *
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              required
              rows={3}
              style={{
                width: '100%',
                background: '#000',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '0.75rem',
                color: '#fff',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
              Priority (0-10)
            </label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
              min="0"
              max="10"
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
              {example ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}