'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { useUIStore } from '@/lib/store/uiStore'

export function ElectronProvider() {
  const { setUpdateStatus, setUpdateProgress, setUpdateVersion } = useUIStore()

  useEffect(() => {
    if (typeof window === 'undefined' || !window.electron) return

    document.documentElement.classList.add('electron')
    document.documentElement.classList.add(`electron-${window.electron.platform}`)

    const unsubChecking = window.electron.onUpdateChecking(() => {
      setUpdateStatus('checking')
    })

    const unsubAvailable = window.electron.onUpdateAvailable((info) => {
      setUpdateStatus('available')
      setUpdateVersion(info.version)
      toast.info(`Update available: v${info.version} is downloading…`, {
        id: 'app-update',
        duration: 5000,
      })
    })

    const unsubNotAvailable = window.electron.onUpdateNotAvailable(() => {
      setUpdateStatus('not-available')
      // Reset to idle after a while
      setTimeout(() => setUpdateStatus('idle'), 5000)
    })

    const unsubProgress = window.electron.onUpdateProgress((progress) => {
      setUpdateStatus('downloading')
      setUpdateProgress(progress.percent)
    })

    const unsubDownloaded = window.electron.onUpdateDownloaded((info) => {
      setUpdateStatus('downloaded')
      setUpdateVersion(info.version)
      toast.success(`Update ready: v${info.version}`, {
        id: 'app-update',
        action: {
          label: 'Restart & Install',
          onClick: () => window.electron?.restartAndInstall(),
        },
        duration: Infinity,
      })
    })

    const unsubError = window.electron.onUpdateError((error) => {
      setUpdateStatus('error')
      toast.error(`Update error: ${error}`, {
        id: 'app-update',
      })
      setTimeout(() => setUpdateStatus('idle'), 5000)
    })

    return () => {
      unsubChecking()
      unsubAvailable()
      unsubNotAvailable()
      unsubProgress()
      unsubDownloaded()
      unsubError()
    }
  }, [setUpdateStatus, setUpdateProgress, setUpdateVersion])

  return null
}
