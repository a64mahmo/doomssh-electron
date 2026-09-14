import { describe, it, expect } from 'vitest'
import { buildCtx, isSolidSidebar, sidebarCtx } from '@/lib/pdf/templateCtx'
import { DEFAULT_SETTINGS, type ResumeSettings } from '@/lib/store/types'

const settings = (over: Partial<ResumeSettings>): ResumeSettings => ({ ...DEFAULT_SETTINGS, ...over })

describe('isSolidSidebar', () => {
  it('needs two columns, a solid fill and a panel colour', () => {
    expect(isSolidSidebar(settings({ columnLayout: 'two', sidebarTheme: 'accent', sidebarFill: 'solid' }))).toBe(true)
    expect(isSolidSidebar(settings({ columnLayout: 'one', sidebarTheme: 'accent', sidebarFill: 'solid' }))).toBe(false)
    expect(isSolidSidebar(settings({ columnLayout: 'two', sidebarTheme: 'accent', sidebarFill: 'tint' }))).toBe(false)
    expect(isSolidSidebar(settings({ columnLayout: 'two', sidebarTheme: 'custom', sidebarFill: 'solid' }))).toBe(false)
  })
})

describe('sidebarCtx', () => {
  it('returns the page context unless the sidebar is solid', () => {
    const ctx = buildCtx(settings({ columnLayout: 'two', sidebarTheme: 'accent' }))
    expect(sidebarCtx(ctx)).toBe(ctx)
  })

  it('flips every colour light on a dark panel', () => {
    const ctx = buildCtx(settings({
      columnLayout: 'two', sidebarTheme: 'custom', sidebarBackgroundColor: '#111111', sidebarFill: 'solid', accentColor: '#1d4ed8',
    }))
    const side = sidebarCtx(ctx).colors
    expect(side.text).toBe('#f8fafc')
    expect(side.accent).toBe('#ffffff')
    expect(side.background).toBe('#111111')
  })

  it('keeps a light accent that stands out from the panel', () => {
    const ctx = buildCtx(settings({
      columnLayout: 'two', sidebarTheme: 'custom', sidebarBackgroundColor: '#111111', sidebarFill: 'solid', accentColor: '#facc15',
    }))
    expect(sidebarCtx(ctx).colors.accent).toBe('#facc15')
  })

  it('keeps normal text colours on a light panel', () => {
    const ctx = buildCtx(settings({
      columnLayout: 'two', sidebarTheme: 'custom', sidebarBackgroundColor: '#eef2ff', sidebarFill: 'solid',
    }))
    const side = sidebarCtx(ctx).colors
    expect(side.text).toBe(ctx.colors.text)
    expect(side.background).toBe('#eef2ff')
  })
})
