// PDF download — single place for all export logic
import type { Resume } from '@/lib/store/types'

export function downloadResumePDF(resume: Resume): void {
  // Opens a dedicated print page; the browser's print dialog handles PDF export.
  // In Electron this can be replaced with IPC + printToPDF for a save dialog.
  window.open(`/print/${resume.id}`, '_blank')
}

export function exportResumeJSON(resume: Resume): void {
  const json = JSON.stringify(resume, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${resume.name.replace(/\s+/g, '_')}.json`
  link.click()

  URL.revokeObjectURL(url)
}

export function importResumeJSON(file: File): Promise<Resume> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as Resume
        resolve(data)
      } catch {
        reject(new Error('Invalid resume file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
