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
