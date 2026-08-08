/**
 * Dev-only harness: renders the sample resume through every template preset
 * so the PDF output can be eyeballed. Run: npx tsx scripts/render-templates.tsx <outDir>
 */
import path from 'node:path'
import fs from 'node:fs'
import React from 'react'
import { Font, renderToFile } from '@react-pdf/renderer'
import { ResumePDF } from '@/components/pdf/ResumePDF'
import { getTemplateSettings, TEMPLATE_META } from '@/components/web'
import { createSampleResume } from '@/lib/db/database'
import type { TemplateId } from '@/lib/store/types'

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
fs.mkdirSync(outDir, { recursive: true })

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

async function main() {
  const ids = Object.keys(TEMPLATE_META) as TemplateId[]
  for (const id of ids) {
    const resume = stress ? stressify(createSampleResume()) : createSampleResume()
    resume.template = id
    resume.settings = { ...resume.settings, ...getTemplateSettings(id) }
    const file = path.join(outDir, `${id}.pdf`)
    try {
      await renderToFile(<ResumePDF resume={resume} />, file)
      console.log('ok   ', id)
    } catch (err) {
      console.log('FAIL ', id, err instanceof Error ? err.message : err)
    }
  }
}

main()
