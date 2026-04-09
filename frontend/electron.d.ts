// Global type for the Electron preload bridge (window.electron)
interface ElectronAPI {
  platform: string

  // API key
  setApiKey: (key: string) => Promise<void>
  getApiKey: () => Promise<string | null>

  // PDF export — generates PDF in-renderer via @react-pdf, saves via native dialog
  savePdf: (args: { bytes: number[]; fileName: string }) => Promise<{
    success: boolean
    path?: string
    error?: string
    cancelled?: boolean
  }>

  // AI streaming
  aiStream: (
    id: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    maxTokens: number,
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (message: string) => void,
  ) => () => void
}

declare global {
  interface Window {
    electron?: ElectronAPI
  }
}

export {}
