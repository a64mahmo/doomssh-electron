import { describe, it, expect, beforeEach } from 'vitest'
import {
  WHATS_NEW,
  WHATS_NEW_STORAGE_KEY,
  hasUnseenWhatsNew,
  latestWhatsNewId,
  markWhatsNewSeen,
  readSeenWhatsNew,
  decideWhatsNew,
  latestWhatsNewAt,
  readSeenAt,
  writeSeenAt,
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

describe('decideWhatsNew (timestamp)', () => {
  const latest = latestWhatsNewAt()
  const base = { seenAt: null, legacySeenId: null, hasExistingData: false, promptedId: null }

  it('starts a brand-new user caught up, with no prompt', () => {
    const d = decideWhatsNew(base, 123)
    expect(d).toEqual({ unread: false, prompt: false, initSeenAt: 123 })
  })

  it('prompts a returning user whose last look is older than the newest notes', () => {
    expect(decideWhatsNew({ ...base, seenAt: latest - 1 })).toMatchObject({ unread: true, prompt: true, initSeenAt: null })
  })

  it('prompts only once per release, but keeps the dot', () => {
    expect(decideWhatsNew({ ...base, seenAt: latest - 1, promptedId: latestWhatsNewId() })).toMatchObject({ unread: true, prompt: false })
  })

  it('leaves a user who looked after the newest notes alone', () => {
    expect(decideWhatsNew({ ...base, seenAt: latest + 1 })).toMatchObject({ unread: false, prompt: false })
  })

  it('treats someone with documents but no timestamp as returning', () => {
    expect(decideWhatsNew({ ...base, hasExistingData: true })).toMatchObject({ unread: true, prompt: true })
  })

  it('counts the old "seen latest" marker as caught up', () => {
    expect(decideWhatsNew({ ...base, legacySeenId: latestWhatsNewId() }, 5)).toEqual({ unread: false, prompt: false, initSeenAt: 5 })
    expect(decideWhatsNew({ ...base, legacySeenId: 'some-older-id' })).toMatchObject({ unread: true, prompt: true })
  })

  it('round-trips the timestamp through the cookie', () => {
    writeSeenAt(1700000000000)
    expect(document.cookie).toContain('doomssh_whats_new_seen_at=1700000000000')
    expect(readSeenAt()).toBe(1700000000000)
  })

  it('dates the newest notes', () => {
    expect(latest).toBeGreaterThan(0)
  })
})
