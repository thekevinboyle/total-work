// src/components/SplashScreen.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { TypewriterLines } from './TypewriterLines'
import { PasswordInput } from './PasswordInput'
import { FACE_ASCII, NARCOTIC_ASCII } from '../assets/ascii'
import './SplashScreen.css'

interface SplashScreenProps {
  onPasswordSuccess: () => void
}

export function SplashScreen({ onPasswordSuccess }: SplashScreenProps) {
  const [headerComplete, setHeaderComplete] = useState(false)

  const headerLine = '================================================================+ WELCOME TO +================================================================'
  const faceLines = FACE_ASCII.split('\n')
  const logoLines = NARCOTIC_ASCII.split('\n')

  return (
    <div className="splash-screen">
      <header className="splash-header">
        <TypewriterLines
          lines={[headerLine]}
          speed={2}
          onComplete={() => setHeaderComplete(true)}
        />
      </header>

      {headerComplete && (
        <motion.div
          className="splash-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="splash-panels">
            <div className="splash-panel splash-panel--left">
              <TypewriterLines lines={faceLines} speed={1} />
            </div>
            <div className="splash-divider">│</div>
            <div className="splash-panel splash-panel--right">
              <TypewriterLines lines={logoLines} speed={1} />
              <div className="splash-meta">
                <span>Presented by NARCOTIC</span>
                <span>© 2026</span>
              </div>
            </div>
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
