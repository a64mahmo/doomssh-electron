'use client'
import { useEffect, useState, use } from 'react'
import { useSearchParams } from 'next/navigation'
import { getResume } from '@/lib/db/database'
import { MasterTemplate } from '@/components/web'
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
      return () => window.removeEventListener('doomssh:print-resume', take)
    }
    getResume(resumeId).then((r) => {
      if (r) setResume(r)
    })
  }, [resumeId, exportMode])

  useEffect(() => {
    if (!resume) return
    let cancelled = false
    document.fonts.ready.then(() => {
      // Two frames so layout has settled with the loaded fonts.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (cancelled) return
        if (exportMode) document.documentElement.dataset.printReady = 'true'
        else window.print()
      }))
    })
    return () => { cancelled = true }
  }, [resume, exportMode])

  if (!resume) {
    return <div style={{ padding: 32, fontFamily: 'sans-serif' }}>Loading…</div>
  }

  const s = resume.settings
  const hasFooter = s.footerPageNumbers || s.footerEmail || s.footerName

  return (
    <>
      <style>{`
        /* The template's own padding is the page margin, cloned onto every page,
           so the paper margin is zero. Full-bleed bands and panels need that. */
        @page {
          size: ${s.paperSize === 'a4' ? 'A4' : 'letter'};
          margin: 0;
        }
        html, body { margin: 0; padding: 0; background: ${s.backgroundColor}; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          [data-resume-page] {
            /* A full-page min-height plus the cloned padding spills onto a blank page. */
            min-height: auto !important;
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
            ${hasFooter ? `padding-bottom: calc(${s.marginVertical}mm + 24pt) !important;` : ''}
          }
          /* Fixed elements repeat on every printed page. */
          [data-sidebar-panel] { position: fixed !important; }
          [data-footer-fixed] {
            position: fixed;
            left: ${s.marginHorizontal}mm;
            right: ${s.marginHorizontal}mm;
            bottom: ${s.marginVertical}mm;
            padding-bottom: 0 !important;
          }
          /* Page breaks: headings stay with what follows, an entry's head stays
             with its first line, and bullets and short sections never split. */
          [data-section-heading] { break-after: avoid; }
          [data-entry] > :first-child { break-inside: avoid; break-after: avoid; }
          [data-entry-desc] > div { break-inside: avoid; }
          [data-keep] { break-inside: avoid; }
          /* A bottom margin below the last content in a column would push the
             page a few pixels past the paper and start a blank page. */
          [data-section]:last-child [data-entry]:last-child,
          [data-section]:last-child > div > :last-child { margin-bottom: 0 !important; }
        }
      `}</style>
      <MasterTemplate resume={resume} />
    </>
  )
}
