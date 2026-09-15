import { describe, it, expect, beforeEach } from 'vitest'
import {
  WHATS_NEW,
  WHATS_NEW_STORAGE_KEY,
  hasUnseenWhatsNew,
  latestWhatsNewId,
  markWhatsNewSeen,
  readSeenWhatsNew,
} from '@/lib/whatsNew'

describe('whatsNew', () => {
  // jsdom's localStorage isn't reliably available under this Node version, so use an in-memory one.
  beforeEach(() => {
    const data = new Map<string, string>()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k: string) => data.get(k) ?? null,
        setItem: (k: string, v: string) => void data.set(k, String(v)),
        removeItem: (k: string) => void data.delete(k),
        clear: () => data.clear(),
      },
    })
  })

  it('has unique ids, newest first', () => {
    const ids = WHATS_NEW.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(latestWhatsNewId()).toBe(WHATS_NEW[0].id)
  })

  it('does not nudge brand-new users, but does nudge existing users who never opened it', () => {
    expect(hasUnseenWhatsNew(null, false)).toBe(false)
    expect(hasUnseenWhatsNew(null, true)).toBe(true)
  })

  it('shows the dot when an older entry was the last one seen, and hides it once caught up', () => {
    expect(hasUnseenWhatsNew('some-older-id', false)).toBe(true)
    expect(hasUnseenWhatsNew(latestWhatsNewId(), true)).toBe(false)
  })

  it('stores the latest id when marked seen', () => {
    expect(readSeenWhatsNew()).toBeNull()
    markWhatsNewSeen()
    expect(window.localStorage.getItem(WHATS_NEW_STORAGE_KEY)).toBe(latestWhatsNewId())
    expect(readSeenWhatsNew()).toBe(latestWhatsNewId())
  })
})
