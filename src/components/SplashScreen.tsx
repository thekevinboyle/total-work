// src/components/SplashScreen.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FallingText } from './FallingText'
import { PasswordInput } from './PasswordInput'
import { NARCOTIC_ASCII } from '../assets/ascii'
import './SplashScreen.css'

interface SplashScreenProps {
  onPasswordSuccess: () => void
}

export function SplashScreen({ onPasswordSuccess }: SplashScreenProps) {
  const [logoComplete, setLogoComplete] = useState(false)

  return (
    <div className="splash-screen">
      <div className="splash-logo-container">
        <pre className="splash-logo">
          <FallingText
            text={NARCOTIC_ASCII}
            delayPerChar={2}
            fallDuration={0.3}
            onComplete={() => setLogoComplete(true)}
          />
        </pre>
      </div>

      {logoComplete && (
        <motion.div
          className="splash-footer"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
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
      )}
    </div>
  )
}
