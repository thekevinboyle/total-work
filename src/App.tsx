// src/App.tsx
import { useState, useEffect, useCallback } from 'react'
import type { AppState } from './types'
import { BootScreen } from './components/BootScreen'
import { SplashScreen } from './components/SplashScreen'

function App() {
  const [appState, setAppState] = useState<AppState>('boot')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if already authenticated (session storage)
  useEffect(() => {
    const auth = sessionStorage.getItem('bbs-auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      setAppState('content')
    }
  }, [])

  const handleKeyPress = useCallback(() => {
    if (appState === 'boot') {
      setAppState('splash')
    }
  }, [appState])

  const handlePasswordSuccess = useCallback(() => {
    sessionStorage.setItem('bbs-auth', 'true')
    setIsAuthenticated(true)
    setAppState('content')
  }, [])

  // TODO: isAuthenticated will be used by child components
  void isAuthenticated

  // Global keypress listener for boot state
  useEffect(() => {
    if (appState === 'boot') {
      const handler = () => handleKeyPress()
      window.addEventListener('keydown', handler)
      window.addEventListener('click', handler)
      return () => {
        window.removeEventListener('keydown', handler)
        window.removeEventListener('click', handler)
      }
    }
  }, [appState, handleKeyPress])

  return (
    <div className="app">
      {appState === 'boot' && <BootScreen />}
      {appState === 'splash' && (
        <SplashScreen onPasswordSuccess={handlePasswordSuccess} />
      )}
      {appState === 'content' && <div>Content Screen Placeholder</div>}
    </div>
  )
}

export default App
