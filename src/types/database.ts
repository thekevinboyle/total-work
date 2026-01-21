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
