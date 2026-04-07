// PDF download — single place for all export logic
import type { Resume } from '@/lib/store/types'

export async function downloadResumePDF(resume: Resume): Promise<void> {
  const fileName = `${resume.name.replace(/\s+/g, '_')}_Resume.pdf`
  const paperSize = resume.settings.paperSize === 'a4' ? 'a4' : 'letter'

  // If in Electron, use the native high-quality export
  if (window.electron?.exportPdf) {
    try {
      const result = await window.electron.exportPdf({
        resumeId: resume.id,
        fileName,
        paperSize,
      })
      
      if (result.success) {
        console.log('Export successful:', result.path)
      } else if (!result.cancelled) {
        alert(`Export failed: ${result.error}`)
      }
    } catch (err) {
      console.error('Export error:', err)
      // Fallback
      window.open(`/print/${resume.id}`, '_blank')
    }
  } else {
    // Standard browser fallback
    window.open(`/print/${resume.id}`, '_blank')
  }
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
