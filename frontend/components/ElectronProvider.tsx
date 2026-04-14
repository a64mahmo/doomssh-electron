'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { useUIStore } from '@/lib/store/uiStore'

export function ElectronProvider() {
  const { setUpdateStatus, setUpdateProgress, setUpdateVersion, setUpdateError, globalDebugMode } = useUIStore()

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
      setUpdateError(null)
      toast.info(`Update available: v${info.version} is downloading…`, {
        id: 'app-update',
        duration: 5000,
      })
    })

    const unsubNotAvailable = window.electron.onUpdateNotAvailable(() => {
      setUpdateStatus('not-available')
      setUpdateError(null)
      setTimeout(() => setUpdateStatus('idle'), 5000)
    })

    const unsubProgress = window.electron.onUpdateProgress((progress) => {
      setUpdateStatus('downloading')
      setUpdateProgress(progress.percent)
    })

    const unsubDownloaded = window.electron.onUpdateDownloaded((info) => {
      setUpdateStatus('downloaded')
      setUpdateVersion(info.version)
      setUpdateError(null)
      toast.success(`Update ready: v${info.version}`, {
        id: 'app-update',
        action: {
          label: 'Restart & Install',
          onClick: () => window.electron?.restartAndInstall(),
        },
        duration: Infinity,
      })
    })

    const unsubError = window.electron.onUpdateError((errorStr) => {
      setUpdateStatus('error')
      // Try to parse JSON error, otherwise use as-is
      let errorMsg = errorStr
      try {
        const parsed = JSON.parse(errorStr)
        errorMsg = parsed.message || errorStr
        // Store full debug info only when bug mode is on
        if (globalDebugMode) {
          setUpdateError(JSON.stringify(parsed, null, 2))
        } else {
          setUpdateError(null)
        }
      } catch {
        errorMsg = errorStr
        setUpdateError(globalDebugMode ? errorStr : null)
      }
      toast.error(`Update error: ${errorMsg}`, {
        id: 'app-update',
      })
      setTimeout(() => setUpdateStatus('idle'), 8000)
    })

    return () => {
      unsubChecking()
      unsubAvailable()
      unsubNotAvailable()
      unsubProgress()
      unsubDownloaded()
      unsubError()
    }
  }, [setUpdateStatus, setUpdateProgress, setUpdateVersion, setUpdateError, globalDebugMode])

  return null
}
