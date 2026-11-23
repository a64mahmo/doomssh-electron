'use client'
import { Component, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PagedResume } from '@/components/web'
import type { Resume } from '@/lib/store/types'
import { cn } from '@/lib/utils'

/** Wheel travel (px of horizontal scroll) that turns one page. */
const SWIPE_THRESHOLD = 40
/** Pause after a turn so one trackpad swipe moves one page, not five. */
const SWIPE_COOLDOWN_MS = 350

/**
 * A live, scaled-down copy of a resume or cover letter: the same paged HTML the
 * preview and PDF use, so it always matches what you'd download. Pages turn
 * like Quick Look: arrows on hover, a horizontal swipe, or ← → when the card
 * has focus (the card owns the keys and drives `page`).
 *
 * Rendering is deferred until the card nears the viewport and then kept, so a
 * long dashboard doesn't lay out every document up front.
 */
export function DocumentThumbnail({
  resume,
  page,
  onPageChange,
  onPageCount,
  className,
}: {
  resume: Resume
  page: number
  onPageChange: (page: number) => void
  onPageCount?: (count: number) => void
  className?: string
}) {
  const boxRef = useRef<HTMLDivElement | null>(null)
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  // No IntersectionObserver (old engines, tests): render straight away.
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')
  const [boxWidth, setBoxWidth] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const paper = paperOf(resume)
  // A file missing its settings or sections can't be laid out; show the skeleton.
  const renderable = Boolean(resume.settings && Array.isArray(resume.sections))
  const scale = boxWidth ? boxWidth / paper.width : 0
  const current = Math.min(page, pageCount - 1)

  // Mount the document once the card is near the viewport.
  useEffect(() => {
    const el = boxRef.current
    if (!el || visible) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  // Scale to the sheet's width (the sheet is fitted inside the card's frame).
  useEffect(() => {
    const el = sheetRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setBoxWidth(el.clientWidth))
    ro.observe(el)
    setBoxWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Count pages from the stacked page frames (gap 0, so height / page height).
  useEffect(() => {
    const el = contentRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const update = () => {
      const count = Math.max(1, el.querySelectorAll('[data-page]').length)
      setPageCount((prev) => (prev === count ? prev : count))
    }
    const ro = new ResizeObserver(update)
    ro.observe(el)
    update()
    return () => ro.disconnect()
  }, [visible, scale > 0]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onPageCount?.(pageCount)
    if (page > pageCount - 1) onPageChange(pageCount - 1)
  }, [pageCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // Horizontal trackpad swipe turns pages. Native listener: React's wheel
  // handler is passive, and the default (history swipe) must be stopped.
  const latest = useRef({ current, pageCount, onPageChange })
  useLayoutEffect(() => {
    latest.current = { current, pageCount, onPageChange }
  })
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    let travel = 0
    let lockedUntil = 0
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      const { current, pageCount, onPageChange } = latest.current
      if (pageCount < 2) return
      e.preventDefault()
      const now = Date.now()
      if (now < lockedUntil) return
      travel += e.deltaX
      if (Math.abs(travel) < SWIPE_THRESHOLD) return
      const next = Math.min(pageCount - 1, Math.max(0, current + (travel > 0 ? 1 : -1)))
      travel = 0
      lockedUntil = now + SWIPE_COOLDOWN_MS
      if (next !== current) onPageChange(next)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const turn = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation()
    onPageChange(Math.min(pageCount - 1, Math.max(0, current + delta)))
  }

  return (
    // Every card has the same Letter-shaped frame, whatever the paper, so the
    // grid stays even; an A4 sheet fits by height with slim gutters either side.
    <div
      ref={boxRef}
      className={cn('group/thumb relative w-full overflow-hidden bg-muted/60', CARD_FRAME_ASPECT, className)}
    >
      <div
        ref={sheetRef}
        className="relative h-full mx-auto overflow-hidden bg-white"
        style={{ aspectRatio: `${paper.width} / ${paper.height}`, maxWidth: '100%' }}
      >
      {visible && renderable && scale > 0 ? (
        <div
          aria-hidden
          inert
          className="absolute top-0 left-0 pointer-events-none select-none"
          style={{
            width: paper.width,
            transformOrigin: 'top left',
            transform: `scale(${scale}) translateY(${-current * paper.height}px)`,
            transition: 'transform 260ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div ref={contentRef}>
            <ThumbnailBoundary>
              <PagedResume resume={resume} showPlaceholders pageGap={0} />
            </ThumbnailBoundary>
          </div>
        </div>
      ) : (
        <ThumbnailSkeleton />
      )}
      </div>

      {pageCount > 1 && (
        <>
          <PageArrow side="left" disabled={current === 0} onClick={(e) => turn(e, -1)} />
          <PageArrow side="right" disabled={current === pageCount - 1} onClick={(e) => turn(e, 1)} />
          <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium tabular-nums text-white backdrop-blur-sm opacity-0 group-hover/thumb:opacity-100 group-focus-visible/card:opacity-100 transition-opacity">
              {Array.from({ length: Math.min(pageCount, 8) }, (_, i) => (
                <span
                  key={i}
                  className={cn('h-1.5 w-1.5 rounded-full transition-colors', i === current ? 'bg-white' : 'bg-white/35')}
                />
              ))}
              <span className="ml-0.5">{current + 1} / {pageCount}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const MM_TO_PX = 96 / 25.4

/** The shape of every dashboard card's page frame: US Letter, the default paper. */
export const CARD_FRAME_ASPECT = 'aspect-[8.5/11]'

/** Like paperSizePx, but tolerates a document with no settings. */
function paperOf(resume: Resume) {
  const a4 = resume.settings?.paperSize === 'a4'
  return { width: (a4 ? 210 : 215.9) * MM_TO_PX, height: (a4 ? 297 : 279.4) * MM_TO_PX }
}

/** One broken document must not take the whole dashboard down. */
class ThumbnailBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.warn('[thumbnail] could not render document:', err)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function PageArrow({ side, disabled, onClick }: {
  side: 'left' | 'right'
  disabled: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={side === 'left' ? 'Previous page' : 'Next page'}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full',
        'bg-black/55 text-white backdrop-blur-sm shadow-md transition-opacity',
        'opacity-0 group-hover/thumb:opacity-100 disabled:!opacity-0 disabled:pointer-events-none',
        side === 'left' ? 'left-1.5' : 'right-1.5',
      )}
    >
      <Icon size={15} />
    </button>
  )
}

function ThumbnailSkeleton() {
  return (
    <div aria-hidden className="absolute inset-0 p-[10%] flex flex-col gap-[4%]">
      <div className="mx-auto h-[3%] w-1/2 rounded-full bg-zinc-200" />
      <div className="mx-auto h-[2%] w-1/3 rounded-full bg-zinc-100 mb-[3%]" />
      {Array.from({ length: 10 }, (_, j) => (
        <div key={j} className="h-[1.5%] rounded-full bg-zinc-100" style={{ width: `${55 + (j * 13) % 40}%` }} />
      ))}
    </div>
  )
}
