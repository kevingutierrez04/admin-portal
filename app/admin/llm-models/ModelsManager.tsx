'use client'

import { useState } from 'react'
import { createModel, updateModel, deleteModel } from './actions'

type Model = {
  id: number
  name: string
  provider_model_id: string
  llm_provider_id: number
  created_datetime_utc: string
  llm_providers?: {
    id: number
    name: string
  }
}

type Provider = {
  id: number
  name: string
  slug: string
}

export default function ModelsManager({ models, providers }: { models: Model[]; providers: Provider[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [filterProvider, setFilterProvider] = useState<number | null>(null)

  const filteredModels = filterProvider ? models.filter(m => m.llm_provider_id === filterProvider) : models

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Models</div>
          <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
            {models.length}
          </div>
        </div>

        <select
          value={filterProvider || ''}
          onChange={(e) => setFilterProvider(e.target.value ? parseInt(e.target.value) : null)}
          style={{
            background: '#000',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <option value="">All Providers</option>
          {providers.map(provider => (
            <option key={provider.id} value={provider.id}>{provider.name}</option>
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
          + Create Model
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {filteredModels.map((model) => (
          <div
            key={model.id}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>
                  {model.name}
                </h3>
                <span
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {model.llm_providers?.name || 'Unknown'}
                </span>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Model ID: {model.provider_model_id}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setEditingModel(model)}
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
                  if (confirm(`Delete model "${model.name}"?`)) {
                    await deleteModel(model.id)
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
        <ModelModal
          providers={providers}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (formData) => {
            await createModel(formData)
            setShowCreateModal(false)
          }}
        />
      )}

      {editingModel && (
        <ModelModal
          model={editingModel}
          providers={providers}
          onClose={() => setEditingModel(null)}
          onSubmit={async (formData) => {
            await updateModel(editingModel.id, formData)
            setEditingModel(null)
          }}
        />
      )}
    </div>
  )
}

function ModelModal({
  model,
  providers,
  onClose,
  onSubmit,
}: {
  model?: Model
  providers: Provider[]
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
}) {
  const [name, setName] = useState(model?.name || '')
  const [providerModelId, setProviderModelId] = useState(model?.provider_model_id || '')
  const [providerId, setProviderId] = useState(model?.llm_provider_id || providers[0]?.id || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting model:', { name, providerModelId, providerId })
    const formData = new FormData()
    formData.append('name', name)
    formData.append('provider_model_id', providerModelId)
    formData.append('llm_provider_id', providerId.toString())
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
          {model ? 'Edit Model' : 'Create Model'}
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
              placeholder="e.g., GPT-4"
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
              Provider Model ID *
            </label>
            <input
              type="text"
              value={providerModelId}
              onChange={(e) => setProviderModelId(e.target.value)}
              required
              placeholder="e.g., gpt-4-2025-04-14"
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
              Provider *
            </label>
            <select
              value={providerId}
              onChange={(e) => setProviderId(parseInt(e.target.value))}
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
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
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
              {model ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}