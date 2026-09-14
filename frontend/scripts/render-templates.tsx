/**
 * Dev-only harness: renders the sample resume through every template preset
 * so the PDF output can be eyeballed. Run: npx tsx scripts/render-templates.tsx <outDir>
 *
 *   --stress          long, unbreakable content
 *   --header-sidebar  force headerLayout: 'sidebar'
 *   --matrix          setting combinations no single preset covers
 *   --all-sections    one resume carrying every section type (scripts/fixtures.ts)
 *
 * Writes <outDir>/margins.json ({ name: [marginHorizontal, marginVertical] })
 * for margin checks.
 */
import path from 'node:path'
import fs from 'node:fs'
import zlib from 'node:zlib'
import React from 'react'
import { Font, renderToFile } from '@react-pdf/renderer'
import { ResumePDF } from '@/components/pdf/ResumePDF'
import { getTemplateSettings, TEMPLATE_META } from '@/components/web'
import { createSampleResume, createNewCoverLetter } from '@/lib/db/database'
import { allSectionsResume } from './fixtures'
import type { Resume, ResumeSettings, TemplateId } from '@/lib/store/types'

// The app registers fonts by URL path (/fonts/*) which only resolves in the
// browser. Rewrite those to on-disk paths so Node can load them.
const PUBLIC_DIR = path.join(process.cwd(), 'public')
const origRegister = Font.register.bind(Font)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Font.register = ((opts: any) => {
  const fix = (src: string) => (src.startsWith('/') ? path.join(PUBLIC_DIR, src) : src)
  if (opts.src) opts.src = fix(opts.src)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (opts.fonts) opts.fonts = opts.fonts.map((f: any) => ({ ...f, src: fix(f.src) }))
  return origRegister(opts)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any

const outDir = process.argv[2] || path.join(process.cwd(), '.template-renders')
const stress = process.argv.includes('--stress')
// No preset sets headerLayout, so this is the only way to exercise that path.
const headerSidebar = process.argv.includes('--header-sidebar')
const matrix = process.argv.includes('--matrix')
const allSectionsFlag = process.argv.includes('--all-sections')
fs.mkdirSync(outDir, { recursive: true })

/** A flat 96×96 PNG, so photo layouts have something to lay out. */
function placeholderPhoto(): string {
  const w = 96
  const h = 96
  const raw = Buffer.alloc((w * 3 + 1) * h)
  for (let y = 0; y < h; y++) {
    const row = y * (w * 3 + 1)
    for (let x = 0; x < w; x++) raw.set([148, 163, 184], row + 1 + x * 3)
  }
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(zlib.crc32(body))
    return Buffer.concat([len, body, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // truecolour
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
  return `data:image/png;base64,${png.toString('base64')}`
}
const PHOTO = placeholderPhoto()

/**
 * Replaces the sample content with the kind of values that actually break
 * layouts: unbreakable URLs, very long single tokens, and long skill strings
 * that have to survive a 30%-wide sidebar.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stressify(resume: any) {
  const header = resume.sections.find((s: any) => s.type === 'header')
  if (header) {
    header.items.fullName = 'Bartholomew Maximilian Featherstonehaugh-Cholmondeley'
    header.items.jobTitle = 'Principal Distinguished Staff Software & Data Engineering Lead'
    header.items.email = 'bartholomew.featherstonehaugh-cholmondeley@some-extremely-long-domain.example.com'
    header.items.linkedin = 'linkedin.com/in/bartholomew-maximilian-featherstonehaugh-cholmondeley-98217364'
    header.items.website = 'https://www.example.com/portfolio/bartholomew/projects/2024/very-long-path-segment'
  }
  const skills = resume.sections.find((s: any) => s.type === 'skills')
  if (skills) {
    skills.items[0].category = 'Automation, Scripting & Platform Engineering Tooling'
    skills.items[0].name = 'Python, TypeScript, SQL, PowerShell, Bash, Kubernetes, Terraform, GitHubActions'
    skills.items.push({
      id: 'stress-1',
      category: 'Unbreakable',
      name: 'Internationalization-and-Localization-Infrastructure-Pipeline',
      level: 'expert',
    })
  }
  const exp = resume.sections.find((s: any) => s.type === 'experience')
  if (exp) {
    exp.items[0].position = 'Senior Principal Software Engineering Manager, Platform Infrastructure'
    exp.items[0].location = 'Kitchener–Waterloo–Cambridge Regional Municipality, Ontario'
  }
  return resume
}

/** Setting combinations no single preset covers, layered on a base preset. */
const MATRIX: Record<string, [TemplateId, Partial<ResumeSettings>]> = {
  'a4-footer':           ['modern',  { paperSize: 'a4', footerPageNumbers: true, footerName: true, footerEmail: true }],
  'border-two-col':      ['elite',   { themeColorStyle: 'border', columnLayout: 'two' }],
  'band-tinted-sidebar': ['atlas',   { sidebarTheme: 'accent' }],
  'photo-beside':        ['modern',  { photoEnabled: true, photoPosition: 'beside', photoSize: 'L' }],
  'photo-center-top':    ['classic', { photoEnabled: true, photoPosition: 'top', photoShape: 'rounded' }],
  'details-beside':      ['zurich',  { detailsPosition: 'beside', detailsArrangement: 'column', detailsTextAlignment: 'right' }],
  'icons-filled':        ['crisp',   { contactIcons: true, contactIconStyle: 'circle-filled' }],
  'dark-custom-sidebar': ['dublin',  { sidebarTheme: 'custom', sidebarBackgroundColor: '#0f172a' }],
  'margins-min':         ['custom',  { marginHorizontal: 8, marginVertical: 6 }],
  'margins-max':         ['custom',  { marginHorizontal: 32, marginVertical: 28, columnLayout: 'two' }],
  'large-type':          ['minimal', { fontSize: 12.5, lineHeight: 1.7 }],
  'cover-letter':        ['modern',  { footerPageNumbers: true }],
}

const margins: Record<string, [number, number]> = {}

async function render(name: string, resume: Resume) {
  const header = resume.sections.find((s) => s.type === 'header')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (resume.settings.photoEnabled && header && !(header.items as any).photo) (header.items as any).photo = PHOTO
  margins[name] = [resume.settings.marginHorizontal, resume.settings.marginVertical]
  const file = path.join(outDir, `${name}.pdf`)
  try {
    await renderToFile(<ResumePDF resume={resume} />, file)
    console.log('ok   ', name)
  } catch (err) {
    console.log('FAIL ', name, err instanceof Error ? err.message : err)
  }
}

async function main() {
  if (matrix) {
    for (const [name, [base, extra]] of Object.entries(MATRIX)) {
      const sample = createSampleResume()
      const resume: Resume = name === 'cover-letter'
        ? { ...createNewCoverLetter('Cover Letter'), sections: sample.sections }
        : sample
      resume.template = base
      resume.settings = { ...resume.settings, ...getTemplateSettings(base), ...extra }
      await render(name, stress ? stressify(resume) : resume)
    }
  } else {
    const ids = Object.keys(TEMPLATE_META) as TemplateId[]
    for (const id of ids) {
      const sample = allSectionsFlag ? allSectionsResume() : createSampleResume()
      const resume = stress ? stressify(sample) : sample
      resume.template = id
      resume.settings = {
        ...resume.settings,
        ...getTemplateSettings(id),
        ...(headerSidebar ? { headerLayout: 'sidebar' as const } : {}),
      }
      await render(id, resume)
    }
  }
  fs.writeFileSync(path.join(outDir, 'margins.json'), JSON.stringify(margins))
}

main()
