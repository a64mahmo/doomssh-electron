import type { Resume } from '@/lib/store/types'

/**
 * Exports through the HTML print page (app/print) — the same MasterTemplate
 * layout the live preview shows — so there is a single renderer to maintain.
 *
 *  - Desktop: the main process lays the page out in a hidden window and saves
 *    it with printToPDF behind a native save dialog.
 *  - Browser: the page loads in a hidden iframe and opens the print dialog,
 *    where the user picks "Save as PDF".
 *
 * Both hand the in-memory resume to the page rather than re-reading storage,
 * so edits made in the last debounce window are included.
 */
export async function downloadResumePDF(resume: Resume): Promise<void> {
  const isCL = resume.kind === 'coverLetter'
  const baseName = `${resume.name.replace(/\s+/g, '_')}_${isCL ? 'Cover_Letter' : 'Resume'}`

  try {
    if (typeof window !== 'undefined' && window.electron?.exportPdf) {
      const result = await window.electron.exportPdf({ resume, fileName: `${baseName}.pdf` })
      if (!result.success && !result.cancelled) {
        console.error('Export failed:', result.error)
      }
      return
    }
    await printInIframe(resume, baseName)
  } catch (err) {
    console.error('PDF export error:', err)
  }
}

const READY_TIMEOUT_MS = 15_000

async function printInIframe(resume: Resume, baseName: string): Promise<void> {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  // Off-screen rather than display:none — a hidden frame has no layout to print.
  Object.assign(frame.style, {
    position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0', visibility: 'hidden',
  })
  frame.src = '/print/new/?mode=export'
  document.body.appendChild(frame)

  try {
    await new Promise<void>((resolve, reject) => {
      frame.onload = () => resolve()
      frame.onerror = () => reject(new Error('Print page failed to load'))
    })

    const win = frame.contentWindow
    const doc = frame.contentDocument
    if (!win || !doc) throw new Error('Print frame unavailable')

    win.__DOOMSSH_PRINT_RESUME__ = resume
    win.dispatchEvent(new Event('doomssh:print-resume'))

    const started = Date.now()
    while (doc.documentElement.dataset.printReady !== 'true') {
      if (Date.now() - started > READY_TIMEOUT_MS) throw new Error('Print page did not become ready')
      await new Promise((r) => setTimeout(r, 50))
    }

    // Browsers suggest the document title as the PDF file name.
    const previousTitle = document.title
    doc.title = baseName
    document.title = baseName
    win.focus()
    win.print()
    document.title = previousTitle
  } finally {
    // print() blocks until the dialog closes in Chromium and Firefox; Safari
    // returns immediately, so give it time before the frame goes away.
    setTimeout(() => frame.remove(), 60_000)
  }
}

export function exportResumeJSON(resume: Resume): void {
  const json = JSON.stringify(resume, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `${resume.name.replace(/\s+/g, '_')}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function importResumeJSON(file: File): Promise<Resume> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target?.result as string) as Resume)
      } catch {
        reject(new Error('Invalid resume file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
