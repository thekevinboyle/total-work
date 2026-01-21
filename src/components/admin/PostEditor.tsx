// src/components/admin/PostEditor.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { postsService } from '../../services/posts'
import type { PostInsert } from '../../types'
import './PostEditor.css'

export function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      loadPost(id)
    }
  }, [id])

  const loadPost = async (postId: string) => {
    setLoading(true)
    try {
      const post = await postsService.getById(postId)
      if (post) {
        setTitle(post.title)
        setContent(post.content)
        setImageUrl(post.image_url || '')
      }
    } catch (err) {
      setError('ERROR: Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const postData: PostInsert = {
        title,
        content,
        image_url: imageUrl || null,
      }

      if (isEditing && id) {
        await postsService.update(id, postData)
      } else {
        await postsService.create(postData)
      }

      navigate('/admin')
    } catch (err) {
      setError('ERROR: Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="post-editor__loading">LOADING POST DATA...</div>
  }

  return (
    <div className="post-editor">
      <header className="post-editor__header">
        <h1>{isEditing ? 'EDIT POST' : 'NEW POST'}</h1>
      </header>

      {error && <div className="post-editor__error">{error}</div>}

      <form onSubmit={handleSubmit} className="post-editor__form">
        <div className="post-editor__field">
          <label>&gt; TITLE:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="post-editor__input"
            required
            disabled={saving}
          />
        </div>

        <div className="post-editor__field">
          <label>&gt; IMAGE_URL:</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="post-editor__input"
            placeholder="(optional)"
            disabled={saving}
          />
        </div>

        <div className="post-editor__field post-editor__field--full">
          <label>&gt; CONTENT:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="post-editor__textarea"
            rows={15}
            required
            disabled={saving}
          />
        </div>

        <div className="post-editor__actions">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="post-editor__cancel"
            disabled={saving}
          >
            [CANCEL]
          </button>
          <button
            type="submit"
            className="post-editor__submit"
            disabled={saving || !title || !content}
          >
            {saving ? 'SAVING...' : '[SAVE]'}
          </button>
        </div>
      </form>
    </div>
  )
}
