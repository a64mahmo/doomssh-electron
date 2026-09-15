import { describe, it, expect } from 'vitest'
import { DEFAULT_HEADER } from '@/lib/store/types'

describe('DEFAULT_HEADER', () => {
  it('starts with empty contact fields so inputs show placeholders, not fake data', () => {
    const keys = ['fullName', 'jobTitle', 'email', 'phone', 'location', 'website', 'linkedin', 'github'] as const
    for (const key of keys) {
      expect(DEFAULT_HEADER[key]).toBe('')
    }
  })
})
