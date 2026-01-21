// src/components/ContentScreen.tsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BlogPost } from './BlogPost'
import { postsService } from '../services/posts'
import type { Post } from '../types'
import './ContentScreen.css'

// Helper to format date from ISO to "01.01.2026"
function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

// Helper to format time from ISO to "12:00 PM GMT"
function formatTime(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })
}

// Convert Supabase Post to BlogPost format
function toBlogPost(post: Post) {
  return {
    id: post.id,
    date: formatDate(post.published_at || post.created_at),
    time: formatTime(post.published_at || post.created_at),
    title: post.title,
    content: post.content,
    image: post.image_url || undefined,
  }
}

export function ContentScreen() {
  const [posts, setPosts] = useState<ReturnType<typeof toBlogPost>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await postsService.getPublished()
        setPosts(data.map(toBlogPost))
      } catch (err) {
        console.error('Failed to load posts:', err)
        setError('FAILED TO LOAD POSTS')
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  if (loading) {
    return (
      <div className="content-screen">
        <header className="content-header">
          <div className="content-header__line">
            ════════════════════════════════════════════════════════════════════════════════
          </div>
        </header>
        <main className="content-main">
          <div style={{ color: 'var(--color-text-dim)' }}>LOADING POSTS...</div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="content-screen">
        <header className="content-header">
          <div className="content-header__line">
            ════════════════════════════════════════════════════════════════════════════════
          </div>
        </header>
        <main className="content-main">
          <div style={{ color: '#ff6b6b' }}>ERROR: {error}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="content-screen">
      <header className="content-header">
        <div className="content-header__line">
          ════════════════════════════════════════════════════════════════════════════════
        </div>
      </header>

      <main className="content-main">
        {posts.length === 0 ? (
          <div style={{ color: 'var(--color-text-dim)' }}>NO POSTS YET.</div>
        ) : (
          posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <BlogPost post={post} />
            </motion.div>
          ))
        )}
      </main>
    </div>
  )
}
