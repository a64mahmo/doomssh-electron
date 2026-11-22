'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download } from 'lucide-react'
import { useUIStore } from '@/lib/store/uiStore'
import { downloadResumePDF } from '@/lib/utils/export'
import { PagedResume, paperSizePx } from '@/components/web'
import type { Resume } from '@/lib/store/types'
import { cn } from '@/lib/utils'

/** Space between pages in the preview, in px at 100% zoom. */
const PAGE_GAP = 24

// ─── Inner (client-only) ──────────────────────────────────────────────────────

/**
 * Live preview: the same paged HTML that export prints (app/print), re-rendered
 * on every change. Measured at the screen's scale, so on a Retina display a
 * break can occasionally land one line differently from the exported PDF.
 */
function PreviewInner({ resume }: { resume: Resume }) {
  const { previewZoom, setPreviewZoom } = useUIStore()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const { width: pageWidth, height: pageHeight } = paperSizePx(resume)

  // Track the rendered height of all pages (unaffected by the zoom transform).
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setContentHeight(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
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

          {/* Fullscreen covers the page header's Download button, so offer it here instead. */}
          {isFullscreen && (
            <Button
              variant="default"
              size="sm"
              className="h-8 px-4 rounded-xl font-bold text-xs"
              onClick={() => downloadResumePDF(resume)}
            >
              <Download size={14} className="mr-2" />
              Download
            </Button>
          )}
        </div>

        {/* Page */}
        <div className="flex-1 overflow-auto flex items-start justify-center pt-24 pb-12 px-8">
          {/* Sized to the zoomed page so scrolling and centring follow the zoom. */}
          <div
            className="relative shrink-0"
            style={{ width: pageWidth * previewZoom, height: Math.max(contentHeight, pageHeight) * previewZoom }}
          >
            <div
              ref={contentRef}
              className="absolute top-0 left-0"
              style={{ width: pageWidth, transform: `scale(${previewZoom})`, transformOrigin: 'top left' }}
            >
              <PagedResume
                resume={resume}
                showPlaceholders
                pageGap={PAGE_GAP}
                pageClassName="shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] outline outline-1 outline-border/30"
              />
            </div>
          </div>
        </div>

      </div>
    </TooltipProvider>
  )
}

export const PreviewPanel = dynamic(() => Promise.resolve(PreviewInner), { ssr: false })
