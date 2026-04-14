'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download, Loader2 } from 'lucide-react'
import { useUIStore } from '@/lib/store/uiStore'
import { downloadResumePDF } from '@/lib/utils/export'
import type { Resume } from '@/lib/store/types'
import { cn } from '@/lib/utils'

// ─── Inner (client-only) ──────────────────────────────────────────────────────

function PreviewInner({ resume }: { resume: Resume }) {
  const { previewZoom, setPreviewZoom } = useUIStore()
  const [isFullscreen, setIsFullscreen]   = useState(false)
  const [blobUrl, setBlobUrl]             = useState<string | null>(null)
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const debounceRef                       = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevUrlRef                        = useRef<string | null>(null)

  // Regenerate the PDF blob whenever the resume changes (debounced 500 ms)
  useEffect(() => {
    if (!resume?.sections?.length) return // Don't render if resume not ready
    
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true)
        setError(null)

        // Lazy-import so the heavy @react-pdf bundle is never loaded server-side
        const [{ pdf }, { ResumePDF }] = await Promise.all([
          import('@react-pdf/renderer'),
          import('@/components/pdf/ResumePDF'),
        ])

        const blob = await pdf(<ResumePDF resume={resume} />).toBlob()
        const url  = URL.createObjectURL(blob)

        // Revoke the previous URL before replacing it
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
        prevUrlRef.current = url
        setBlobUrl(url)
      } catch (err) {
        console.error('PDF render error:', err)
        setError(err instanceof Error ? err.message : 'Render failed')
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [resume])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
    }
  }, [])

  const handleZoom = (delta: number) =>
    setPreviewZoom(Number(Math.min(2, Math.max(0.3, previewZoom + delta)).toFixed(2)))
  const resetZoom = () => setPreviewZoom(1)

  return (
    <TooltipProvider>
      <div className={cn(
        'flex flex-col h-full bg-[#f4f4f5] dark:bg-[#09090b] relative overflow-hidden preview-area',
        isFullscreen && 'fixed inset-0 z-50',
      )}>

        {/* Floating toolbar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-1 border-r border-border/50 pr-2">
            <Tooltip>
              <TooltipTrigger aria-label="Zoom out" className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-accent transition-colors" onClick={() => handleZoom(-0.1)}>
                <ZoomOut size={16} />
              </TooltipTrigger>
              <TooltipContent>Zoom out</TooltipContent>
            </Tooltip>
            <button
              onClick={resetZoom}
              className="px-2 h-8 text-xs font-bold min-w-[50px] tabular-nums hover:bg-muted rounded-lg transition-colors"
            >
              {Math.round(previewZoom * 100)}%
            </button>
            <Tooltip>
              <TooltipTrigger aria-label="Zoom in" className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-accent transition-colors" onClick={() => handleZoom(0.1)}>
                <ZoomIn size={16} />
              </TooltipTrigger>
              <TooltipContent>Zoom in</TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="h-8 w-8 mr-1 inline-flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsFullscreen(v => !v)}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </TooltipTrigger>
            <TooltipContent>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</TooltipContent>
          </Tooltip>

          <Button
            variant="default"
            size="sm"
            className="h-8 px-4 rounded-xl font-bold text-xs"
            onClick={() => downloadResumePDF(resume)}
          >
            <Download size={14} className="mr-2" />
            Export
          </Button>
        </div>

        {/* PDF iframe */}
        <div className="flex-1 overflow-auto flex items-start justify-center pt-24 pb-12 px-8">
          <div
            className="relative shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] rounded-[1px] overflow-hidden bg-white border border-border/30"
            style={{
              width:     `calc(${resume.settings.paperSize === 'a4' ? '210mm' : '216mm'} * ${previewZoom})`,
              minHeight: `calc(${resume.settings.paperSize === 'a4' ? '297mm' : '279mm'} * ${previewZoom})`,
            }}
          >
            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={24} className="animate-spin text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">Rendering…</p>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <p className="text-xs text-destructive text-center">{error}</p>
              </div>
            )}

            {/* PDF */}
            {blobUrl && (
              <iframe
                key={blobUrl}
                src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                style={{
                  width:     `calc(${resume.settings.paperSize === 'a4' ? '210mm' : '216mm'} * ${previewZoom})`,
                  minHeight: `calc(${resume.settings.paperSize === 'a4' ? '297mm' : '279mm'} * ${previewZoom})`,
                  border:    'none',
                  display:   'block',
                }}
                title="Resume preview"
              />
            )}
          </div>
        </div>

      </div>
    </TooltipProvider>
  )
}

export const PreviewPanel = dynamic(() => Promise.resolve(PreviewInner), { ssr: false })