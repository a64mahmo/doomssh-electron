'use client'

import { useState } from 'react'
import { FileText, Lock, Download, Plus, Loader2 } from 'lucide-react'
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

/**
 * First-run state for the Resumes dashboard: start blank or open a copy of an
 * example. Nothing is created until the user picks one.
 */
export function WelcomePanel({ onStartBlank, onStartFromExample }: {
  onStartBlank: () => Promise<void> | void
  onStartFromExample: (resume: Resume) => Promise<void> | void
}) {
  const [busy, setBusy] = useState<string | null>(null)

  async function run(key: string, action: () => Promise<void> | void) {
    if (busy) return
    setBusy(key)
    try {
      await action()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-10">
      <div className="max-w-xl space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Build your first resume</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Start from a blank page or open an example and make it yours. Edits save automatically and you can download a PDF at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => run('blank', onStartBlank)}
          disabled={busy !== null}
          className="group aspect-[4/3] sm:aspect-[3/4] rounded-xl border border-dashed border-border hover:border-foreground/30 flex flex-col items-center justify-center gap-3 transition-colors disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <div className="w-10 h-10 rounded-full border border-border group-hover:border-foreground/30 flex items-center justify-center transition-colors">
            {busy === 'blank' ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </div>
          <span className="text-sm font-semibold">Start from scratch</span>
          <span className="text-xs text-muted-foreground">A blank resume</span>
        </button>

        {EXAMPLES.map((ex) => (
          <button
            key={ex.key}
            type="button"
            onClick={() => run(ex.key, () => onStartFromExample(ex.create()))}
            disabled={busy !== null}
            className="group relative aspect-[4/3] sm:aspect-[3/4] rounded-xl overflow-hidden text-left disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-80 transition-opacity group-hover:opacity-100', ex.accent)} />
            <div className="absolute inset-0 p-4 flex flex-col gap-2 pt-6" aria-hidden>
              <div className="w-2/3 mx-auto h-2 rounded-full bg-white/40" />
              <div className="w-1/2 mx-auto h-1.5 rounded-full bg-white/25 mb-1" />
              {[...Array(6)].map((_, j) => (
                <div key={j} className="h-1 rounded-full bg-white/20" style={{ width: `${50 + (j * 11) % 40}%` }} />
              ))}
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-white text-sm font-semibold leading-tight flex items-center gap-1.5">
                {busy === ex.key && <Loader2 size={13} className="animate-spin" />}
                {ex.title}
              </p>
              <p className="text-white/70 text-[11px] mt-0.5">Example · {ex.subtitle}</p>
            </div>
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
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
    </div>
  )
}
