// Global type for the Electron preload bridge (window.electron)
interface ElectronAPI {
  platform: string

  // API key
  setApiKey: (key: string) => Promise<void>
  getApiKey: () => Promise<string | null>

  // Debug
  setDebugMode: (enabled: boolean) => Promise<void>
  getDebugMode: () => Promise<boolean>

  // PDF export — generates PDF in-renderer via @react-pdf, saves via native dialog
  savePdf: (args: { bytes: number[]; fileName: string }) => Promise<{
    success: boolean
    path?: string
    error?: string
    cancelled?: boolean
  }>

  // Vault / resume file storage
  vault: {
    getPath: () => Promise<string | null>
    setPath: () => Promise<string | null>
    list:    () => Promise<unknown[]>
    read:    (id: string) => Promise<unknown | null>
    write:   (resume: unknown) => Promise<void>
    delete:  (id: string) => Promise<void>
    readJobs:  () => Promise<unknown | null>
    writeJobs: (data: unknown) => Promise<void>
  }

  // Updates
  onUpdateAvailable: (callback: (info: any) => void) => () => void
  onUpdateDownloaded: (callback: (info: any) => void) => () => void
  restartAndInstall: () => Promise<void>

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
