import { describe, it, expect } from 'vitest'
import { resolveColors } from './styleUtils'
import { DEFAULT_SETTINGS } from '../store/types'
import type { ResumeSettings } from '@/lib/store/types'

describe('styleUtils resolveColors', () => {
  it('resolves basic colors correctly', () => {
    const settings: ResumeSettings = {
      ...DEFAULT_SETTINGS,
      colorMode: 'basic',
      accentColor: '#ff0000',
      textColor: '#333333',
      subtitleColor: '#666666',
      dateColor: '#999999'
    }
    const colors = resolveColors(settings)
    expect(colors.accent).toBe('#ff0000')
    expect(colors.heading).toBe('#ff0000')
    expect(colors.text).toBe('#333333')
    expect(colors.subtitle).toBe('#666666')
    expect(colors.date).toBe('#999999')
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

  it('resolves image color mode correctly', () => {
    const settings: ResumeSettings = {
      ...DEFAULT_SETTINGS,
      colorMode: 'image',
      textColor: '#444444',
      headingColor: '#0000ff',
      backgroundColor: '#ffffff'
    }
    const colors = resolveColors(settings)
    expect(colors.text).toBe('#444444')
    expect(colors.heading).toBe('#0000ff')
    expect(colors.background).toBe('#ffffff')
  })
})
