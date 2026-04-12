'use client'
import { useEffect } from 'react'
import { useUIStore } from '@/lib/store/uiStore'
import { useResumeStore } from '@/lib/store/resumeStore'
import { toast } from 'sonner'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DebugToast() {
  const errors = useUIStore((state) => state.errors)
  const clearErrors = useUIStore((state) => state.clearErrors)
  const globalDebugMode = useUIStore((state) => state.globalDebugMode)
  const perResumeDebugMode = useResumeStore((state) => state.resume?.settings.debugMode ?? false)
  const debugMode = globalDebugMode || perResumeDebugMode

  useEffect(() => {
    if (debugMode && errors.length > 0) {
      toast.error('System Errors Detected', {
        description: (
          <div className="mt-2 space-y-1">
            {errors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] font-mono leading-tight bg-destructive/10 p-1.5 rounded border border-destructive/20">
                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{err}</span>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearErrors()}
              className="mt-2 h-7 text-[10px] w-full"
            >
              Clear All Errors
            </Button>
          </div>
        ),
        duration: Infinity,
        action: {
          label: 'Clear',
          onClick: () => clearErrors(),
        },
      })
    }
  }, [errors, debugMode, clearErrors])

  return null
}
