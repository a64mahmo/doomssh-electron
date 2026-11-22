import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { SETTINGS_INDEX, searchSettings, settingsFor, fuzzyScore, contentEntries } from '@/lib/settings/settingsIndex'

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

describe('content entries', () => {
  const resume = {
    kind: 'resume' as const,
    sections: [
      { id: 'h', type: 'header', title: 'Header', visible: true, items: {} },
      { id: 'x', type: 'experience', title: 'Relevant Professional Experience', visible: true, items: [] },
      { id: 'c', type: 'custom', title: 'Open Source', visible: true, items: [] },
    ],
  } as unknown as Parameters<typeof contentEntries>[0]

  it('lists each section by its current title and finds renamed ones by type', () => {
    const entries = contentEntries(resume)
    expect(entries.find((e) => e.contentSection === 'x')?.label).toBe('Relevant Professional Experience')
    const found = searchSettings(entries, 'experience')[0].entry
    expect(found.contentSection).toBe('x')
    expect(searchSettings(entries, 'open source')[0].entry.contentSection).toBe('c')
  })

  it('points header fields at the header section and their group', () => {
    const email = contentEntries(resume).find((e) => e.label === 'Email')!
    expect(email).toMatchObject({ tab: 'content', contentSection: 'h', group: 'Contact Information' })
    expect(searchSettings(contentEntries(resume), 'linkedin')[0].entry.label).toBe('Social Profiles & Additional Details')
  })

  it('gives cover letters their cards and fields', () => {
    const cl = contentEntries({ kind: 'coverLetter', sections: [] } as unknown as Parameters<typeof contentEntries>[0])
    expect(searchSettings(cl, 'hiring manager')[0].entry.contentSection).toBe('recipient')
    expect(cl.find((e) => e.label === 'Signing Date')).toMatchObject({ contentSection: 'signature', group: 'Closing & Details' })
  })

  // Header and cover letter field labels must match the editors' FieldLabels.
  it('names fields that exist in the editors', () => {
    const header = readFileSync(join(__dirname, '../../../components/editor/sections/HeaderSection.tsx'), 'utf8')
    for (const e of contentEntries(resume).filter((e) => e.group && e.contentSection === 'h')) {
      expect(header, e.label).toContain(`title="${e.group}"`)
      expect(header.includes(`label="${e.label}"`) || header.includes(`>${e.label}</FieldLabel>`) || e.label === e.group, e.label).toBe(true)
    }
    const clDir = join(__dirname, '../../../components/cover-letter/sections')
    const cards = ['TargetJobCard', 'LetterheadCard', 'RecipientCard', 'SignatureCard'].map((f) => readFileSync(join(clDir, `${f}.tsx`), 'utf8')).join('\n')
    const cl = contentEntries({ kind: 'coverLetter', sections: [] } as unknown as Parameters<typeof contentEntries>[0])
    for (const e of cl.filter((e) => e.group && e.label !== e.group)) {
      expect(cards, e.label).toContain(`<FieldLabel>${e.label}</FieldLabel>`)
    }
  })
})
