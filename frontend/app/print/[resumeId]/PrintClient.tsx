'use client'
import { useCallback, useEffect, useRef, useState, use } from 'react'
import { useSearchParams } from 'next/navigation'
import { getResume } from '@/lib/db/database'
import { PagedResume } from '@/components/web'
import type { Resume } from '@/lib/store/types'

declare global {
  interface Window {
    /** Handed over by the Electron export window (or a test) instead of a vault read. */
    __DOOMSSH_PRINT_RESUME__?: Resume
  }
}

/**
 * The resume as Chromium lays it out for paper. Two modes:
 *  - default: opens the print dialog (web "Save as PDF").
 *  - ?mode=export: rendered in a hidden window and captured with printToPDF, so
 *    no dialog; sets html[data-print-ready] once fonts and layout have settled.
 */
export function PrintClient({ params }: { params: Promise<{ resumeId: string }> }) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const resumeId = searchParams.get('id') || resolvedParams.resumeId
  const exportMode = searchParams.get('mode') === 'export'
  const printedRef = useRef(false)
  const [resume, setResume] = useState<Resume | null>(() =>
    exportMode && typeof window !== 'undefined' ? window.__DOOMSSH_PRINT_RESUME__ ?? null : null,
  )

  useEffect(() => {
    if (exportMode) {
      // The export window may inject the resume after this page has mounted.
      const take = () => {
        if (window.__DOOMSSH_PRINT_RESUME__) setResume(window.__DOOMSSH_PRINT_RESUME__)
      }
      window.addEventListener('doomssh:print-resume', take)
      // The resume may have arrived between the first render and this effect,
      // with its event dispatched before the listener existed.
      take()
      return () => window.removeEventListener('doomssh:print-resume', take)
    }
    getResume(resumeId).then((r) => {
      if (r) setResume(r)
    })
  }, [resumeId, exportMode])

  // Once the pages reflect the loaded fonts, give layout two frames to settle.
  const handleReady = useCallback(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (exportMode) document.documentElement.dataset.printReady = 'true'
      else if (!printedRef.current) {
        printedRef.current = true
        window.print()
      }
    }))
  }, [exportMode])

  if (!resume) {
    return <div style={{ padding: 32, fontFamily: 'sans-serif' }}>Loading…</div>
  }

  const s = resume.settings

  return (
    <>
      <style>{`
        /* Every page frame paints its own margins, background and footer, so
           the paper has no margin and each frame is exactly one sheet. */
        @page {
          size: ${s.paperSize === 'a4' ? 'A4' : 'letter'};
          margin: 0;
        }
        html, body { margin: 0; padding: 0; background: ${s.backgroundColor}; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        [data-page]:not(:last-child) { break-after: page; }
      `}</style>
      <PagedResume resume={resume} onReady={handleReady} />
    </>
  )
}
