import type { Resume } from '@/lib/store/types'

export async function downloadResumePDF(resume: Resume): Promise<void> {
  const fileName = `${resume.name.replace(/\s+/g, '_')}_Resume.pdf`

  try {
    const [{ pdf }, { ResumePDF }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('@/components/pdf/ResumePDF'),
    ])

    const blob   = await pdf(<ResumePDF resume={resume} />).toBlob()
    const buffer = await blob.arrayBuffer()
    const bytes  = Array.from(new Uint8Array(buffer))

    // Electron: open native save dialog and write to disk
    if (typeof window !== 'undefined' && window.electron?.savePdf) {
      const result = await window.electron.savePdf({ bytes, fileName })
      if (!result.success && !result.cancelled) {
        console.error('Save failed:', result.error)
      }
      return
    }

    // Browser fallback: trigger a download
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('PDF export error:', err)
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
