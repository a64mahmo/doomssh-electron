'use client'
import { useState, useEffect } from 'react'
import { RichTextArea } from '../editor/RichTextArea'

interface DebouncedRichTextAreaProps extends React.ComponentProps<typeof RichTextArea> {
  debounceTime?: number
}

export function DebouncedRichTextArea({ 
  value, 
  onChange, 
  debounceTime = 500, 
  ...props 
}: DebouncedRichTextAreaProps) {
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
    <RichTextArea
      {...props}
      value={localValue}
      onChange={setLocalValue}
    />
  )
}
