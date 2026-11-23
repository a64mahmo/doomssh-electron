'use client'
import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/*
 * Little drawings of a page's bottom edge for the footer options, in the same
 * bar-and-dot language as the Entry layout tiles: faint body lines, then the
 * footer row. Slots: name (solid bar), email (lighter bar), page (tiny number).
 */

type Slot = 'name' | 'email' | 'page' | 'pen' | null

function SlotMark({ kind }: { kind: Slot }) {
  if (kind === 'name') return <div className="h-1 w-5 bg-current rounded-full opacity-70" />
  if (kind === 'email') return <div className="h-1 w-6 bg-current rounded-full opacity-40" />
  if (kind === 'page') return <span className="text-[7px] font-black leading-none tabular-nums">1/3</span>
  if (kind === 'pen') return <div className="h-1 w-4 rounded-full border border-dashed border-current opacity-60" />
  return <div className="w-4" />
}

export function FooterSketch({ left, center, right, off }: {
  left?: Slot
  center?: Slot
  right?: Slot
  /** No footer: the body runs to the bottom. */
  off?: boolean
}) {
  return (
    <div className="w-full px-2.5 flex flex-col gap-[3px]">
      <div className="h-[3px] w-full bg-current opacity-15 rounded-full" />
      <div className="h-[3px] w-4/5 bg-current opacity-15 rounded-full" />
      {off ? (
        <div className="h-[3px] w-3/5 bg-current opacity-15 rounded-full" />
      ) : (
        <div className="mt-[3px] grid grid-cols-[1fr_auto_1fr] items-center gap-1 h-2">
          <div className="flex justify-start"><SlotMark kind={left ?? null} /></div>
          <div className="flex justify-center">{center ? <SlotMark kind={center} /> : <div className="w-0" />}</div>
          <div className="flex justify-end"><SlotMark kind={right ?? null} /></div>
        </div>
      )}
    </div>
  )
}

export function DividerSketch({ line }: { line: boolean }) {
  return (
    <div className="w-full px-3 flex flex-col gap-[3px]">
      <div className="h-[3px] w-4/5 bg-current opacity-15 rounded-full" />
      <div className={cn('h-px w-full mt-0.5', line ? 'bg-current opacity-60' : 'bg-transparent')} />
      <div className="flex items-center justify-between">
        <div className="h-1 w-5 bg-current rounded-full opacity-60" />
        <span className="text-[7px] font-black leading-none">1/3</span>
      </div>
    </div>
  )
}

/** Icon pill that turns one footer item on or off. */
export function FooterChip({ label, text, icon: Icon, checked, onChange }: {
  /** Matches the settings search entry (data-setting-label). */
  label: string
  text: string
  icon: LucideIcon
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      data-setting-row
      data-setting-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-xl border h-14 transition-all duration-200',
        checked
          ? 'bg-primary/10 border-primary text-primary'
          : 'bg-muted/20 border-border/50 text-muted-foreground/60 hover:border-border hover:bg-muted/40',
      )}
    >
      <Icon size={15} strokeWidth={2.2} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{text}</span>
    </button>
  )
}
