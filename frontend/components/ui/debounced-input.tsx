'use client'
import { useState, useEffect } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface DebouncedInputProps extends React.ComponentProps<typeof Input> {
  debounceTime?: number
}

export function DebouncedInput({ 
  value, 
  onChange, 
  debounceTime = 500, 
  ...props 
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
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  )
}
