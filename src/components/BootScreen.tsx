// src/components/BootScreen.tsx
import { Typewriter } from './Typewriter'
import './BootScreen.css'

interface BootScreenProps {
  onComplete?: () => void
}

export function BootScreen({ onComplete }: BootScreenProps) {
  return (
    <div className="boot-screen">
      <Typewriter
        text="Hello! Press any key to continue."
        speed={40}
        onComplete={onComplete}
      />
    </div>
  )
}
