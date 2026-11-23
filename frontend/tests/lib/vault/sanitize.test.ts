import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { sanitizeVault, VaultImportError, VAULT_FORMAT } from '@/lib/vault/sanitize'
import { buildVaultFile, importVault } from '@/lib/vault/vaultTransfer'
import { browserDb } from '@/lib/db/browserDb'
import { createNewResume, createNewCoverLetter, saveResume, getAllResumes, getAllCoverLetters } from '@/lib/db/database'
import { loadAllJobs, saveAllJobs } from '@/lib/db/jobDatabase'
import type { JobApplication } from '@/lib/store/types'

const vault = (extra: Record<string, unknown>) => JSON.stringify({ format: VAULT_FORMAT, version: 1, resumes: [], coverLetters: [], jobs: [], ...extra })
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

function hostileResume() {
  return {
    id: '../../../etc/passwd',
    name: 'Evil <script>alert(1)</script>Resume',
    template: 'not-a-template',
    __proto__: { polluted: true },
    constructor: { prototype: { polluted: true } },
    settings: {
      accentColor: 'red; background: url(https://evil.example/x)',
      fontFamily: 'Comic Sans',
      fontSize: 1e9,
      footerLeft: '<img src=x onerror=alert(1)>{{name}}',
      footerCustom: true,
      sectionColumns: { 'ok-id': 'sidebar', '../x': 'main', good: 'evil' },
      evilSetting: 'x',
    },
    sections: [
      {
        id: 'h1', type: 'header', title: 'Header', visible: true,
        items: {
          fullName: 'Ada<iframe src="javascript:alert(1)"></iframe>',
          website: 'javascript:alert(document.cookie)',
          linkedin: 'linkedin.com/in/ada',
          github: 'vbscript:msgbox(1)',
          twitter: 'https://x.com/ada',
          photo: 'data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+',
          onclick: 'alert(1)',
        },
      },
      { id: 'h2', type: 'header', title: 'Second header', items: {} },
      { id: 'x', type: 'malware', title: 'Unknown', items: [] },
      { id: 's1', type: 'summary', title: 'Summary', items: { text: 'Hi<script>steal()</script> there\u0007' } },
      { id: 'e1', type: 'experience', title: 'Work', items: 'not-an-array' },
      { id: 'p1', type: 'projects', title: 'Projects', items: [
        { id: 'pr1', name: 'Site', url: 'data:text/html,<script>alert(1)</script>', date: 2024, description: 'x'.repeat(60_000) },
        'garbage',
        { id: 'pr2', name: 'Good', url: 'https://example.com/a?b=c' },
      ] },
    ],
  }
}

describe('sanitizeVault', () => {
  it('rejects files that are not a vault', () => {
    expect(() => sanitizeVault('not json')).toThrow(VaultImportError)
    expect(() => sanitizeVault('[]')).toThrow(VaultImportError)
    expect(() => sanitizeVault(JSON.stringify({ format: 'something-else', version: 1 }))).toThrow(VaultImportError)
    expect(() => sanitizeVault(JSON.stringify({ format: VAULT_FORMAT, version: 99 }))).toThrow(/newer version/)
  })

  it('cleans a hostile resume', () => {
    const { resumes, report } = sanitizeVault(vault({ resumes: [hostileResume()] }))
    const r = resumes[0]
    expect(report.cleaned).toBeGreaterThan(5)

    // Text: tags and scripts gone, content kept.
    expect(r.name).toBe('Evil Resume')
    const header = r.sections[0]
    expect(header.type).toBe('header')
    const h = header.items as unknown as Record<string, unknown>
    expect(h.fullName).toBe('Ada')
    // Links: only safe ones survive.
    expect(h.website).toBe('')
    expect(h.github).toBe('')
    expect(h.linkedin).toBe('linkedin.com/in/ada')
    expect(h.twitter).toBe('https://x.com/ada')
    // SVG photo dropped; unknown header keys dropped.
    expect(h.photo).toBeUndefined()
    expect(h.onclick).toBeUndefined()

    // One header, unknown section type dropped, bad items become an empty list.
    expect(r.sections.filter((s) => s.type === 'header')).toHaveLength(1)
    expect(r.sections.map((s) => s.type)).toEqual(['header', 'summary', 'experience', 'projects'])
    expect((r.sections[1].items as { text: string }).text).toBe('Hi there')
    expect(r.sections[2].items).toEqual([])
    const projects = r.sections[3].items as unknown as Record<string, unknown>[]
    expect(projects).toHaveLength(2)
    expect(projects[0].url).toBe('')
    expect(projects[0].date).toBe('2024')
    expect((projects[0].description as string).length).toBe(50_000)
    expect(projects[1].url).toBe('https://example.com/a?b=c')

    // Settings: invalid values fall back, unknown ones dropped.
    expect(r.template).toBe('custom')
    expect(r.settings.accentColor).toBe('#1a2744')
    expect(r.settings.fontFamily).toBe('Inter')
    expect(r.settings.fontSize).toBe(10.5)
    expect(r.settings.footerLeft).toBe('{{name}}')
    expect(r.settings.footerCustom).toBe(true)
    expect(r.settings.sectionColumns).toEqual({ 'ok-id': 'sidebar' })
    expect((r.settings as unknown as Record<string, unknown>).evilSetting).toBeUndefined()

    // No prototype pollution.
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(Object.getPrototypeOf(r)).toBe(Object.prototype)
  })

  it('keeps safe images and cleans jobs', () => {
    const { resumes, jobs } = sanitizeVault(vault({
      resumes: [{ id: 'a', name: 'Photo', sections: [{ id: 'h', type: 'header', items: { fullName: 'A', photo: PNG } }] }],
      jobs: [{
        id: 'j1', company: 'Acme<script>x</script>', role: 'Dev', status: 'hacked', url: 'file:///etc/passwd',
        contacts: [{ id: 'c', name: 'Bob', linkedin: 'javascript:alert(1)' }],
        events: 'nope',
        interviewPrep: { questions: [{ id: 'q', question: 'Why?', category: 'evil' }], cheatSheet: ['a', 42, { x: 1 }] },
      }],
    }))
    expect((resumes[0].sections[0].items as { photo?: string }).photo).toBe(PNG)
    const j = jobs[0]
    expect(j.company).toBe('Acme')
    expect(j.status).toBe('wishlist')
    expect(j.url).toBe('')
    expect(j.contacts[0].linkedin).toBe('')
    expect(j.events).toEqual([])
    expect(j.interviewPrep?.questions[0].category).toBe('general')
    expect(j.interviewPrep?.cheatSheet).toEqual(['a', '42', ''])
  })

  it('reports nothing for a clean document', () => {
    const r = createNewResume('Clean')
    const { report } = sanitizeVault(vault({ resumes: [r] }))
    expect(report.cleaned).toBe(0)
  })

  it('accepts a single exported resume', () => {
    const r = createNewResume('Solo')
    const out = sanitizeVault(JSON.stringify(r))
    expect(out.resumes.map((d) => d.name)).toEqual(['Solo'])
  })
})

describe('vault export → import', () => {
  beforeEach(async () => {
    delete (window as { electron?: unknown }).electron
    await browserDb().resumes.clear()
    await browserDb().kv.clear()
  })

  it('round-trips with new ids, remapped links, and identical content', async () => {
    const resume = createNewResume('Mine')
    resume.settings = { ...resume.settings, footerCustom: true, footerLeft: '{{name}}', footerDivider: true, sidebarFill: 'solid', keepEntriesTogether: true }
    const letter = createNewCoverLetter('Letter')
    letter.coverLetter!.linkedResumeId = resume.id
    await saveResume(resume)
    await saveResume(letter)
    const job = { id: 'job-1', company: 'Acme', role: 'Dev', resumeId: resume.id, coverLetterId: letter.id } as unknown as JobApplication
    await saveAllJobs([job])

    const file = await buildVaultFile()
    const cleaned = sanitizeVault(JSON.stringify(file))
    expect(cleaned.report.cleaned).toBe(0)
    await importVault(cleaned)

    const resumes = await getAllResumes()
    const letters = await getAllCoverLetters()
    const jobs = await loadAllJobs()
    expect(resumes).toHaveLength(2)
    expect(letters).toHaveLength(2)
    expect(jobs).toHaveLength(2)

    const copy = resumes.find((r) => r.id !== resume.id)!
    expect(copy.sections).toEqual(resume.sections)
    expect(copy.settings).toEqual(resume.settings)
    const letterCopy = letters.find((l) => l.id !== letter.id)!
    expect(letterCopy.coverLetter?.linkedResumeId).toBe(copy.id)
    const jobCopy = jobs.find((j) => j.id !== 'job-1')!
    expect(jobCopy.resumeId).toBe(copy.id)
    expect(jobCopy.coverLetterId).toBe(letterCopy.id)
  })
})
