'use client'

import { useEffect } from 'react'

export function ElectronProvider() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron) {
      document.documentElement.classList.add('electron')
    }
  }, [])

  return null
}
