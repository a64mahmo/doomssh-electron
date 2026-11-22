'use client'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Resume } from '@/lib/store/types'
import { MasterTemplate, TemplateFooter, getPageChrome } from './MasterTemplate'
import { paginate, type Insets, type PageLayout, type Region } from '@/lib/pdf/paginate'

const MM_TO_PX = 96 / 25.4
/** Space kept between the last line of a page and its footer, in px (8pt). */
const FOOTER_GAP = 8 * (96 / 72)

export function paperSizePx(resume: Resume) {
  const a4 = resume.settings.paperSize === 'a4'
  return {
    width: (a4 ? 210 : 215.9) * MM_TO_PX,
    height: (a4 ? 297 : 279.4) * MM_TO_PX,
  }
}

interface Layout {
  pages: PageLayout[]
  regions: Region[]
  insets: Insets
  /** Space kept above the bottom margin for the footer, in px. */
  footerReserve: number
}

/**
 * The resume split into real paper-sized pages, for the preview and for print.
 *
 * The template is laid out once, hidden, as one continuous flow. Its lines,
 * entries and keep-together blocks are measured and `paginate` picks where each
 * page ends, per column when there is a sidebar. Every page is then a frame of exact paper size that paints its own
 * background, sidebar panel, border and footer, and shows its slice of the flow
 * through a clipped window inset by the page margins. Each page therefore has
 * its margin on all four sides, whatever the printer does with fragmentation,
 * and each knows its page number.
 */
export function PagedResume({
  resume,
  showPlaceholders,
  pageGap = 0,
  pageClassName,
  onReady,
}: {
  resume: Resume
  showPlaceholders?: boolean
  /** Space between pages on screen, in px. Print uses 0. */
  pageGap?: number
  pageClassName?: string
  /** Called once fonts have loaded and the pages reflect them. */
  onReady?: () => void
}) {
  const measureRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)
  const [layout, setLayout] = useState<Layout | null>(null)
  const [fontsReady, setFontsReady] = useState(false)
  /** Bumped when an image in the flow settles, so readiness is re-checked. */
  const [imagesSettled, setImagesSettled] = useState(0)
  const paper = paperSizePx(resume)
  const chrome = getPageChrome(resume)

  const measure = useCallback(() => {
    const host = measureRef.current
    const root = host?.querySelector<HTMLElement>('[data-resume-page]')
    if (!root) return
    const footerReserve = footerRef.current?.offsetHeight ? footerRef.current.offsetHeight + FOOTER_GAP : 0
    const next = { ...paginate(root, { pageHeight: paper.height, footerReserve }), footerReserve }
    setLayout((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
  }, [paper.height])

  // Re-measure after every render: any edit can move a break.
  useLayoutEffect(() => {
    measure()
  })

  useEffect(() => {
    const host = measureRef.current
    if (!host) return
    let cancelled = false
    // Late fonts and images change line heights without a React render.
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : null
    const root = host.querySelector('[data-resume-page]')
    if (root && observer) observer.observe(root)
    const onLoad = () => {
      measure()
      setImagesSettled((n) => n + 1)
    }
    host.addEventListener('load', onLoad, true)
    host.addEventListener('error', onLoad, true)
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined
    if (fonts?.ready) {
      fonts.ready.then(() => {
        if (cancelled) return
        measure()
        setFontsReady(true)
      })
    } else {
      setFontsReady(true)
    }
    return () => {
      cancelled = true
      observer?.disconnect()
      host.removeEventListener('load', onLoad, true)
      host.removeEventListener('error', onLoad, true)
    }
  }, [measure])

  useEffect(() => {
    if (!fontsReady || !layout || !onReady) return
    // A photo still loading can change the layout; its load (or error)
    // re-measures and brings us back here with the final pages.
    const pending = Array.from(measureRef.current?.querySelectorAll('img') ?? []).some((img) => !img.complete)
    if (!pending) onReady()
  }, [fontsReady, layout, onReady, imagesSettled])

  const pages = layout?.pages ?? [{ slices: [{ start: 0, end: paper.height }] }]
  const regions = layout?.regions ?? [{ left: 0, right: paper.width }]
  const insets = layout?.insets ?? { top: 0, bottom: 0, left: 0, right: 0 }
  const footerReserve = layout?.footerReserve ?? 0

  return (
    <div data-paged-resume style={{ display: 'flex', flexDirection: 'column', gap: pageGap }}>
      {/* The measured flow. Zero-sized and hidden: never painted, never printed. */}
      <div
        aria-hidden
        style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', visibility: 'hidden' }}
      >
        <div ref={measureRef}>
          <MasterTemplate resume={resume} showPlaceholders={showPlaceholders} paged />
        </div>
        <div ref={footerRef} style={{ width: paper.width - insets.left - insets.right }}>
          <TemplateFooter resume={resume} pageNumber={1} paged />
        </div>
      </div>

      {pages.map((page, i) => (
        <div
          key={i}
          data-page
          className={pageClassName}
          style={{
            position: 'relative',
            width: paper.width,
            height: paper.height,
            overflow: 'hidden',
            // One unsplittable sheet. Without size containment, Chromium 132's
            // print layout fragments the clipped flow inside and drops the part
            // of page 1 below the header.
            contain: 'strict',
            flexShrink: 0,
            backgroundColor: chrome.background,
          }}
        >
          {chrome.sidebarPanel && <div aria-hidden style={chrome.sidebarPanel} />}

          {/* Full height on every page: from the top margin (where the columns
              start) to just above the footer. Under the content, so a header
              band heading the main column covers it. */}
          {chrome.divider && regions.length > 1 && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: insets.top,
                bottom: insets.bottom + footerReserve,
                left: regions[1].left,
                width: '0.5pt',
                transform: chrome.divider.mainOnLeft ? 'translateX(-100%)' : undefined,
                backgroundColor: chrome.divider.color,
              }}
            />
          )}

          {/* One window per region: the full width, or one per column so each
              column continues from wherever it broke. */}
          {regions.map((region, r) => {
            const slice = page.slices[r]
            if (!slice) return null
            return (
              <div
                key={r}
                data-page-window
                style={{
                  position: 'absolute',
                  left: region.left,
                  width: region.right - region.left,
                  // The first page shows the flow from its very top, so a band
                  // header still reaches the paper edge; later pages start below
                  // the top margin.
                  top: i === 0 ? 0 : insets.top,
                  height: slice.end - slice.start,
                  overflow: 'clip',
                }}
              >
                <div style={{ position: 'absolute', left: -region.left, top: -slice.start }}>
                  <MasterTemplate resume={resume} showPlaceholders={showPlaceholders} paged />
                </div>
              </div>
            )
          })}

          <div style={{ position: 'absolute', left: insets.left, right: insets.right, bottom: insets.bottom }}>
            <TemplateFooter resume={resume} pageNumber={i + 1} paged />
          </div>

          {chrome.borderColor && (
            <div
              aria-hidden
              style={{ position: 'absolute', inset: 0, border: `12pt solid ${chrome.borderColor}`, pointerEvents: 'none' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
