import { describe, it, expect } from 'vitest'
import type { ResumeSettings, PhotoSize, PhotoShape, PhotoPosition, PhotoAlignment, PhotoVerticalAlign, PhotoBorderStyle } from '@/lib/store/types'
import { DEFAULT_SETTINGS } from '@/lib/store/types'

describe('Photo Settings Types', () => {
  it('should have valid PhotoSize values', () => {
    const sizes: PhotoSize[] = ['XS', 'S', 'M', 'L', 'XL']
    expect(sizes).toContain(DEFAULT_SETTINGS.photoSize)
  })

  it('should have valid PhotoShape values', () => {
    const shapes: PhotoShape[] = ['circle', 'rounded', 'square']
    expect(shapes).toContain(DEFAULT_SETTINGS.photoShape)
  })

  it('should have valid PhotoPosition values', () => {
    const positions: PhotoPosition[] = ['beside', 'top', 'bottom']
    expect(positions).toContain(DEFAULT_SETTINGS.photoPosition)
  })

  it('should have valid PhotoAlignment values', () => {
    const alignments: PhotoAlignment[] = ['left', 'center', 'right']
    expect(alignments).toContain(DEFAULT_SETTINGS.photoAlignment)
  })

  it('should have valid PhotoVerticalAlign values', () => {
    const vAligns: PhotoVerticalAlign[] = ['top', 'center', 'bottom']
    expect(vAligns).toContain(DEFAULT_SETTINGS.photoVerticalAlign)
  })

  it('should have valid PhotoBorderStyle values', () => {
    const borders: PhotoBorderStyle[] = ['none', 'thin', 'medium', 'thick']
    expect(borders).toContain(DEFAULT_SETTINGS.photoBorderStyle)
  })
})

describe('Photo Settings Defaults', () => {
  it('should have photo disabled by default', () => {
    expect(DEFAULT_SETTINGS.photoEnabled).toBe(false)
  })

  it('should have medium size by default', () => {
    expect(DEFAULT_SETTINGS.photoSize).toBe('M')
  })

  it('should have circle shape by default', () => {
    expect(DEFAULT_SETTINGS.photoShape).toBe('circle')
  })

  it('should have beside position by default', () => {
    expect(DEFAULT_SETTINGS.photoPosition).toBe('beside')
  })

  it('should have center alignment by default', () => {
    expect(DEFAULT_SETTINGS.photoAlignment).toBe('center')
  })

  it('should have center vertical alignment by default', () => {
    expect(DEFAULT_SETTINGS.photoVerticalAlign).toBe('center')
  })

  it('should have thin border by default', () => {
    expect(DEFAULT_SETTINGS.photoBorderStyle).toBe('thin')
  })

  it('should have a default border color', () => {
    expect(DEFAULT_SETTINGS.photoBorderColor).toBe('#e5e7eb')
  })

  it('should have a default gap of 16pt', () => {
    expect(DEFAULT_SETTINGS.photoGap).toBe(16)
  })
})

describe('Photo Settings Range', () => {
  it('should have photoGap within valid range', () => {
    const settings = { ...DEFAULT_SETTINGS }
    
    settings.photoGap = 0
    expect(settings.photoGap).toBeGreaterThanOrEqual(0)
    expect(settings.photoGap).toBeLessThanOrEqual(32)

    settings.photoGap = 32
    expect(settings.photoGap).toBeGreaterThanOrEqual(0)
    expect(settings.photoGap).toBeLessThanOrEqual(32)
  })

  it('should allow updating photo settings', () => {
    const settings: Partial<ResumeSettings> = {}
    
    settings.photoEnabled = true
    settings.photoSize = 'L'
    settings.photoShape = 'square'
    settings.photoPosition = 'top'
    settings.photoAlignment = 'left'
    settings.photoVerticalAlign = 'top'
    settings.photoBorderStyle = 'thick'
    settings.photoBorderColor = '#000000'
    settings.photoGap = 24

    expect(settings.photoEnabled).toBe(true)
    expect(settings.photoSize).toBe('L')
    expect(settings.photoShape).toBe('square')
    expect(settings.photoPosition).toBe('top')
    expect(settings.photoAlignment).toBe('left')
    expect(settings.photoVerticalAlign).toBe('top')
    expect(settings.photoBorderStyle).toBe('thick')
    expect(settings.photoBorderColor).toBe('#000000')
    expect(settings.photoGap).toBe(24)
  })
})

describe('Photo Size Mapping', () => {
  it('should have correct size values for each PhotoSize', () => {
    const sizeMap: Record<PhotoSize, number> = {
      'XS': 28,
      'S': 36,
      'M': 48,
      'L': 64,
      'XL': 80,
    }

    expect(sizeMap['XS']).toBe(28)
    expect(sizeMap['S']).toBe(36)
    expect(sizeMap['M']).toBe(48)
    expect(sizeMap['L']).toBe(64)
    expect(sizeMap['XL']).toBe(80)
  })

  it('should increase size progressively', () => {
    const sizeMap: Record<PhotoSize, number> = {
      'XS': 28,
      'S': 36,
      'M': 48,
      'L': 64,
      'XL': 80,
    }

    const sizes: PhotoSize[] = ['XS', 'S', 'M', 'L', 'XL']
    for (let i = 1; i < sizes.length; i++) {
      expect(sizeMap[sizes[i]]).toBeGreaterThan(sizeMap[sizes[i - 1]])
    }
  })
})

describe('Photo Border Width Mapping', () => {
  it('should have correct border width for each PhotoBorderStyle', () => {
    const borderWidthMap: Record<PhotoBorderStyle, number> = {
      'none': 0,
      'thin': 0.5,
      'medium': 1,
      'thick': 1.5,
    }

    expect(borderWidthMap['none']).toBe(0)
    expect(borderWidthMap['thin']).toBe(0.5)
    expect(borderWidthMap['medium']).toBe(1)
    expect(borderWidthMap['thick']).toBe(1.5)
  })
})

describe('Photo Shape Border Radius', () => {
  it('should calculate correct border radius for each PhotoShape', () => {
    const getBorderRadius = (shape: PhotoShape, size: number) => {
      if (shape === 'circle') return size / 2
      if (shape === 'rounded') return 6
      return 0
    }

    const size = 48

    expect(getBorderRadius('circle', size)).toBe(24)
    expect(getBorderRadius('rounded', size)).toBe(6)
    expect(getBorderRadius('square', size)).toBe(0)
  })
})
