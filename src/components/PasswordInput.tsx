// src/components/PasswordInput.tsx
import { useState, useCallback, useRef, useEffect } from 'react'
import './PasswordInput.css'

interface PasswordInputProps {
  onSuccess: () => void
  password: string
}

export function PasswordInput({ onSuccess, password }: PasswordInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (value.toLowerCase() === password.toLowerCase()) {
        onSuccess()
      } else {
        setError(true)
        setValue('')
        setTimeout(() => setError(false), 1000)
      }
    },
    [value, password, onSuccess]
  )

  return (
    <form onSubmit={handleSubmit} className="password-form">
      <span className="password-prompt">&gt; </span>
      <span className="password-label">ENTER PASSWORD: </span>
      <input
        ref={inputRef}
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`password-input ${error ? 'password-input--error' : ''}`}
        autoComplete="off"
        spellCheck={false}
      />
      <span className="password-cursor">█</span>
    </form>
  )
}
