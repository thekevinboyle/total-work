// src/components/BlogPost.tsx
import type { BlogPost as BlogPostType } from '../types'
import './BlogPost.css'

interface BlogPostProps {
  post: BlogPostType
}

export function BlogPost({ post }: BlogPostProps) {
  return (
    <article className="blog-post">
      <header className="blog-post__header">
        <time className="blog-post__date">
          {post.date}
          <br />
          {post.time}
        </time>
        <h2 className="blog-post__title">↳ {post.title}</h2>
      </header>
      <div className="blog-post__content">
        <p>{post.content}</p>
        {post.image && (
          <img
            src={post.image}
            alt=""
            className="blog-post__image"
            loading="lazy"
          />
        )}
      </div>
    </article>
  )
}
