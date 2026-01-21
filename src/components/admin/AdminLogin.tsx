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
          <span>&copy; 2026 BASEMENT</span>
        </footer>
      </div>
    </div>
  )
}
