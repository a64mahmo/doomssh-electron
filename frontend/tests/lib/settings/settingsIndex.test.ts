import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { SETTINGS_INDEX, searchSettings, settingsFor, fuzzyScore } from '@/lib/settings/settingsIndex'

const TAB_FILES: Record<string, string> = {
  templates: 'TemplatesSection.tsx',
  layout: 'LayoutSection.tsx',
  typography: 'TypographySection.tsx',
  entry: 'EntrySection.tsx',
  colors: 'ColorsSection.tsx',
  header: 'HeaderSection.tsx',
  sections: 'SectionsSection.tsx',
}
const source = (tab: string) =>
  readFileSync(join(__dirname, '../../../components/customize/sections', TAB_FILES[tab]), 'utf8')

describe('settings index', () => {
  // The search finds controls by these exact strings, so they must stay in
  // step with the panel. A renamed control fails here, not silently in the app.
  it.each(SETTINGS_INDEX.filter((e) => e.group).map((e) => [e.id, e] as const))('%s points at a real group and control', (_, e) => {
    const src = source(e.tab)
    expect(src, `group "${e.group}"`).toContain(`ControlGroup title="${e.group}"`)
    if (e.label !== e.group) {
      const asLabel = src.includes(`label="${e.label}"`) || src.includes(`<FieldLabel>${e.label}</FieldLabel>`)
      expect(asLabel, `control "${e.label}"`).toBe(true)
    }
  })

  it('has unique ids', () => {
    const ids = SETTINGS_INDEX.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('leaves resume-only settings out of cover letters', () => {
    const cl = settingsFor('coverLetter').map((e) => e.id)
    expect(cl).not.toContain('keep-entries')
    expect(cl).toContain('cl-signature-side')
    expect(settingsFor('resume').map((e) => e.id)).not.toContain('cl-signature-side')
  })
})

describe('searchSettings', () => {
  const top = (q: string) => searchSettings(settingsFor('resume'), q)[0]?.entry.id

  it('finds a setting by its label', () => {
    expect(top('keep entries')).toBe('keep-entries')
    expect(top('paper size')).toBe('paper-size')
  })

  it('matches abbreviations in order, like VS Code', () => {
    expect(top('kpe')).toBe('keep-entries')
    expect(top('lnh')).toBe('line-height')
  })

  it('finds a setting by what people call it', () => {
    expect(top('page break')).toBe('keep-entries')
    expect(top('headshot')).toBe('photo')
  })

  it('lists everything for an empty query and nothing for nonsense', () => {
    expect(searchSettings(settingsFor('resume'), '').length).toBe(settingsFor('resume').length)
    expect(searchSettings(settingsFor('resume'), 'zzqxj')).toEqual([])
  })

  it('reports matched positions for highlighting', () => {
    expect(fuzzyScore('ps', 'Paper Size')?.positions).toEqual([0, 6])
  })
})
