'use client'
import { useEffect, useState, use } from 'react'
import { getResume } from '@/lib/db/database'
import { MasterTemplate } from '@/components/templates'
import type { Resume } from '@/lib/store/types'

export function PrintClient({ params }: { params: Promise<{ resumeId: string }> }) {
  const { resumeId } = use(params)
  const [resume, setResume] = useState<Resume | null>(null)

  useEffect(() => {
    getResume(resumeId).then((r) => {
      if (r) setResume(r)
    })
  }, [resumeId])

  useEffect(() => {
    if (!resume) return
    // Wait for web fonts to finish loading before printing
    document.fonts.ready.then(() => {
      // Small delay to ensure styles are applied
      setTimeout(() => window.print(), 150)
    })
  }, [resume])

  if (!resume) {
    return <div style={{ padding: 32, fontFamily: 'sans-serif' }}>Loading…</div>
  }

  return (
    <>
      <style>{`
        @page {
          margin: ${resume.settings.marginVertical}mm ${resume.settings.marginHorizontal}mm;
          size: ${resume.settings.paperSize === 'a4' ? 'A4' : 'letter'};
        }
        @media print {
          body { 
            margin: 0; 
            padding: 0; 
            background: white; 
          }
          [data-template-root] {
            padding: 0 !important;
          }
          /* Ensure fixed footer works in print */
          [data-footer-fixed] {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
          }
        }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>
      <div data-template-root>
        <MasterTemplate resume={resume} />
      </div>
    </>
  )
}
