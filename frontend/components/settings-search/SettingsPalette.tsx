'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, CornerDownLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsSearch } from '@/lib/store/settingsSearchStore'
import { contentEntries, searchSettings, settingsFor, TAB_LABELS } from '@/lib/settings/settingsIndex'
import type { Resume } from '@/lib/store/types'

export function isMacPlatform() {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
}

/** The shortcut as the platform writes it. */
export function settingsSearchShortcut() {
  return isMacPlatform() ? '⌘P' : 'Ctrl+P'
}

/** `text` with the characters at `positions` emphasised. */
function Highlighted({ text, positions }: { text: string; positions: number[] }) {
  if (!positions.length) return <>{text}</>
  const set = new Set(positions)
  return (
    <>
      {Array.from(text).map((ch, i) =>
        set.has(i) ? <span key={i} className="text-foreground font-semibold">{ch}</span> : <span key={i}>{ch}</span>,
      )}
    </>
  )
}

/**
 * Quick search over the builder, like VS Code's ⌘P: this document's sections
 * and fields (Content) and every Customize setting (Style). Opens with
 * ⌘P / Ctrl+P anywhere in the builder (taking that key from the browser's
 * print dialog). Arrow keys move, Enter opens the setting, Escape closes.
 */
export function SettingsPalette({ resume }: { resume: Pick<Resume, 'kind' | 'sections'> }) {
  const kind = resume.kind === 'coverLetter' ? 'coverLetter' : 'resume'
  const { open, setOpen, reveal } = useSettingsSearch()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  // Content (this document's sections and fields) first, then Style settings.
  const entries = useMemo(
    () => [...contentEntries(resume), ...settingsFor(kind)],
    [resume.kind, resume.sections, kind], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const results = useMemo(() => searchSettings(entries, query), [entries, query])

  // ⌘P / Ctrl+P toggles the palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        const next = !useSettingsSearch.getState().open
        if (next) returnFocus.current = document.activeElement as HTMLElement | null
        setOpen(next)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [setOpen])

  // A fresh search each time: cleared on close, focused on open.
  useEffect(() => {
    if (!open) {
      setQuery('')
      setIndex(0)
      return
    }
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  useEffect(() => setIndex(0), [query])

  // Keep the highlighted row in view.
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [index])

  if (!open) return null

  const close = (restore = true) => {
    setOpen(false)
    if (restore) returnFocus.current?.focus?.()
  }
  const choose = (i: number) => {
    const r = results[i]
    if (r) reveal(r.entry)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex((i) => (results.length ? (i + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(index)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center items-start pt-[12vh] bg-black/20 dark:bg-black/40"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search settings"
        className="w-[560px] max-w-[calc(100vw-32px)] rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2 px-3 h-11 border-b border-border">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections, fields and settings…"
            aria-label="Search settings"
            aria-controls="settings-search-results"
            aria-activedescendant={results[index] ? `setting-${results[index].entry.id}` : undefined}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">esc</kbd>
        </div>

        <div
          ref={listRef}
          id="settings-search-results"
          role="listbox"
          className="max-h-[360px] overflow-y-auto py-1 custom-scrollbar"
        >
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">No settings match “{query}”.</p>
          ) : (
            results.map((r, i) => (
              <div
                key={r.entry.id}
                id={`setting-${r.entry.id}`}
                data-index={i}
                role="option"
                aria-selected={i === index}
                onMouseMove={() => setIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                className={cn(
                  'mx-1 px-3 py-1.5 rounded-md flex items-center gap-3 cursor-pointer',
                  i === index ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                )}
              >
                <span className="text-[13px] text-foreground/90 truncate">
                  <Highlighted text={r.entry.label} positions={r.labelPositions} />
                </span>
                <span className="text-[11px] text-muted-foreground/70 truncate">
                  {TAB_LABELS[r.entry.tab]}
                  {r.entry.group && r.entry.group !== r.entry.label ? ` › ${r.entry.group}` : ''}
                </span>
                {r.entry.note && (
                  <span className="ml-auto shrink-0 text-[10px] text-muted-foreground/70 border border-border rounded px-1.5 py-0.5">
                    {r.entry.note}
                  </span>
                )}
                {i === index && !r.entry.note && (
                  <CornerDownLeft size={12} className="ml-auto shrink-0 text-muted-foreground/60" />
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 px-3 h-8 border-t border-border text-[10px] text-muted-foreground/70">
          <span><kbd className="font-mono">↑↓</kbd> to move</span>
          <span><kbd className="font-mono">↵</kbd> to open</span>
          <span className="ml-auto">{settingsSearchShortcut()} to toggle</span>
        </div>
      </div>
    </div>
  )
}

/** The "Search ⌘P" button in a panel header, for people who do not know the shortcut. */
export function SearchButton({ className }: { className?: string }) {
  const setOpen = useSettingsSearch((s) => s.setOpen)
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Search the builder"
      className={cn(
        'flex items-center gap-1.5 h-6 px-2 rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0',
        className,
      )}
    >
      <Search size={11} />
      Search
      <kbd className="font-mono text-[9px] border border-border rounded px-1 py-px">{settingsSearchShortcut()}</kbd>
    </button>
  )
}
