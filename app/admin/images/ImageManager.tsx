'use client'

import { useState } from 'react'
import { createImage, updateImage, deleteImage } from './actions'

type Image = {
  id: string
  url: string | null
  image_description: string | null
  is_public: boolean
  is_common_use: boolean
  created_datetime_utc: string
  profiles?: { email: string }
  captions?: Array<{ count: number }>
}

export default function ImageManager({ images }: { images: Image[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingImage, setEditingImage] = useState<Image | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredImages = images.filter(
    (img) =>
      img.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.image_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Search images..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#fff',
            fontSize: '0.95rem',
          }}
        />
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
          + Create Image
        </button>
      </div>

      {/* Images Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredImages.map((image) => (
          <div
            key={image.id}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {image.url && (
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={image.url}
                  alt={image.image_description || 'Image'}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
            )}
            <div style={{ padding: '1rem' }}>
              <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                {image.image_description || 'No description'}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                {image.is_public && (
                  <span
                    style={{
                      background: '#10b981',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                    }}
                  >
                    PUBLIC
                  </span>
                )}
                {image.is_common_use && (
                  <span
                    style={{
                      background: '#f59e0b',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                    }}
                  >
                    COMMON USE
                  </span>
                )}
                <span
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                  }}
                >
                  {image.captions?.[0]?.count || 0} captions
                </span>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                by {image.profiles?.email || 'Unknown'} •{' '}
                {new Date(image.created_datetime_utc).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setEditingImage(image)}
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
                    if (confirm('Are you sure you want to delete this image?')) {
                      await deleteImage(image.id)
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
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <ImageModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (formData) => {
            await createImage(formData)
            setShowCreateModal(false)
          }}
        />
      )}

      {/* Edit Modal */}
      {editingImage && (
        <ImageModal
          image={editingImage}
          onClose={() => setEditingImage(null)}
          onSubmit={async (formData) => {
            await updateImage(editingImage.id, formData)
            setEditingImage(null)
          }}
        />
      )}
    </div>
  )
}

function ImageModal({
  image,
  onClose,
  onSubmit,
}: {
  image?: Image
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
}) {
  const [url, setUrl] = useState(image?.url || '')
  const [description, setDescription] = useState(image?.image_description || '')
  const [isPublic, setIsPublic] = useState(image?.is_public ?? false)
  const [isCommonUse, setIsCommonUse] = useState(image?.is_common_use ?? false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('url', url)
    formData.append('description', description)
    formData.append('is_public', isPublic.toString())
    formData.append('is_common_use', isCommonUse.toString())
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
          maxWidth: '500px',
          width: '90%',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>
          {image ? 'Edit Image' : 'Create Image'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
              Image URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '0.75rem',
                color: '#fff',
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '0.75rem',
                color: '#fff',
                resize: 'vertical',
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
            <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              Public
            </label>
            <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isCommonUse}
                onChange={(e) => setIsCommonUse(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              Common Use
            </label>
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
              {image ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
