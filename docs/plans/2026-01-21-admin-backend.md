# Admin Backend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Supabase-powered admin backend with retro BBS-style login screen and dashboard for creating/managing blog posts.

**Architecture:** Supabase provides Postgres database + authentication. React Router handles admin routes (`/admin`, `/admin/login`). Posts are stored in Supabase with Row Level Security. Admin UI maintains the retro terminal aesthetic. Auth state managed via Supabase's `onAuthStateChange` listener.

**Tech Stack:** Supabase (Auth + Postgres), React Router v7, @supabase/supabase-js, @supabase/auth-ui-react (optional), existing Framer Motion

---

## Prerequisites

Before starting, you need to:
1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon/publishable key from Settings > API
3. Set up the database schema (Task 2 provides the SQL)

---

## Task 1: Install Dependencies & Configure Supabase Client

**Files:**
- Modify: `package.json`
- Create: `src/lib/supabase.ts`
- Modify: `.env`
- Modify: `.env.example` (create if doesn't exist)

**Step 1: Install Supabase and React Router**

```bash
cd /Users/kevin/Documents/web/total-work
npm install @supabase/supabase-js react-router-dom
```

**Step 2: Add Supabase environment variables to .env**

```bash
# Add to .env (keep existing VITE_PASSWORD)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Step 3: Create .env.example for documentation**

```bash
VITE_PASSWORD=your_site_password
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Step 4: Create Supabase client**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Supabase client and dependencies"
```

---

## Task 2: Database Schema & Types

**Files:**
- Create: `supabase/schema.sql`
- Create: `src/types/database.ts`
- Modify: `src/types.ts`

**Step 1: Create database schema SQL**

```sql
-- supabase/schema.sql
-- Run this in Supabase SQL Editor

-- Posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published posts
CREATE POLICY "Public can read published posts"
  ON posts FOR SELECT
  USING (published = true);

-- Policy: Authenticated users can do everything
CREATE POLICY "Authenticated users have full access"
  ON posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Index for faster queries
CREATE INDEX posts_published_idx ON posts(published, published_at DESC);
```

**Step 2: Create TypeScript database types**

```typescript
// src/types/database.ts
export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          image_url: string | null
          published: boolean
          published_at: string | null
          author_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          image_url?: string | null
          published?: boolean
          published_at?: string | null
          author_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          image_url?: string | null
          published?: boolean
          published_at?: string | null
          author_id?: string | null
        }
      }
    }
  }
}

export type Post = Database['public']['Tables']['posts']['Row']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostUpdate = Database['public']['Tables']['posts']['Update']
```

**Step 3: Update main types file**

```typescript
// src/types.ts
export type AppState = 'boot' | 'splash' | 'content'

export interface BlogPost {
  id: string
  date: string
  time: string
  title: string
  content: string
  image?: string
}

// Re-export database types
export type { Post, PostInsert, PostUpdate } from './types/database'
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add database schema and TypeScript types"
```

---

## Task 3: Auth Context & Hook

**Files:**
- Create: `src/contexts/AuthContext.tsx`
- Create: `src/hooks/useAuth.ts`

**Step 1: Create Auth Context**

```tsx
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

**Step 2: Create useAuth hook file (re-export)**

```typescript
// src/hooks/useAuth.ts
export { useAuth } from '../contexts/AuthContext'
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add AuthContext and useAuth hook"
```

---

## Task 4: Posts Service Layer

**Files:**
- Create: `src/services/posts.ts`

**Step 1: Create posts service**

```typescript
// src/services/posts.ts
import { supabase } from '../lib/supabase'
import type { Post, PostInsert, PostUpdate } from '../types'

export const postsService = {
  // Get all posts (admin)
  async getAll(): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  // Get published posts only (public)
  async getPublished(): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  // Get single post by ID
  async getById(id: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create new post
  async create(post: PostInsert): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update post
  async update(id: string, updates: PostUpdate): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete post
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Publish/unpublish post
  async togglePublish(id: string, published: boolean): Promise<Post> {
    const updates: PostUpdate = {
      published,
      published_at: published ? new Date().toISOString() : null,
    }

    return this.update(id, updates)
  },
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add posts service layer"
```

---

## Task 5: Admin Login Screen (Retro BBS Style)

**Files:**
- Create: `src/components/admin/AdminLogin.tsx`
- Create: `src/components/admin/AdminLogin.css`

**Step 1: Create AdminLogin component**

```tsx
// src/components/admin/AdminLogin.tsx
import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Typewriter } from '../Typewriter'
import './AdminLogin.css'

export function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const { signIn, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/admin')
    }
  }, [user, navigate])

  useEffect(() => {
    if (showForm) {
      emailRef.current?.focus()
    }
  }, [showForm])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setLoading(true)

      const { error } = await signIn(email, password)

      if (error) {
        setError('ACCESS DENIED: Invalid credentials')
        setPassword('')
        setLoading(false)
      } else {
        navigate('/admin')
      }
    },
    [email, password, signIn, navigate]
  )

  return (
    <div className="admin-login">
      <div className="admin-login__container">
        <header className="admin-login__header">
          <pre className="admin-login__ascii">
{`
╔══════════════════════════════════════╗
║     BASEMENT ADMIN TERMINAL v1.0     ║
║          AUTHORIZED ACCESS ONLY      ║
╚══════════════════════════════════════╝
`}
          </pre>
        </header>

        <div className="admin-login__content">
          <Typewriter
            text="SYSTEM READY. AWAITING AUTHENTICATION..."
            speed={30}
            onComplete={() => setShowForm(true)}
          />

          {showForm && (
            <form onSubmit={handleSubmit} className="admin-login__form">
              <div className="admin-login__field">
                <label>&gt; USER_ID: </label>
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-login__input"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="admin-login__field">
                <label>&gt; PASSWORD: </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-login__input"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              {error && <div className="admin-login__error">{error}</div>}

              <button
                type="submit"
                className="admin-login__submit"
                disabled={loading || !email || !password}
              >
                {loading ? 'AUTHENTICATING...' : '[ENTER] LOGIN'}
              </button>
            </form>
          )}
        </div>

        <footer className="admin-login__footer">
          <span>CONNECTION SECURE</span>
          <span>© 2026 BASEMENT</span>
        </footer>
      </div>
    </div>
  )
}
```

**Step 2: Create AdminLogin styles**

```css
/* src/components/admin/AdminLogin.css */
.admin-login {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.admin-login__container {
  max-width: 500px;
  width: 100%;
}

.admin-login__header {
  margin-bottom: 2rem;
}

.admin-login__ascii {
  font-size: 12px;
  line-height: 1.2;
  color: var(--color-text);
  margin: 0;
}

.admin-login__content {
  border: 1px solid var(--color-text-dim);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.admin-login__form {
  margin-top: 1.5rem;
}

.admin-login__field {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.admin-login__field label {
  color: var(--color-text);
  white-space: nowrap;
}

.admin-login__input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-text-dim);
  outline: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: inherit;
  padding: 0.25rem 0;
}

.admin-login__input:focus {
  border-bottom-color: var(--color-text);
}

.admin-login__input:disabled {
  opacity: 0.5;
}

.admin-login__error {
  color: #ff6b6b;
  margin-bottom: 1rem;
  animation: blink 0.5s ease-in-out 3;
}

@keyframes blink {
  50% { opacity: 0; }
}

.admin-login__submit {
  width: 100%;
  background: var(--color-text);
  color: var(--color-bg);
  border: none;
  padding: 0.75rem;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  transition: opacity 0.2s;
}

.admin-login__submit:hover:not(:disabled) {
  opacity: 0.9;
}

.admin-login__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admin-login__footer {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-dim);
  font-size: 12px;
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add retro BBS-style admin login screen"
```

---

## Task 6: Admin Dashboard Layout

**Files:**
- Create: `src/components/admin/AdminLayout.tsx`
- Create: `src/components/admin/AdminLayout.css`
- Create: `src/components/admin/AdminNav.tsx`

**Step 1: Create AdminNav component**

```tsx
// src/components/admin/AdminNav.tsx
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AdminNav() {
  const { signOut } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="admin-nav">
      <div className="admin-nav__brand">
        <span>BASEMENT_ADMIN</span>
      </div>
      <div className="admin-nav__links">
        <Link
          to="/admin"
          className={`admin-nav__link ${isActive('/admin') ? 'admin-nav__link--active' : ''}`}
        >
          [POSTS]
        </Link>
        <Link
          to="/admin/new"
          className={`admin-nav__link ${isActive('/admin/new') ? 'admin-nav__link--active' : ''}`}
        >
          [NEW]
        </Link>
        <button onClick={signOut} className="admin-nav__link admin-nav__logout">
          [LOGOUT]
        </button>
      </div>
    </nav>
  )
}
```

**Step 2: Create AdminLayout component**

```tsx
// src/components/admin/AdminLayout.tsx
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { AdminNav } from './AdminNav'
import './AdminLayout.css'

export function AdminLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="admin-layout admin-layout--loading">
        <span>LOADING SYSTEM...</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-layout__main">
        <Outlet />
      </main>
      <footer className="admin-layout__footer">
        <span>LOGGED IN AS: {user.email}</span>
        <span>SESSION ACTIVE</span>
      </footer>
    </div>
  )
}
```

**Step 3: Create AdminLayout styles**

```css
/* src/components/admin/AdminLayout.css */
.admin-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.admin-layout--loading {
  align-items: center;
  justify-content: center;
}

.admin-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-text-dim);
}

.admin-nav__brand {
  font-weight: bold;
}

.admin-nav__links {
  display: flex;
  gap: 1rem;
}

.admin-nav__link {
  color: var(--color-text);
  text-decoration: none;
  background: none;
  border: none;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  padding: 0;
}

.admin-nav__link:hover {
  text-decoration: underline;
}

.admin-nav__link--active {
  color: var(--color-text);
  text-decoration: underline;
}

.admin-nav__logout {
  color: var(--color-text-dim);
}

.admin-layout__main {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.admin-layout__footer {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-text-dim);
  font-size: 12px;
  color: var(--color-text-dim);
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add admin layout with navigation"
```

---

## Task 7: Posts List Page (Admin Dashboard)

**Files:**
- Create: `src/components/admin/PostsList.tsx`
- Create: `src/components/admin/PostsList.css`

**Step 1: Create PostsList component**

```tsx
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
```

**Step 2: Create PostsList styles**

```css
/* src/components/admin/PostsList.css */
.posts-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-text-dim);
}

.posts-list__header h1 {
  font-size: 14px;
  font-weight: 400;
}

.posts-list__loading,
.posts-list__empty {
  color: var(--color-text-dim);
  padding: 2rem 0;
}

.posts-list__empty a {
  color: var(--color-text);
}

.posts-list__error {
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.posts-list__table {
  width: 100%;
  border-collapse: collapse;
}

.posts-list__table th,
.posts-list__table td {
  text-align: left;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--color-text-dim);
}

.posts-list__table th {
  color: var(--color-text-dim);
  font-weight: 400;
  font-size: 12px;
}

.posts-list__status {
  background: none;
  border: none;
  color: var(--color-text-dim);
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  padding: 0;
}

.posts-list__status--published {
  color: #4ade80;
}

.posts-list__title {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.posts-list__date {
  color: var(--color-text-dim);
  font-size: 12px;
}

.posts-list__actions {
  display: flex;
  gap: 0.75rem;
}

.posts-list__actions a,
.posts-list__actions button {
  color: var(--color-text);
  text-decoration: none;
  background: none;
  border: none;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  padding: 0;
}

.posts-list__actions a:hover,
.posts-list__actions button:hover {
  text-decoration: underline;
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add posts list page for admin dashboard"
```

---

## Task 8: Post Editor Component

**Files:**
- Create: `src/components/admin/PostEditor.tsx`
- Create: `src/components/admin/PostEditor.css`

**Step 1: Create PostEditor component**

```tsx
// src/components/admin/PostEditor.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { postsService } from '../../services/posts'
import type { Post, PostInsert } from '../../types'
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
```

**Step 2: Create PostEditor styles**

```css
/* src/components/admin/PostEditor.css */
.post-editor__header {
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-text-dim);
}

.post-editor__header h1 {
  font-size: 14px;
  font-weight: 400;
}

.post-editor__loading {
  color: var(--color-text-dim);
  padding: 2rem 0;
}

.post-editor__error {
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.post-editor__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-editor__field {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.post-editor__field label {
  white-space: nowrap;
  padding-top: 0.25rem;
}

.post-editor__field--full {
  flex-direction: column;
}

.post-editor__field--full label {
  padding-top: 0;
}

.post-editor__input,
.post-editor__textarea {
  flex: 1;
  width: 100%;
  background: transparent;
  border: 1px solid var(--color-text-dim);
  color: var(--color-text);
  font-family: inherit;
  font-size: inherit;
  padding: 0.5rem;
  outline: none;
}

.post-editor__input:focus,
.post-editor__textarea:focus {
  border-color: var(--color-text);
}

.post-editor__input:disabled,
.post-editor__textarea:disabled {
  opacity: 0.5;
}

.post-editor__textarea {
  resize: vertical;
  min-height: 200px;
}

.post-editor__actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-text-dim);
}

.post-editor__cancel,
.post-editor__submit {
  background: none;
  border: 1px solid var(--color-text);
  color: var(--color-text);
  font-family: inherit;
  font-size: inherit;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.post-editor__submit {
  background: var(--color-text);
  color: var(--color-bg);
}

.post-editor__cancel:hover,
.post-editor__submit:hover {
  opacity: 0.9;
}

.post-editor__cancel:disabled,
.post-editor__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add post editor component for create/edit"
```

---

## Task 9: React Router Setup

**Files:**
- Modify: `src/main.tsx`
- Create: `src/router.tsx`
- Modify: `src/App.tsx`

**Step 1: Create router configuration**

```tsx
// src/router.tsx
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { AdminLogin } from './components/admin/AdminLogin'
import { AdminLayout } from './components/admin/AdminLayout'
import { PostsList } from './components/admin/PostsList'
import { PostEditor } from './components/admin/PostEditor'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <PostsList />,
      },
      {
        path: 'new',
        element: <PostEditor />,
      },
      {
        path: 'edit/:id',
        element: <PostEditor />,
      },
    ],
  },
])
```

**Step 2: Update main.tsx**

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { router } from './router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add React Router with admin routes"
```

---

## Task 10: Connect Public Blog to Supabase

**Files:**
- Modify: `src/components/ContentScreen.tsx`
- Delete: `src/data/posts.ts` (optional, can keep as fallback)

**Step 1: Update ContentScreen to fetch from Supabase**

```tsx
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

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await postsService.getPublished()
        setPosts(data.map(toBlogPost))
      } catch (err) {
        console.error('Failed to load posts:', err)
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
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: connect public blog to Supabase posts"
```

---

## Task 11: Final Integration & Testing

**Files:**
- Verify all imports work
- Test full flow

**Step 1: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 2: Test locally**

```bash
npm run dev
```

Test the following:
1. Visit http://localhost:5173 - Public blog should work (may show no posts if DB is empty)
2. Visit http://localhost:5173/admin/login - Should see retro login screen
3. Login with Supabase credentials
4. Create a new post, publish it
5. Visit public site, see the post appear

**Step 3: Create admin user in Supabase**

In Supabase Dashboard:
1. Go to Authentication > Users
2. Click "Add user"
3. Enter email and password for your admin account

**Step 4: Commit final state**

```bash
git add -A
git commit -m "feat: complete admin backend integration"
```

---

## Summary

**Total Tasks:** 11
**New Dependencies:** @supabase/supabase-js, react-router-dom

**New Files Structure:**
```
src/
├── components/
│   └── admin/
│       ├── AdminLayout.tsx
│       ├── AdminLayout.css
│       ├── AdminLogin.tsx
│       ├── AdminLogin.css
│       ├── AdminNav.tsx
│       ├── PostEditor.tsx
│       ├── PostEditor.css
│       ├── PostsList.tsx
│       └── PostsList.css
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
├── lib/
│   └── supabase.ts
├── services/
│   └── posts.ts
├── types/
│   └── database.ts
├── router.tsx
└── ...existing files
supabase/
└── schema.sql
```

**Routes:**
- `/` - Public BBS blog
- `/admin/login` - Admin login (retro style)
- `/admin` - Posts list (protected)
- `/admin/new` - Create post (protected)
- `/admin/edit/:id` - Edit post (protected)

---

## Sources

- [Supabase React Auth Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Supabase React Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- [Supabase Auth with Vite](https://www.parsatajik.com/posts/how-to-add-supabase-auth-to-your-react-vite-app)
