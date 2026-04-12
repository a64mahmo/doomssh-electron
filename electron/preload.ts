import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),
  // ── API key ────────────────────────────────────────────────────────────────
  setApiKey: (key: string): Promise<void> => ipcRenderer.invoke('set-api-key', key),
  getApiKey: (): Promise<string | null> => ipcRenderer.invoke('get-api-key'),

  // ── Debug ──────────────────────────────────────────────────────────────────
  setDebugMode: (enabled: boolean): Promise<void> => ipcRenderer.invoke('set-debug-mode', enabled),
  getDebugMode: (): Promise<boolean> => ipcRenderer.invoke('get-debug-mode'),

  savePdf: (args: { bytes: number[]; fileName: string }): Promise<{ success: boolean; path?: string; error?: string; cancelled?: boolean }> =>
    ipcRenderer.invoke('save-pdf', args),

  // ── Updates ────────────────────────────────────────────────────────────────
  onUpdateChecking: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('app:update-checking', handler)
    return () => ipcRenderer.off('app:update-checking', handler)
  },
  onUpdateAvailable: (callback: (info: any) => void) => {
    const handler = (_: any, info: any) => callback(info)
    ipcRenderer.on('app:update-available', handler)
    return () => ipcRenderer.off('app:update-available', handler)
  },
  onUpdateNotAvailable: (callback: (info: any) => void) => {
    const handler = (_: any, info: any) => callback(info)
    ipcRenderer.on('app:update-not-available', handler)
    return () => ipcRenderer.off('app:update-not-available', handler)
  },
  onUpdateProgress: (callback: (progress: any) => void) => {
    const handler = (_: any, progress: any) => callback(progress)
    ipcRenderer.on('app:update-progress', handler)
    return () => ipcRenderer.off('app:update-progress', handler)
  },
  onUpdateDownloaded: (callback: (info: any) => void) => {
    const handler = (_: any, info: any) => callback(info)
    ipcRenderer.on('app:update-downloaded', handler)
    return () => ipcRenderer.off('app:update-downloaded', handler)
  },
  onUpdateError: (callback: (error: string) => void) => {
    const handler = (_: any, error: string) => callback(error)
    ipcRenderer.on('app:update-error', handler)
    return () => ipcRenderer.off('app:update-error', handler)
  },
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  restartAndInstall: () => ipcRenderer.invoke('restart-and-install'),

  // ── Vault / resume file storage ───────────────────────────────────────────
  vault: {
    getPath: (): Promise<string | null>    => ipcRenderer.invoke('vault:get'),
    setPath: (): Promise<string | null>    => ipcRenderer.invoke('vault:set'),
    list:    (): Promise<unknown[]>        => ipcRenderer.invoke('resume:list'),
    read:    (id: string): Promise<unknown | null> => ipcRenderer.invoke('resume:read', id),
    write:   (resume: unknown): Promise<void>      => ipcRenderer.invoke('resume:write', resume),
    delete:  (id: string): Promise<void>           => ipcRenderer.invoke('resume:delete', id),
    readJobs:  (): Promise<unknown | null>         => ipcRenderer.invoke('jobs:read'),
    writeJobs: (data: unknown): Promise<void>      => ipcRenderer.invoke('jobs:write', data),
  },

  // ── AI streaming ───────────────────────────────────────────────────────────
  // Returns a cleanup function that removes the listeners for this request.
  aiStream: (
    id: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    maxTokens: number,
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (message: string) => void,
  ): (() => void) => {
    const chunkHandler = (_: Electron.IpcRendererEvent, data: { id: string; text: string }) => {
      if (data.id === id) onChunk(data.text)
    }
    const doneHandler = (_: Electron.IpcRendererEvent, data: { id: string }) => {
      if (data.id === id) { cleanup(); onDone() }
    }
    const errorHandler = (_: Electron.IpcRendererEvent, data: { id: string; message: string }) => {
      if (data.id === id) { cleanup(); onError(data.message) }
    }

    ipcRenderer.on('ai:chunk', chunkHandler)
    ipcRenderer.on('ai:done',  doneHandler)
    ipcRenderer.on('ai:error', errorHandler)

    function cleanup() {
      ipcRenderer.off('ai:chunk', chunkHandler)
      ipcRenderer.off('ai:done',  doneHandler)
      ipcRenderer.off('ai:error', errorHandler)
    }

    ipcRenderer.send('ai:start', { id, messages, maxTokens })
    return cleanup
  },
})
