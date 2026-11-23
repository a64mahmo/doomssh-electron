import { describe, it, expect } from 'vitest'
import { fillFooterTemplate } from '@/lib/utils/footer'

describe('fillFooterTemplate', () => {
  const values = { name: 'Ada Lovelace', phone: '555-0100', email: 'ada@example.com', page: 2, pages: 3 }

  it('fills every placeholder', () => {
    expect(fillFooterTemplate('{{name}} · {{phone}} · {{email}}', values)).toBe('Ada Lovelace · 555-0100 · ada@example.com')
    expect(fillFooterTemplate('{{page}} / {{pages}}', values)).toBe('2 / 3')
  })

  it('ignores case and inner spaces', () => {
    expect(fillFooterTemplate('Page {{ Page }} of {{PAGES}}', values)).toBe('Page 2 of 3')
  })

  it('leaves unknown placeholders as typed', () => {
    expect(fillFooterTemplate('{{nmae}}', values)).toBe('{{nmae}}')
  })

  it('blanks values that are missing', () => {
    expect(fillFooterTemplate('{{phone}}|{{pages}}', { page: 1 })).toBe('|')
    expect(fillFooterTemplate('', values)).toBe('')
  })
})

import { detectFooterPreset, footerPresetUpdates, formatPageNumber } from '@/lib/utils/footer'
import { DEFAULT_SETTINGS } from '@/lib/store/types'

describe('footer presets', () => {
  it('round-trips every preset through detect', () => {
    for (const p of ['off', 'page', 'name-page', 'full', 'centered'] as const) {
      expect(detectFooterPreset({ ...DEFAULT_SETTINGS, ...footerPresetUpdates(p) })).toBe(p)
    }
  })

  it('reads hand-edited custom text as custom, and odd mixes as none', () => {
    expect(detectFooterPreset({ ...DEFAULT_SETTINGS, footerCustom: true, footerLeft: '{{phone}}' })).toBe('custom')
    expect(detectFooterPreset({ ...DEFAULT_SETTINGS, footerEmail: true })).toBeNull()
  })

  it('formats page numbers', () => {
    expect(formatPageNumber('number', 2, 3)).toBe('2')
    expect(formatPageNumber('of-total', 2, 3)).toBe('2 / 3')
    expect(formatPageNumber('page-of', 2, 3)).toBe('Page 2 of 3')
    expect(formatPageNumber('page-of', 2)).toBe('2')
    expect(formatPageNumber(undefined, 1, 1)).toBe('1')
  })
})
