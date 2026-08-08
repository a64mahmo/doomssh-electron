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
fs.mkdirSync(outDir, { recursive: true })

async function main() {
  const ids = Object.keys(TEMPLATE_META) as TemplateId[]
  for (const id of ids) {
    const resume = createSampleResume()
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
