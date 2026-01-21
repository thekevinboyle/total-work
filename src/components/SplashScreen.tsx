// src/components/SplashScreen.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PasswordInput } from './PasswordInput'
import { NARCOTIC_ASCII } from '../assets/ascii'
import './SplashScreen.css'

interface SplashScreenProps {
  onPasswordSuccess: () => void
}

export function SplashScreen({ onPasswordSuccess }: SplashScreenProps) {
  const [showContent, setShowContent] = useState(false)

  // Trigger content display after a short delay
  useState(() => {
    const timer = setTimeout(() => setShowContent(true), 500)
    return () => clearTimeout(timer)
  })

  return (
    <div className="splash-screen">
      <motion.div
        className="splash-logo-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <pre className="splash-logo">{NARCOTIC_ASCII}</pre>
      </motion.div>

      <motion.div
        className="splash-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="splash-meta">
          <span>Presented by NARCOTIC</span>
          <span>© 2026</span>
        </div>

        <div className="splash-password">
          <PasswordInput
            password={import.meta.env.VITE_PASSWORD || 'basement'}
            onSuccess={onPasswordSuccess}
          />
        </div>
      </motion.div>
    </div>
  )
}
