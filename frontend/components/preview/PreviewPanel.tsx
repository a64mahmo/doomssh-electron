'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ZoomIn, ZoomOut, Download } from 'lucide-react'
import { useUIStore } from '@/lib/store/uiStore'
import { downloadResumePDF } from '@/lib/utils/export'
import { MasterTemplate, TemplateFooter } from '@/components/templates'
import type { Resume } from '@/lib/store/types'

// Page dimensions at 96 dpi (1 mm = 3.7795 px)
const PAGE_W = { a4: 793.7, letter: 816 }
const PAGE_H = { a4: 1122.5, letter: 1056 }

// ─── Page-break algorithm ─────────────────────────────────────────────────────
function computePads(pageRoot: HTMLElement, pageH: number): number[] {
  const sections = Array.from(
    pageRoot.querySelectorAll('[data-section]')
  ) as HTMLElement[]

  if (sections.length === 0) return []

  const rootRect = pageRoot.getBoundingClientRect()
  const pads: number[] = []
  let accumulated = 0

  for (const el of sections) {
    const rect = el.getBoundingClientRect()
    const top    = rect.top - rootRect.top
    const height = rect.height
    const adjustedTop  = top + accumulated
    const posOnPage    = adjustedTop % pageH

    if (posOnPage > 1 && height < pageH && posOnPage + height > pageH) {
      const pad = pageH - posOnPage
      pads.push(pad)
      accumulated += pad
    } else {
      pads.push(0)
    }
  }
  return pads
}

function arePadsEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 0.5) return false
  return true
}

// ─── Template wrappers ────────────────────────────────────────────────────────

function TemplateClean({ resume }: { resume: Resume }) {
  // isMeasurement uses minHeight: auto and removes extra padding for precise height measurement
  return <MasterTemplate resume={resume} hideFooter isMeasurement />
}

function TemplateWithPads({ resume, pads }: { resume: Resume; pads: number[] }) {
  // Actual rendering keeps minHeight so background color fills the page sheet
  return <MasterTemplate resume={resume} pads={pads} hideFooter />
}

// ─── Main component ───────────────────────────────────────────────────────────

function PreviewInner({ resume }: { resume: Resume }) {
  const { previewZoom, setPreviewZoom } = useUIStore()

  const size = resume.settings.paperSize === 'a4' ? 'a4' : 'letter'
  const w    = PAGE_W[size]
  const h    = PAGE_H[size]

  const measureRef = useRef<HTMLDivElement>(null)
  const [naturalH, setNaturalH] = useState(h)
  const [pads, setPads]         = useState<number[]>([])

  useEffect(() => {
    const el = measureRef.current
    if (!el) return

    function update() {
      const pageRoot = el!.firstElementChild as HTMLElement | null
      if (!pageRoot || pageRoot.scrollHeight === 0) return

      setNaturalH(pageRoot.scrollHeight)
      const next = computePads(pageRoot, h)
      setPads(prev => arePadsEqual(prev, next) ? prev : next)
    }

    const ro = new ResizeObserver(update)
    ro.observe(el)
    update()
    return () => ro.disconnect()
  }, [resume, h])

  // Calculate pages based on natural content height + shifts from page breaks
  const totalPads = pads.reduce((acc, p) => acc + p, 0)
  // Use a 20px tolerance to avoid ghost pages from tiny overflows or padding
  const numPages = Math.max(1, Math.ceil((naturalH + totalPads - 20) / h))

  return (
    <div className="flex flex-col h-full bg-zinc-100 dark:bg-zinc-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 h-10 bg-background border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="icon" className="h-6 w-6"
            onClick={() => setPreviewZoom(Math.max(0.3, previewZoom - 0.1))}
          >
            <ZoomOut size={13} />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center tabular-nums">
            {Math.round(previewZoom * 100)}%
          </span>
          <Button
            variant="ghost" size="icon" className="h-6 w-6"
            onClick={() => setPreviewZoom(Math.min(1.5, previewZoom + 0.1))}
          >
            <ZoomIn size={13} />
          </Button>
        </div>
        <Tooltip>
          <TooltipTrigger
            render={<Button size="icon" className="h-6 w-6" onClick={() => downloadResumePDF(resume)} />}
          >
            <Download size={12} />
          </TooltipTrigger>
          <TooltipContent side="left">Download PDF</TooltipContent>
        </Tooltip>
      </div>

      <div
        aria-hidden
        ref={measureRef}
        style={{
          position:      'absolute',
          visibility:    'hidden',
          pointerEvents: 'none',
          top:           0,
          left:          0,
          width:         w,
          zIndex:        -1,
        }}
      >
        <TemplateClean resume={resume} />
      </div>

      {/* Scrollable page stack */}
      <div className="flex-1 overflow-auto" style={{ overscrollBehavior: 'contain' }}>
        <div className="flex flex-col items-center py-8 gap-6 px-6">
          {Array.from({ length: numPages }).map((_, i) => (
            <div
              key={i}
              style={{
                width:      w * previewZoom,
                height:     h * previewZoom,
                flexShrink: 0,
                position:   'relative',
                overflow:   'hidden',
                boxShadow:  '0 4px 32px rgba(0,0,0,0.18)',
                borderRadius: 2,
                background: '#fff',
              }}
            >
              <div style={{
                position:        'absolute',
                top:             -(i * h * previewZoom),
                left:            0,
                width:           w,
                transformOrigin: 'top left',
                transform:       `scale(${previewZoom})`,
              }}>
                <TemplateWithPads resume={resume} pads={pads} />
              </div>

              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                width: w,
                transformOrigin: 'bottom left',
                transform: `scale(${previewZoom})`,
              }}>
                <TemplateFooter resume={resume} pageNumber={i + 1} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const PreviewPanel = dynamic(() => Promise.resolve(PreviewInner), { ssr: false })
