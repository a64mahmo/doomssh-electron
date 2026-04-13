'use client'
import { useState, useEffect } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface DebouncedInputProps {
  value: string
  onChange?: (value: string) => void
  debounceTime?: number
  className?: string
  placeholder?: string
}

export function DebouncedInput({ 
  value, 
  onChange, 
  debounceTime = 500,
  className,
  placeholder,
}: DebouncedInputProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    if (localValue === value) return

    const handler = setTimeout(() => {
      onChange?.(localValue)
    }, debounceTime)

    return () => clearTimeout(handler)
  }, [localValue, value, debounceTime])

  return (
    <Input
      className={className}
      placeholder={placeholder}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  )
}
