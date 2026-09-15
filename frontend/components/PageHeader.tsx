'use client'

import { useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

/**
 * Top bar shared by the dashboard pages (Resumes, Cover Letters, Job Tracker):
 * page title on the left, actions on the right. Keeps the Electron window-drag
 * region and the Windows title-bar padding in one place.
 */
const noopSubscribe = () => () => {}

export function PageHeader({ title, children, className }: {
  title: string
  children?: React.ReactNode
  className?: string
}) {
  // The platform never changes at runtime; false during the static export.
  const isWin = useSyncExternalStore(
    noopSubscribe,
    () => window.electron?.platform === 'win32',
    () => false,
  )

  return (
    <header
      className={cn(
        'h-11 flex items-center justify-between gap-3 px-4 border-b border-border shrink-0 bg-background drag',
        isWin && 'win32-padding',
        className,
      )}
    >
      <h1 className="text-sm font-semibold tracking-tight truncate min-w-0 no-drag">{title}</h1>
      {children && <div className="no-drag shrink-0 flex items-center gap-2">{children}</div>}
    </header>
  )
}
