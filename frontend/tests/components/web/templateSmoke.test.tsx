import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MasterTemplate, TEMPLATE_META, getTemplateSettings } from '@/components/web'
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
})
