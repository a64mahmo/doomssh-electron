/**
 * Dev fixtures: a resume carrying every section type, so the render harness and
 * the preview smoke test exercise every section renderer. The sample resumes
 * only cover header, summary, experience, education, skills and projects.
 */
import { createSampleResumes } from '@/lib/db/database'
import { SECTION_LABELS } from '@/lib/store/types'
import type { Resume, ResumeSection, SectionType } from '@/lib/store/types'

const extra = (type: SectionType, items: unknown[]): ResumeSection =>
  ({ id: `fixture-${type}`, type, title: SECTION_LABELS[type], visible: true, items }) as ResumeSection

export function allSectionsResume(): Resume {
  const [base, ...rest] = createSampleResumes()
  const seen = new Set(base.sections.map((sec) => sec.type))
  for (const r of rest) {
    for (const sec of r.sections) {
      if (!seen.has(sec.type)) {
        seen.add(sec.type)
        base.sections.push(sec)
      }
    }
  }
  const more: ResumeSection[] = [
    extra('certifications', [
      { id: 'c1', name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2023-05', url: 'aws.amazon.com/certification' },
      { id: 'c2', name: 'Microsoft Certified: Power BI Data Analyst', issuer: 'Microsoft', date: '2022-11', url: '' },
    ]),
    extra('languages', [
      { id: 'l1', language: 'English', level: 'expert' },
      { id: 'l2', language: 'Arabic', level: 'advanced' },
      { id: 'l3', language: 'French', level: 'elementary' },
    ]),
    extra('awards', [
      { id: 'a1', title: 'Deputy Minister’s Award for Innovation', issuer: 'Ontario Public Service', date: '2025-03', description: 'Recognised for automating intake across three ministries.' },
    ]),
    extra('volunteering', [
      { id: 'v1', organization: 'Code for Canada', role: 'Volunteer Data Engineer', startDate: '2022-01', endDate: '', present: true, description: 'Built open-data pipelines for municipal transit datasets\nMentored new volunteers on SQL and Python' },
    ]),
    extra('publications', [
      { id: 'p1', title: 'Automating Public Sector Intake with Low-Code Workflows', publisher: 'Journal of Digital Government', date: '2024-09', url: 'doi.org/10.0000/example', description: 'Case study of a cross-ministry automation rollout.' },
    ]),
    extra('references', [
      { id: 'r1', name: 'Jordan Lee', company: 'Ontario Public Service', position: 'Senior Manager, Digital Delivery', email: 'jordan.lee@example.com', phone: '+1 (416) 555-0100' },
      { id: 'r2', name: 'Priya Nair', company: 'University of Waterloo', position: 'Associate Professor', email: 'priya.nair@example.com', phone: '' },
    ]),
    extra('custom', [
      { id: 'x1', title: 'Open Source Maintainer', subtitle: 'dexie-sync-helpers', date: '2023-02', description: 'Maintain a small library used by 400+ projects.' },
    ]),
  ]
  base.sections.push(...more.filter((sec) => !seen.has(sec.type)))
  return base
}
