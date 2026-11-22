import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MasterTemplate, PagedResume, TEMPLATE_META, getTemplateSettings } from '@/components/web'
import { resolveHeaderPlacement } from '@/components/web/MasterTemplate'
import { createNewCoverLetter } from '@/lib/db/database'
import { allSectionsResume as allSections } from '../../../scripts/fixtures'
import type { TemplateId } from '@/lib/store/types'


describe('HTML preview renders every template', () => {
  const ids = Object.keys(TEMPLATE_META) as TemplateId[]

  it.each(ids)('%s', (id) => {
    const resume = allSections()
    resume.template = id
    resume.settings = { ...resume.settings, ...getTemplateSettings(id) }
    for (const isMeasurement of [false, true]) {
      const { container, unmount } = render(<MasterTemplate resume={resume} isMeasurement={isMeasurement} />)
      expect(container.textContent).toContain('Abdallh Mahmood')
      // One entry from each section type the fixture adds.
      for (const text of ['Amazon Web Services', 'French', 'Innovation', 'Code for Canada', 'Journal of Digital Government', 'Priya Nair', 'dexie-sync-helpers']) {
        expect(container.textContent).toContain(text)
      }
      unmount()
    }
  })

  it('cover letter', () => {
    const letter = { ...createNewCoverLetter('Letter'), sections: allSections().sections }
    const { container } = render(<MasterTemplate resume={letter} />)
    expect(container.textContent).toContain('Dear Hiring Manager')
    // The body already closes with "Sincerely," — no automatic second one.
    expect(container.textContent?.match(/Sincerely,/g)).toHaveLength(1)
  })
  it.each(ids)('%s paged', (id) => {
    const resume = allSections()
    resume.template = id
    resume.settings = { ...resume.settings, ...getTemplateSettings(id), footerPageNumbers: true }
    const { container, unmount } = render(<PagedResume resume={resume} />)
    // jsdom measures nothing, so the whole flow lands on one page.
    const pages = container.querySelectorAll('[data-page]')
    expect(pages).toHaveLength(1)
    expect(pages[0].textContent).toContain('Abdallh Mahmood')
    expect(pages[0].textContent).toContain('Amazon Web Services')
    unmount()
  })
  // Two columns: the header heads one column and never spans both, so the
  // columns and the sidebar panel run the full height of the page.
  it.each(ids)('%s keeps the header inside a column when there are two', (id) => {
    const resume = allSections()
    resume.template = id
    resume.settings = { ...resume.settings, ...getTemplateSettings(id) }
    const { container, unmount } = render(<MasterTemplate resume={resume} />)
    const root = container.querySelector('[data-resume-page]')!
    const header = container.querySelector('[data-header]')!
    // The root's child that holds the header.
    let top: Element = header
    while (top.parentElement && top.parentElement !== root) top = top.parentElement
    const twoColumns = resume.settings.columnLayout !== 'one' && root.querySelectorAll('[data-section]').length > 0
    if (twoColumns && resolveHeaderPlacement(resume.settings, true) !== 'top') {
      // It is the body: the header shares it with the sections.
      expect(top.querySelector('[data-section]')).not.toBeNull()
    }
    unmount()
  })
})

describe('resolveHeaderPlacement', () => {
  it('puts the header across the top of a one-column page', () => {
    expect(resolveHeaderPlacement({ columnLayout: 'one', headerLayout: 'sidebar' }, true)).toBe('top')
  })
  it('reads a saved full-width header as the main column when there are two', () => {
    expect(resolveHeaderPlacement({ columnLayout: 'two', headerLayout: 'top' }, true)).toBe('main')
    expect(resolveHeaderPlacement({ columnLayout: 'mix', headerLayout: undefined }, true)).toBe('main')
  })
  it('keeps the sidebar choice', () => {
    expect(resolveHeaderPlacement({ columnLayout: 'two', headerLayout: 'sidebar' }, true)).toBe('sidebar')
  })
  it('falls back to the top when the sidebar is empty', () => {
    expect(resolveHeaderPlacement({ columnLayout: 'two', headerLayout: 'sidebar' }, false)).toBe('top')
  })
})
