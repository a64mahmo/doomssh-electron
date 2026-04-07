import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  // ── API key ────────────────────────────────────────────────────────────────
  setApiKey: (key: string): Promise<void> => ipcRenderer.invoke('set-api-key', key),
  getApiKey: (): Promise<string | null> => ipcRenderer.invoke('get-api-key'),

  exportPdf: (args: { resumeId: string, fileName: string, paperSize: 'a4' | 'letter' }): Promise<{ success: boolean, path?: string, error?: string, cancelled?: boolean }> => 
    ipcRenderer.invoke('export-pdf', args),

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
