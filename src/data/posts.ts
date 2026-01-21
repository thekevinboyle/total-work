// src/data/posts.ts
import type { BlogPost } from '../types'

export const posts: BlogPost[] = [
  {
    id: '1',
    date: '01.01.2026',
    time: '12:00 PM GMT',
    title: 'POST NAME',
    content: `Lorem ipsum dolor sit amet, I haven't fully memorized this filler text my fault. Pictures could also live in these posts but kinda blog/ tumblr style is the energy.`,
  },
  {
    id: '2',
    date: '01.02.2026',
    time: '3:30 PM GMT',
    title: 'ANOTHER POST',
    content: `More content here. The vibe is very much old-school BBS meets modern album rollout. Exclusive content, behind the scenes, etc.`,
  },
  {
    id: '3',
    date: '01.05.2026',
    time: '9:00 AM GMT',
    title: 'TRACK PREVIEW',
    content: `Snippet of upcoming track. More to come...`,
    image: '/images/track-preview.jpg',
  },
]
