import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createDebouncedSaver } from '@/lib/store/debouncedSaver'

// A tiny store: set() replaces the document and marks it dirty, like the zustand stores.
function makeStore() {
  let doc = { v: 0 }
  let dirty = false
  const listeners = new Set<() => void>()
  return {
    get: () => doc,
    isDirty: () => dirty,
    set: (v: number) => { doc = { v }; dirty = true; listeners.forEach((l) => l()) },
    markSaved: () => { dirty = false },
    subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l) },
  }
}

describe('createDebouncedSaver', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('saves edits made while the document was already dirty', async () => {
    const store = makeStore()
    const saved: number[] = []
    createDebouncedSaver({
      subscribe: store.subscribe, getSnapshot: store.get, isDirty: store.isDirty,
      save: async (d) => { saved.push(d.v) }, onSaved: store.markSaved, onError: () => {},
    })
    store.set(1)
    await vi.advanceTimersByTimeAsync(600)
    store.set(2)
    await vi.advanceTimersByTimeAsync(200)
    store.set(3) // within a second of the last save — used to be dropped
    await vi.advanceTimersByTimeAsync(600)
    expect(saved).toEqual([1, 3])
    expect(store.isDirty()).toBe(false)
  })

  it('saves again when the document changes during a save', async () => {
    const store = makeStore()
    const saved: number[] = []
    let finish: () => void = () => {}
    createDebouncedSaver({
      subscribe: store.subscribe, getSnapshot: store.get, isDirty: store.isDirty,
      save: (d) => new Promise<void>((resolve) => { saved.push(d.v); finish = resolve }),
      onSaved: store.markSaved, onError: () => {},
    })
    store.set(1)
    await vi.advanceTimersByTimeAsync(500) // save of 1 starts and hangs
    store.set(2)
    await vi.advanceTimersByTimeAsync(500) // fires mid-save
    expect(store.isDirty()).toBe(true)
    finish()
    await vi.advanceTimersByTimeAsync(0)
    expect(store.isDirty()).toBe(true) // 1 was saved, but 2 is newer
    await vi.advanceTimersByTimeAsync(500)
    finish()
    await vi.advanceTimersByTimeAsync(0)
    expect(saved).toEqual([1, 2])
    expect(store.isDirty()).toBe(false)
  })

  it('keeps the document dirty and reports when a save fails', async () => {
    const store = makeStore()
    const onError = vi.fn()
    createDebouncedSaver({
      subscribe: store.subscribe, getSnapshot: store.get, isDirty: store.isDirty,
      save: async () => { throw new Error('disk full') }, onSaved: store.markSaved, onError,
    })
    store.set(1)
    await vi.advanceTimersByTimeAsync(600)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(store.isDirty()).toBe(true)
  })
})
