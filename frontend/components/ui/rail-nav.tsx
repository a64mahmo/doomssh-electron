'use client'
import { useEffect, type ComponentType, type ReactNode } from 'react'
import { create } from 'zustand'
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/**
 * The narrow navigation column at the left of the builder's Content and Style
 * panels (resume editor, cover letter editor, Customize).
 *
 * Collapsed (the default) it shows icons, with names in tooltips. Expanded it
 * shows each icon with its name. The toggle at the bottom switches it, and the
 * choice is shared by every rail and remembered in this browser.
 */

const STORAGE_KEY = 'doomssh:rail-expanded'

interface RailStore {
  expanded: boolean
  hydrated: boolean
  setExpanded: (expanded: boolean) => void
  hydrate: () => void
}

export const useRail = create<RailStore>()((set) => ({
  expanded: false,
  hydrated: false,
  setExpanded: (expanded) => {
    set({ expanded })
    try {
      localStorage.setItem(STORAGE_KEY, expanded ? '1' : '0')
    } catch {
      // Storage can be blocked (private window); the choice then lasts this session.
    }
  },
  hydrate: () => {
    let expanded = false
    try {
      expanded = localStorage.getItem(STORAGE_KEY) === '1'
    } catch {}
    set({ expanded, hydrated: true })
  },
}))

export function RailNav({ label, children }: { label: string; children: ReactNode }) {
  const { expanded, hydrated, setExpanded, hydrate } = useRail()
  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  const ToggleIcon = expanded ? PanelLeftClose : PanelLeftOpen
  const toggleLabel = expanded ? 'Collapse navigation' : 'Show names'

  return (
    <nav
      aria-label={label}
      data-expanded={expanded || undefined}
      className={cn(
        'border-r border-border flex flex-col shrink-0 bg-sidebar transition-[width] duration-150 ease-out motion-reduce:transition-none',
        expanded ? 'w-44' : 'w-12',
      )}
    >
      <div
        className={cn(
          'flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col py-3 gap-1',
          expanded ? 'items-stretch px-2' : 'items-center',
        )}
      >
        {children}
      </div>

      <div className={cn('shrink-0 border-t border-border/60 py-2 flex', expanded ? 'px-2' : 'justify-center')}>
        <RailTooltip label={toggleLabel} show={!expanded}>
          <TooltipTrigger
            type="button"
            aria-label={toggleLabel}
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            className={cn(
              'flex items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              expanded ? 'w-full h-8 gap-2.5 px-2.5 text-xs' : 'w-9 h-9 justify-center',
            )}
          >
            <ToggleIcon size={16} strokeWidth={1.8} className="shrink-0" />
            {expanded && <span>Collapse</span>}
          </TooltipTrigger>
        </RailTooltip>
      </div>
    </nav>
  )
}

/** A tooltip to the right that only appears while the rail is collapsed. */
function RailTooltip({ label, show, children }: { label: ReactNode; show: boolean; children: ReactNode }) {
  return (
    <Tooltip>
      {children}
      {show && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  )
}

export function RailItem({
  icon: Icon,
  label,
  tooltip,
  active,
  muted,
  onClick,
  testId,
  className,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  /** Richer collapsed tooltip; defaults to the label. */
  tooltip?: ReactNode
  active: boolean
  /** Dimmed, e.g. a section hidden from the resume. */
  muted?: boolean
  onClick: () => void
  testId?: string
  className?: string
}) {
  const expanded = useRail((s) => s.expanded)
  return (
    <RailTooltip label={tooltip ?? label} show={!expanded}>
      <TooltipTrigger
        type="button"
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        title={expanded ? label : undefined}
        data-testid={testId}
        onClick={onClick}
        className={cn(
          'flex items-center rounded-xl transition-colors shrink-0 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          expanded ? 'w-full h-8 gap-2.5 px-2.5 rounded-lg' : 'w-9 h-9 justify-center',
          active
            ? 'bg-foreground text-background shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          muted && !active && 'opacity-45',
          className,
        )}
      >
        <Icon size={16} strokeWidth={active ? 2.4 : 1.8} className="shrink-0" />
        {expanded && <span className="text-xs font-medium truncate">{label}</span>}
      </TooltipTrigger>
    </RailTooltip>
  )
}

/** A thin rule between groups of items. */
export function RailDivider() {
  const expanded = useRail((s) => s.expanded)
  return <div className={cn('h-px bg-border/60 shrink-0 my-1', expanded ? 'mx-1' : 'w-6 self-center')} />
}

/**
 * The two-line collapsed tooltip every rail uses: the name, and under it a
 * short description of what the item holds.
 */
export function RailTooltipBody({ label, description, note }: {
  label: ReactNode
  description: ReactNode
  /** An extra muted line, e.g. that a section is hidden. */
  note?: ReactNode
}) {
  return (
    <span className="flex flex-col gap-0.5 max-w-[160px]">
      <span className="font-semibold text-xs">{label}</span>
      <span className="text-[10px] text-muted-foreground leading-relaxed">{description}</span>
      {note && <span className="text-[10px] text-muted-foreground/70 italic leading-relaxed">{note}</span>}
    </span>
  )
}
