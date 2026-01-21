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
        <span>NARCOTIC_ADMIN</span>
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
