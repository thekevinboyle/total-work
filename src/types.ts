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
