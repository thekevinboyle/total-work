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
