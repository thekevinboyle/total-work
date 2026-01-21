import { useState, useCallback } from 'react'
import { Typewriter } from './Typewriter'

interface TypewriterLinesProps {
  lines: string[]
  speed?: number
  lineDelay?: number
  onComplete?: () => void
  className?: string
}

export function TypewriterLines({
  lines,
  speed = 5,
  lineDelay = 50,
  onComplete,
  className = '',
}: TypewriterLinesProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [completedLines, setCompletedLines] = useState<string[]>([])

  const handleLineComplete = useCallback(() => {
    setCompletedLines((prev) => [...prev, lines[currentLine]])

    if (currentLine < lines.length - 1) {
      setTimeout(() => {
        setCurrentLine((prev) => prev + 1)
      }, lineDelay)
    } else {
      onComplete?.()
    }
  }, [currentLine, lines, lineDelay, onComplete])

  return (
    <div className={className}>
      {completedLines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      {currentLine < lines.length && (
        <Typewriter
          text={lines[currentLine]}
          speed={speed}
          cursor={false}
          onComplete={handleLineComplete}
        />
      )}
    </div>
  )
}
