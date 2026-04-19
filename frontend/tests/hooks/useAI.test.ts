import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAI } from '@/hooks/useAI'
import { useUIStore } from '@/lib/store/uiStore'

describe('useAI hook', () => {
  beforeEach(() => {
    useUIStore.getState().clearErrors()
    vi.clearAllMocks()
    // Mock fetch
    global.fetch = vi.fn()
  })

  it('should add an error to uiStore when HTTP call fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('API Error'),
    } as any)

    const { result } = renderHook(() => useAI())
    
    await expect(result.current.improveText('test text')).rejects.toThrow('API Error')
    
    const errors = useUIStore.getState().errors
    expect(errors).toContain('AI Error: API Error')
  })

  it('should add an error to uiStore when Electron IPC fails', async () => {
    // Mock window.electron
    const mockElectron = {
      aiStream: vi.fn((id, messages, maxTokens, onChunk, onDone, onError) => {
        setTimeout(() => onError('IPC Connection Lost'), 0)
        return () => {}
      })
    }
    vi.stubGlobal('window', { electron: mockElectron })

    const { result } = renderHook(() => useAI())
    
    await expect(result.current.improveText('test text')).rejects.toThrow('IPC Connection Lost')
    
    const errors = useUIStore.getState().errors
    expect(errors).toContain('AI Error: IPC Connection Lost')
    
    vi.unstubAllGlobals()
  })
})
