'use client'
import React, { useEffect, useRef, useState } from 'react'
import { FieldLabel } from '@/components/editor/EditorPrimitives'
import { Textarea } from '@/components/ui/textarea'
import { FOOTER_PLACEHOLDERS } from '@/lib/utils/footer'
import type { ResumeSettings } from '@/lib/store/types'

type Column = 'footerLeft' | 'footerCenter' | 'footerRight'

const COLUMNS: { key: Column; label: string; placeholder: string }[] = [
  { key: 'footerLeft', label: 'Left Column', placeholder: 'e.g. {{name}}' },
  { key: 'footerCenter', label: 'Center Column', placeholder: 'Optional' },
  { key: 'footerRight', label: 'Right Column', placeholder: 'e.g. {{page}} / {{pages}}' },
]

/** Typing settles for this long before the preview re-lays out the pages. */
const DEBOUNCE_MS = 250

/**
 * Settings for turning the custom footer on or off. Turning it on the first
 * time starts the columns from what the simple switches showed, so nothing on
 * the page jumps.
 */
export function customFooterUpdates(s: ResumeSettings, on: boolean): Partial<ResumeSettings> {
  if (!on || s.footerLeft || s.footerCenter || s.footerRight) return { footerCustom: on }
  return {
    footerCustom: true,
    footerLeft: s.footerName ? '{{name}}' : '',
    footerCenter: s.footerEmail ? '{{email}}' : '',
    footerRight: s.footerPageNumbers
      ? (s.footerPageFormat === 'of-total' ? '{{page}} / {{pages}}'
        : s.footerPageFormat === 'page-of' ? 'Page {{page}} of {{pages}}'
        : '{{page}}')
      : '',
  }
}

/**
 * The custom footer's three free-text columns. The chips insert a placeholder
 * at the caret of the column you last typed in (the left one if none yet).
 */
export function CustomFooterEditor({ s, upd }: {
  s: ResumeSettings
  upd: (updates: Partial<ResumeSettings>) => void
}) {
  const [draft, setDraft] = useState<Record<Column, string>>(() => ({
    footerLeft: s.footerLeft ?? '',
    footerCenter: s.footerCenter ?? '',
    footerRight: s.footerRight ?? '',
  }))
  const refs = useRef<Record<Column, HTMLTextAreaElement | null>>({ footerLeft: null, footerCenter: null, footerRight: null })
  const lastFocused = useRef<Column>('footerLeft')
  const pending = useRef<Partial<Record<Column, string>>>({})
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Another resume loaded, or undo: take the saved text. Our own saves come
  // back as the same text the draft already holds, so they change nothing.
  const saved = `${s.footerLeft ?? ''}\u0000${s.footerCenter ?? ''}\u0000${s.footerRight ?? ''}`
  const [lastSaved, setLastSaved] = useState(saved)
  if (saved !== lastSaved) {
    setLastSaved(saved)
    setDraft({ footerLeft: s.footerLeft ?? '', footerCenter: s.footerCenter ?? '', footerRight: s.footerRight ?? '' })
  }

  function flush() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    if (Object.keys(pending.current).length) {
      upd(pending.current)
      pending.current = {}
    }
  }

  useEffect(() => () => flush(), []) // eslint-disable-line react-hooks/exhaustive-deps

  function change(col: Column, value: string) {
    setDraft((d) => ({ ...d, [col]: value }))
    pending.current[col] = value
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(flush, DEBOUNCE_MS)
  }

  function insert(token: string) {
    const col = lastFocused.current
    const el = refs.current[col]
    const value = draft[col]
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    const next = value.slice(0, start) + token + value.slice(end)
    change(col, next)
    flush()
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      el.setSelectionRange(start + token.length, start + token.length)
    })
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-3">
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Pick another layout above to go back. Click a placeholder to add it where you&apos;re typing.
      </p>

      <div>
        <FieldLabel>Insert Placeholders</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {FOOTER_PLACEHOLDERS.map((p) => (
            <button
              key={p.key}
              type="button"
              // Keep the caret in the column while clicking.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insert(p.token)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium hover:border-foreground/30 hover:bg-accent transition-colors"
            >
              {p.label}
              <code className="text-[10px] text-muted-foreground">{p.token}</code>
            </button>
          ))}
        </div>
      </div>

      {COLUMNS.map((c) => (
        <div key={c.key}>
          <FieldLabel>{c.label}</FieldLabel>
          <Textarea
            ref={(el) => { refs.current[c.key] = el }}
            value={draft[c.key]}
            placeholder={c.placeholder}
            rows={1}
            onFocus={() => { lastFocused.current = c.key }}
            onBlur={flush}
            onChange={(e) => change(c.key, e.target.value)}
            className="min-h-9 resize-none bg-background text-xs md:text-xs font-mono"
          />
        </div>
      ))}
    </div>
  )
}
