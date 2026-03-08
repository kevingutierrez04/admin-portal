'use client'

import { useState } from 'react'
import { createTerm, updateTerm, deleteTerm } from './actions'

type Term = {
  id: number
  term: string
  definition: string
  example: string
  term_type_id: number
  created_datetime_utc: string
  term_types?: {
    id: number
    name?: string
    [key: string]: any
  }
}

type TermType = {
  id: number
  name?: string
  [key: string]: any
}

export default function TermsManager({ terms, termTypes }: { terms: Term[]; termTypes: TermType[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)
  const [filter, setFilter] = useState<number | null>(null)

  const filteredTerms = filter ? terms.filter(t => t.term_type_id === filter) : terms

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Terms</div>
          <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
            {terms.length}
          </div>
        </div>

        <select
          value={filter || ''}
          onChange={(e) => setFilter(e.target.value ? parseInt(e.target.value) : null)}
          style={{
            background: '#000',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <option value="">All Types</option>
          {termTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name || `Type ${type.id}`}
            </option>
          ))}
        </select>

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
          + Create Term
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
        {filteredTerms.map((term) => (
          <div
            key={term.id}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>{term.term}</h3>
              <span
                style={{
                  background: '#8b5cf6',
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}
              >
                {term.term_types?.name || `Type ${term.term_type_id}`}
              </span>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              {term.definition}
            </p>

            {term.example && (
              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  Example:
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  {term.example}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setEditingTerm(term)}
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
                  if (confirm(`Delete term "${term.term}"?`)) {
                    await deleteTerm(term.id)
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
        <TermModal
          termTypes={termTypes}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (formData) => {
            await createTerm(formData)
            setShowCreateModal(false)
          }}
        />
      )}

      {editingTerm && (
        <TermModal
          term={editingTerm}
          termTypes={termTypes}
          onClose={() => setEditingTerm(null)}
          onSubmit={async (formData) => {
            await updateTerm(editingTerm.id, formData)
            setEditingTerm(null)
          }}
        />
      )}
    </div>
  )
}

function TermModal({
  term,
  termTypes,
  onClose,
  onSubmit,
}: {
  term?: Term
  termTypes: TermType[]
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
}) {
  const [termText, setTermText] = useState(term?.term || '')
  const [definition, setDefinition] = useState(term?.definition || '')
  const [example, setExample] = useState(term?.example || '')
  const [termTypeId, setTermTypeId] = useState(term?.term_type_id || termTypes[0]?.id || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting term:', { termText, definition, example, termTypeId })
    const formData = new FormData()
    formData.append('term', termText)
    formData.append('definition', definition)
    formData.append('example', example)
    formData.append('term_type_id', termTypeId.toString())
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
          {term ? 'Edit Term' : 'Create Term'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
              Term *
            </label>
            <input
              type="text"
              value={termText}
              onChange={(e) => setTermText(e.target.value)}
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
              Definition *
            </label>
            <textarea
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              required
              rows={4}
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
              Example *
            </label>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              required
              rows={3}
              placeholder="Example usage of this term..."
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
              Type *
            </label>
            <select
              value={termTypeId}
              onChange={(e) => setTermTypeId(parseInt(e.target.value))}
              required
              style={{
                width: '100%',
                background: '#000',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '0.75rem',
                color: '#fff',
              }}
            >
              {termTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name || `Type ${type.id}`}
                </option>
              ))}
            </select>
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
              {term ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}