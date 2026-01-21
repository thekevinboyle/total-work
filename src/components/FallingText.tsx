// src/components/FallingText.tsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import './FallingText.css'

interface FallingTextProps {
  text: string
  delayPerChar?: number
  fallDuration?: number
  onComplete?: () => void
}

export function FallingText({
  text,
  delayPerChar = 3,
  fallDuration = 0.4,
  onComplete,
}: FallingTextProps) {
  const [visibleChars, setVisibleChars] = useState(0)
  const chars = text.split('')

  useEffect(() => {
    if (visibleChars >= chars.length) {
      onComplete?.()
      return
    }

    const timer = setTimeout(() => {
      setVisibleChars((prev) => prev + 1)
    }, delayPerChar)

    return () => clearTimeout(timer)
  }, [visibleChars, chars.length, delayPerChar, onComplete])

  return (
    <span className="falling-text">
      {chars.map((char, index) => {
        const isVisible = index < visibleChars
        const isNewline = char === '\n'

        if (isNewline) {
          return <br key={index} />
        }

        return (
          <motion.span
            key={index}
            className="falling-char"
            initial={{ opacity: 0, y: -100 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -100 }}
            transition={{
              duration: fallDuration,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        )
      })}
    </span>
  )
}
