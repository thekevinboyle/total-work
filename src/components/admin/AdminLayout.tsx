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
