import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.getState().clearErrors()
  })

  it('should initialize with no errors', () => {
    const state = useUIStore.getState()
    expect(state.errors).toEqual([])
  })

  it('should initialize with globalDebugMode false', () => {
    const state = useUIStore.getState()
    expect(state.globalDebugMode).toBe(false)
  })

  it('should set globalDebugMode', () => {
    const { setGlobalDebugMode } = useUIStore.getState()
    setGlobalDebugMode(true)
    expect(useUIStore.getState().globalDebugMode).toBe(true)
    
    setGlobalDebugMode(false)
    expect(useUIStore.getState().globalDebugMode).toBe(false)
  })

  it('should add errors', () => {
    const { addError } = useUIStore.getState()
    addError('Test Error 1')
    addError('Test Error 2')
    
    const state = useUIStore.getState()
    expect(state.errors).toEqual(['Test Error 1', 'Test Error 2'])
  })

  it('should clear errors', () => {
    const { addError, clearErrors } = useUIStore.getState()
    addError('Test Error 1')
    clearErrors()
    
    const state = useUIStore.getState()
    expect(state.errors).toEqual([])
  })
})
