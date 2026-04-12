import React from 'react'
import type { ResumeSection } from '@/lib/store/types'
import type { TemplateCtx } from '@/lib/pdf/templateCtx'
import type { HeadingFn } from './shared'

import { SummarySectionPDF } from './summary'
import { ExperienceSectionPDF } from './experience'
import { EducationSectionPDF } from './education'
import { SkillsSectionPDF } from './skills'
import { ProjectsSectionPDF } from './projects'
import { CertificationsSectionPDF } from './certifications'
import { LanguagesSectionPDF } from './languages'
import { AwardsSectionPDF } from './awards'
import { VolunteeringSectionPDF } from './volunteering'
import { PublicationsSectionPDF } from './publications'
import { ReferencesSectionPDF } from './references'
import { CustomSectionPDF } from './custom'

export { ContactLinePDF } from './contact'
export { hexA } from './shared'
export type { HeadingFn, SectionPDFProps } from './shared'

export function SectionRendererPDF({ section, ctx, renderHeading, isSidebar = false }: {
  section: ResumeSection
  ctx: TemplateCtx
  renderHeading: HeadingFn
  isSidebar?: boolean
}) {
  if (!section.visible) return null
  const props = { section, ctx, renderHeading, isSidebar }
  switch (section.type) {
    case 'summary':        return <SummarySectionPDF        {...props} />
    case 'experience':     return <ExperienceSectionPDF     {...props} />
    case 'education':      return <EducationSectionPDF      {...props} />
    case 'skills':         return <SkillsSectionPDF         {...props} />
    case 'projects':       return <ProjectsSectionPDF       {...props} />
    case 'certifications': return <CertificationsSectionPDF {...props} />
    case 'languages':      return <LanguagesSectionPDF      {...props} />
    case 'awards':         return <AwardsSectionPDF         {...props} />
    case 'volunteering':   return <VolunteeringSectionPDF   {...props} />
    case 'publications':   return <PublicationsSectionPDF   {...props} />
    case 'references':     return <ReferencesSectionPDF     {...props} />
    case 'custom':         return <CustomSectionPDF         {...props} />
    default: return null
  }
}
