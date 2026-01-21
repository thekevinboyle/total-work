// src/App.tsx
import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { AppState } from './types'
import { BootScreen } from './components/BootScreen'
import { SplashScreen } from './components/SplashScreen'
import { ContentScreen } from './components/ContentScreen'

function App() {
  const [appState, setAppState] = useState<AppState>('boot')

  useEffect(() => {
    const auth = sessionStorage.getItem('bbs-auth')
    if (auth === 'true') {
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
    setAppState('content')
  }, [])

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
    <div className="app" style={{ height: '100%' }}>
      <AnimatePresence mode="wait">
        {appState === 'boot' && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%' }}
          >
            <BootScreen />
          </motion.div>
        )}
        {appState === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            style={{ height: '100%' }}
          >
            <SplashScreen onPasswordSuccess={handlePasswordSuccess} />
          </motion.div>
        )}
        {appState === 'content' && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ height: '100%' }}
          >
            <ContentScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
