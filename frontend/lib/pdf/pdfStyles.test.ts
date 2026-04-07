import { describe, it, expect } from 'vitest'
import { resolveColors, DEFAULT_SETTINGS } from './pdfStyles'
import type { ResumeSettings } from '@/lib/store/types'

describe('pdfStyles resolveColors', () => {
  it('resolves basic colors correctly', () => {
    const settings: ResumeSettings = {
      ...DEFAULT_SETTINGS,
      colorMode: 'basic',
      accentColor: '#ff0000'
    }
    const colors = resolveColors(settings)
    expect(colors.accent).toBe('#ff0000')
    expect(colors.heading).toBe('#ff0000')
    expect(colors.text).toBe('#1a1a1a')
  })

  it('resolves multi-color mode correctly', () => {
    const settings: ResumeSettings = {
      ...DEFAULT_SETTINGS,
      colorMode: 'multi',
      textColor: '#333333',
      headingColor: '#00ff00',
      backgroundColor: '#eeeeee'
    }
    const colors = resolveColors(settings)
    expect(colors.text).toBe('#333333')
    expect(colors.heading).toBe('#00ff00')
    expect(colors.background).toBe('#eeeeee')
  })
})
