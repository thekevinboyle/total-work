// src/components/ContentScreen.tsx
import { motion } from 'framer-motion'
import { BlogPost } from './BlogPost'
import { posts } from '../data/posts'
import './ContentScreen.css'

export function ContentScreen() {
  return (
    <div className="content-screen">
      <header className="content-header">
        <div className="content-header__line">
          ════════════════════════════════════════════════════════════════════════════════
        </div>
      </header>

      <main className="content-main">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <BlogPost post={post} />
          </motion.div>
        ))}
      </main>
    </div>
  )
}
