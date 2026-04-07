'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Maximize2, 
  Minimize2, 
  Layout, 
  FileText,
} from 'lucide-react'
import { useUIStore } from '@/lib/store/uiStore'
import { downloadResumePDF } from '@/lib/utils/export'
import { MasterTemplate, TemplateFooter } from '@/components/templates'
import type { Resume, ResumeSection } from '@/lib/store/types'
import { cn } from '@/lib/utils'

// Page dimensions at 96 dpi (1 mm = 3.7795 px)
const PAGE_W = { a4: 793.7, letter: 816 }
const PAGE_H = { a4: 1122.5, letter: 1056 }

interface PageData {
  sections: ResumeSection[]
  hasHeader: boolean
}

// ─── Main component ───────────────────────────────────────────────────────────

function PreviewInner({ resume }: { resume: Resume }) {
  const { previewZoom, setPreviewZoom } = useUIStore()
  const [viewMode, setViewMode] = useState<'stack' | 'grid'>('stack')
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const [pages, setPages] = useState<PageData[]>([{ sections: [], hasHeader: true }])
  const measureRef = useRef<HTMLDivElement>(null)

  const size = resume.settings.paperSize === 'a4' ? 'a4' : 'letter'
  const w    = PAGE_W[size]
  const h    = PAGE_H[size]

  const runPagination = useCallback(() => {
    const el = measureRef.current
    if (!el) return

    // 1. Find all sections and their bounding boxes in the "natural" flow
    const sectionEls = Array.from(el.querySelectorAll('[data-section]')) as HTMLElement[]
    const headerEl = el.querySelector('[data-header]') as HTMLElement | null
    const rootRect = el.firstElementChild?.getBoundingClientRect()
    if (!rootRect) return

    // 2. Identify which page each section belongs to
    // We use the center point of each section to decide its page
    const newPages: PageData[] = []
    const visibleSections = resume.sections.filter(s => s.visible !== false && s.type !== 'header')
    
    // Group sections by their page index calculated from their 'natural' top position
    const pageGroups: Record<number, ResumeSection[]> = {}
    let maxPage = 0

    sectionEls.forEach((secEl, idx) => {
      const rect = secEl.getBoundingClientRect()
      const top = rect.top - rootRect.top
      const center = top + rect.height / 2
      const pageIdx = Math.floor(center / h)
      
      if (!pageGroups[pageIdx]) pageGroups[pageIdx] = []
      
      // Match element to section object by ID (stored in key)
      // Since they are rendered in order, we can use the index
      const section = visibleSections[idx]
      if (section) {
        pageGroups[pageIdx].push(section)
        if (pageIdx > maxPage) maxPage = pageIdx
      }
    })

    // 3. Construct the page data
    for (let i = 0; i <= maxPage; i++) {
      newPages.push({
        sections: pageGroups[i] || [],
        hasHeader: i === 0 // Only the first page gets the header in this model
      })
    }

    // Fallback for empty resume
    if (newPages.length === 0) {
      newPages.push({ sections: [], hasHeader: true })
    }

    setPages(newPages)
  }, [resume, h])

  useEffect(() => {
    const timer = setTimeout(runPagination, 100)
    return () => clearTimeout(timer)
  }, [resume, runPagination])

  const handleZoom = (delta: number) => {
    setPreviewZoom(Number(Math.min(2, Math.max(0.2, previewZoom + delta)).toFixed(2)))
  }

  const resetZoom = () => setPreviewZoom(0.8)

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full bg-[#f4f4f5] dark:bg-[#09090b] transition-colors relative overflow-hidden",
        isFullscreen && "fixed inset-0 z-50"
      )}>
        {/* Floating Toolbar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-1 border-r border-border/50 pr-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleZoom(-0.1)}>
              <ZoomOut size={16} />
            </Button>
            <button onClick={resetZoom} className="px-2 h-8 text-xs font-bold min-w-[50px] tabular-nums hover:bg-muted rounded-lg transition-colors">
              {Math.round(previewZoom * 100)}%
            </button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleZoom(0.1)}>
              <ZoomIn size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-1 border-r border-border/50 pr-2">
            <Button variant={viewMode === 'stack' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('stack')}>
              <FileText size={16} />
            </Button>
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}>
              <Layout size={16} />
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>

          <Button variant="default" size="sm" className="h-8 px-4 rounded-xl font-bold text-xs" onClick={() => downloadResumePDF(resume)}>
            <Download size={14} className="mr-2" />
            Export
          </Button>
        </div>

        {/* Hidden Measurement Area - Renders the WHOLE resume once */}
        <div
          aria-hidden
          ref={measureRef}
          className="absolute invisible pointer-events-none top-0 left-0"
          style={{ width: w, zIndex: -1 }}
        >
          <MasterTemplate resume={resume} hideFooter isMeasurement />
        </div>

        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-auto py-24 px-8 scroll-smooth">
          <div className={cn(
            "mx-auto transition-all duration-500",
            viewMode === 'stack' ? "flex flex-col items-center gap-12" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-center"
          )}>
            {pages.map((page, i) => (
              <div
                key={i}
                className="relative group shrink-0"
                style={{ width: w * previewZoom, height: h * previewZoom }}
              >
                <div className="absolute -top-6 left-0 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                  Page {i + 1}
                </div>

                <div className="w-full h-full bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-border/50 rounded-[1px] overflow-hidden relative">
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: w,
                    height: h,
                    transform: `scale(${previewZoom})`,
                    transformOrigin: 'top left',
                  }}>
                    <MasterTemplate 
                      resume={resume} 
                      hideFooter 
                      hideHeader={!page.hasHeader}
                      sectionsOverride={page.sections}
                    />
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: w,
                    transform: `scale(${previewZoom})`,
                    transformOrigin: 'bottom left',
                  }}>
                    <TemplateFooter resume={resume} pageNumber={i + 1} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 right-8 px-4 py-2 bg-background/80 backdrop-blur border border-border rounded-full shadow-lg pointer-events-none">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
          </p>
        </div>
      </div>
    </TooltipProvider>
  )
}

export const PreviewPanel = dynamic(() => Promise.resolve(PreviewInner), { ssr: false })
