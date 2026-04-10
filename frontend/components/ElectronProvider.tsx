'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function ElectronProvider() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.electron) return

    document.documentElement.classList.add('electron')

    const unsubAvailable = window.electron.onUpdateAvailable((info) => {
      toast.info(`Update available: v${info.version} is downloading…`, {
        duration: 10000,
      })
    })

    const unsubDownloaded = window.electron.onUpdateDownloaded((info) => {
      toast.success(`Update ready: v${info.version}`, {
        action: {
          label: 'Restart & Install',
          onClick: () => window.electron?.restartAndInstall(),
        },
        duration: Infinity,
      })
    })

    return () => {
      unsubAvailable()
      unsubDownloaded()
    }
  }, [])

  return null
}
