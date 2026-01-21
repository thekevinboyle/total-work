// src/components/Typewriter.tsx
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

interface TypewriterProps {
  text: string
  delay?: number
  speed?: number
  onComplete?: () => void
  className?: string
  cursor?: boolean
}

export function Typewriter({
  text,
  delay = 0,
  speed = 30,
  onComplete,
  className = '',
  cursor = true,
}: TypewriterProps) {
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const count = useMotionValue(0)
  const displayText = useTransform(count, (latest) =>
    text.slice(0, Math.round(latest))
  )
  const [renderedText, setRenderedText] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])

  useEffect(() => {
    if (!started) return

    const controls = animate(count, text.length, {
      type: 'tween',
      duration: text.length * (speed / 1000),
      ease: 'linear',
      onComplete: () => {
        setCompleted(true)
        onComplete?.()
      },
    })

    return () => controls.stop()
  }, [started, text, speed, count, onComplete])

  useEffect(() => {
    const unsubscribe = displayText.on('change', (latest) => {
      setRenderedText(latest)
    })
    return () => unsubscribe()
  }, [displayText])

  return (
    <span className={className}>
      {renderedText}
      {cursor && !completed && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          █
        </motion.span>
      )}
    </span>
  )
}
