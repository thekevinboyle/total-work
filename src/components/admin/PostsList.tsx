// src/components/admin/PostsList.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { postsService } from '../../services/posts'
import type { Post } from '../../types'
import './PostsList.css'

export function PostsList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const data = await postsService.getAll()
      setPosts(data)
    } catch (err) {
      setError('ERROR: Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('DELETE THIS POST? [Y/N]')) return

    try {
      await postsService.delete(id)
      setPosts(posts.filter((p) => p.id !== id))
    } catch (err) {
      setError('ERROR: Failed to delete post')
    }
  }

  const handleTogglePublish = async (post: Post) => {
    try {
      const updated = await postsService.togglePublish(post.id, !post.published)
      setPosts(posts.map((p) => (p.id === post.id ? updated : p)))
    } catch (err) {
      setError('ERROR: Failed to update post')
    }
  }

  if (loading) {
    return <div className="posts-list__loading">LOADING POSTS...</div>
  }

  return (
    <div className="posts-list">
      <header className="posts-list__header">
        <h1>POSTS DATABASE</h1>
        <span>{posts.length} RECORDS FOUND</span>
      </header>

      {error && <div className="posts-list__error">{error}</div>}

      {posts.length === 0 ? (
        <div className="posts-list__empty">
          NO POSTS FOUND. <Link to="/admin/new">[CREATE NEW]</Link>
        </div>
      ) : (
        <table className="posts-list__table">
          <thead>
            <tr>
              <th>STATUS</th>
              <th>TITLE</th>
              <th>DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className={`posts-list__status ${
                      post.published ? 'posts-list__status--published' : ''
                    }`}
                  >
                    [{post.published ? 'LIVE' : 'DRAFT'}]
                  </button>
                </td>
                <td className="posts-list__title">{post.title}</td>
                <td className="posts-list__date">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td className="posts-list__actions">
                  <Link to={`/admin/edit/${post.id}`}>[EDIT]</Link>
                  <button onClick={() => handleDelete(post.id)}>[DEL]</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
