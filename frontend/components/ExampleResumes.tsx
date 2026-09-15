'use client'

import { useState } from 'react'
import { FileText, Lock, Download, Loader2, X } from 'lucide-react'
import {
  createSampleResumeDesigner,
  createSampleResumeProductManager,
  createSampleResumeRecentGrad,
} from '@/lib/db/database'
import type { Resume } from '@/lib/store/types'
import { cn } from '@/lib/utils'

const EXAMPLES: { key: string; title: string; subtitle: string; accent: string; create: () => Resume }[] = [
  { key: 'pm', title: 'Product Manager', subtitle: 'Modern template', accent: 'from-violet-500 to-indigo-600', create: createSampleResumeProductManager },
  { key: 'designer', title: 'Designer', subtitle: 'Crisp template', accent: 'from-sky-500 to-blue-600', create: createSampleResumeDesigner },
  { key: 'grad', title: 'New Grad', subtitle: 'Minimal template', accent: 'from-zinc-400 to-zinc-600', create: createSampleResumeRecentGrad },
]

const HIDDEN_KEY = 'doomssh:examples-hidden'

/** Per-browser preference; storage can be blocked, so failures fall back to "shown". */
export function readExamplesHidden(): boolean {
  try {
    return window.localStorage.getItem(HIDDEN_KEY) === '1'
  } catch {
    return false
  }
}

export function writeExamplesHidden(hidden: boolean): void {
  try {
    if (hidden) window.localStorage.setItem(HIDDEN_KEY, '1')
    else window.localStorage.removeItem(HIDDEN_KEY)
  } catch {
    // Ignore: the section just shows again next visit.
  }
}

/**
 * "Start from an example" section under the Resumes grid. It stays put after the
 * first resume is created (so the page doesn't change shape on a first-time user)
 * until they hide it. Nothing is created until an example is picked.
 */
export function ExampleResumes({ onPick, onHide, headingRef }: {
  onPick: (resume: Resume) => Promise<void> | void
  onHide: () => void
  /** Lets the page move focus here after "Browse examples". */
  headingRef?: React.Ref<HTMLHeadingElement>
}) {
  const [busy, setBusy] = useState<string | null>(null)

  async function pick(key: string, create: () => Resume) {
    if (busy) return
    setBusy(key)
    try {
      await onPick(create())
    } finally {
      setBusy(null)
    }
  }

  return (
    <section aria-labelledby="examples-heading" className="mt-12 pt-10 pb-1 border-t border-border space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 id="examples-heading" ref={headingRef} tabIndex={-1} className="text-base font-semibold tracking-tight scroll-mt-6 rounded outline-none focus-visible:ring-2 focus-visible:ring-ring/50">Start from an example</h3>
          <p className="text-sm text-muted-foreground">Open a copy, then replace the details with your own.</p>
        </div>
        <button
          type="button"
          onClick={onHide}
          className="shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X size={12} />
          Hide
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.key}
            type="button"
            onClick={() => pick(ex.key, ex.create)}
            disabled={busy !== null}
            className="group relative aspect-[3/4] rounded-xl overflow-hidden text-left disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-70 transition-opacity group-hover:opacity-100', ex.accent)} />
            <div className="absolute inset-0 p-4 flex flex-col gap-2 pt-6" aria-hidden>
              <div className="w-2/3 mx-auto h-2 rounded-full bg-white/40" />
              <div className="w-1/2 mx-auto h-1.5 rounded-full bg-white/25 mb-1" />
              {[...Array(6)].map((_, j) => (
                <div key={j} className="h-1 rounded-full bg-white/20" style={{ width: `${50 + (j * 11) % 40}%` }} />
              ))}
            </div>
            <div className="absolute top-2 left-2 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Example
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-white text-xs font-semibold leading-tight flex items-center gap-1.5">
                {busy === ex.key && <Loader2 size={12} className="animate-spin" />}
                {ex.title}
              </p>
              <p className="text-white/70 text-[10px] mt-0.5">{ex.subtitle}</p>
            </div>
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Lock, title: 'Private by default', text: 'Everything stays in this browser. No account, no upload.' },
          { icon: FileText, title: 'Pick any template', text: 'Switch templates and styles without retyping anything.' },
          { icon: Download, title: 'Download a PDF', text: 'What you see in the preview is what you get.' },
        ].map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3 rounded-xl border border-border p-4">
            <Icon size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
