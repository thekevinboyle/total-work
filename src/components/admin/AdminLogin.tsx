// src/components/admin/AdminLogin.tsx
import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { Typewriter } from '../Typewriter'
import './AdminLogin.css'

type Mode = 'login' | 'signup' | 'forgot'

export function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState<Mode>('login')
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
  }, [showForm, mode])

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  const switchMode = (newMode: Mode) => {
    resetForm()
    setMode(newMode)
  }

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setLoading(true)

      const { error } = await signIn(email, password)

      if (error) {
        setError('ACCESS DENIED: Invalid credentials')
        setPassword('')
      } else {
        navigate('/admin')
      }
      setLoading(false)
    },
    [email, password, signIn, navigate]
  )

  const handleSignup = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setSuccess('')

      if (password !== confirmPassword) {
        setError('ERROR: Passwords do not match')
        return
      }

      if (password.length < 6) {
        setError('ERROR: Password must be at least 6 characters')
        return
      }

      setLoading(true)

      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(`ERROR: ${error.message}`)
      } else {
        setSuccess('ACCOUNT CREATED. Check email to verify.')
        resetForm()
      }
      setLoading(false)
    },
    [email, password, confirmPassword]
  )

  const handleForgotPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setSuccess('')
      setLoading(true)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      })

      if (error) {
        setError(`ERROR: ${error.message}`)
      } else {
        setSuccess('RESET LINK SENT. Check your email.')
      }
      setLoading(false)
    },
    [email]
  )

  const getTitle = () => {
    switch (mode) {
      case 'signup':
        return 'CREATE NEW USER ACCOUNT...'
      case 'forgot':
        return 'PASSWORD RECOVERY SYSTEM...'
      default:
        return 'SYSTEM READY. AWAITING AUTHENTICATION...'
    }
  }

  const getSubmitText = () => {
    if (loading) {
      switch (mode) {
        case 'signup':
          return 'CREATING...'
        case 'forgot':
          return 'SENDING...'
        default:
          return 'AUTHENTICATING...'
      }
    }
    switch (mode) {
      case 'signup':
        return '[ENTER] CREATE ACCOUNT'
      case 'forgot':
        return '[ENTER] SEND RESET LINK'
      default:
        return '[ENTER] LOGIN'
    }
  }

  const handleSubmit = mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgotPassword

  const isSubmitDisabled = () => {
    if (loading) return true
    if (!email) return true
    if (mode === 'forgot') return false
    if (!password) return true
    if (mode === 'signup' && !confirmPassword) return true
    return false
  }

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
            key={mode}
            text={getTitle()}
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

              {mode !== 'forgot' && (
                <div className="admin-login__field">
                  <label>&gt; PASSWORD: </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="admin-login__input"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    disabled={loading}
                  />
                </div>
              )}

              {mode === 'signup' && (
                <div className="admin-login__field">
                  <label>&gt; CONFIRM: </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="admin-login__input"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>
              )}

              {error && <div className="admin-login__error">{error}</div>}
              {success && <div className="admin-login__success">{success}</div>}

              <button
                type="submit"
                className="admin-login__submit"
                disabled={isSubmitDisabled()}
              >
                {getSubmitText()}
              </button>

              <div className="admin-login__links">
                {mode === 'login' && (
                  <>
                    <button type="button" onClick={() => switchMode('signup')}>
                      [CREATE ACCOUNT]
                    </button>
                    <button type="button" onClick={() => switchMode('forgot')}>
                      [FORGOT PASSWORD]
                    </button>
                  </>
                )}
                {mode !== 'login' && (
                  <button type="button" onClick={() => switchMode('login')}>
                    [BACK TO LOGIN]
                  </button>
                )}
              </div>
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
