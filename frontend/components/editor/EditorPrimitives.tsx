import React from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, Trash2, Copy, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Label className={cn('block text-[10px] font-bold text-muted-foreground/80 mb-1.5 tracking-wide', className)}>
      {children}
    </Label>
  )
}

export function ControlGroup({ title, children, className, rightElement }: { title?: string; children: React.ReactNode; className?: string; rightElement?: React.ReactNode }) {
  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <div className="flex items-center justify-between pb-1 border-b border-border/40">
          <p className="text-[9px] font-bold text-muted-foreground/35 uppercase tracking-[0.12em]">
            {title}
          </p>
          {rightElement}
        </div>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

interface EntryCardProps {
  title: string
  subtitle?: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onRemove?: () => void
  onDuplicate?: () => void
  children: React.ReactNode
  index?: number
}

export function EntryCard({
  title,
  subtitle,
  isOpen,
  onOpenChange,
  onRemove,
  onDuplicate,
  children,
  index
}: EntryCardProps) {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpenChange}
      className={cn(
        'group rounded-xl border transition-all duration-200 overflow-hidden',
        isOpen 
          ? 'bg-card border-foreground/10 shadow-sm mb-4' 
          : 'bg-muted/20 border-border/50 hover:border-foreground/20 mb-2 hover:bg-muted/40'
      )}
    >
      <div className="flex items-center gap-1 pl-1.5">
        <div className="cursor-grab text-muted-foreground/20 hover:text-foreground/40 transition-colors p-1 shrink-0">
          <GripVertical size={13} />
        </div>
        
        <CollapsibleTrigger className="flex-1 flex items-center py-2.5 text-left outline-none min-w-0 group/trigger">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[9px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-foreground/5 text-muted-foreground/50 transition-colors shrink-0",
                isOpen && "bg-foreground/10 text-foreground/60"
              )}>
                {(index !== undefined ? index + 1 : 1).toString().padStart(2, '0')}
              </span>
              <h4 className={cn(
                'text-[13px] font-bold truncate transition-colors leading-tight',
                isOpen ? 'text-foreground' : 'text-foreground/70'
              )}>
                {title || <span className="text-muted-foreground/30 italic font-medium">Untitled Entry</span>}
              </h4>
            </div>
            {subtitle && !isOpen && (
              <p className="text-[10px] text-muted-foreground/50 mt-0.5 ml-[2.2rem] truncate font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </CollapsibleTrigger>

        <div className="flex items-center gap-0.5 shrink-0 pr-2">
          {onDuplicate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              onClick={onDuplicate}
              title="Duplicate"
            >
              <Copy size={13} />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              onClick={onRemove}
              title="Remove"
            >
              <Trash2 size={13} />
            </Button>
          )}
          <CollapsibleTrigger className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/40 transition-all hover:bg-foreground/5 outline-none">
            <ChevronDown size={14} strokeWidth={2.5} className={cn("transition-transform duration-200", isOpen && "rotate-180 text-foreground")} />
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent>
        <div className="px-4 pb-5 pt-1 border-t border-border/40 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function SliderRow({
  id,
  label,
  description,
  value,
  min, max, step,
  unit = '',
  onChange,
}: {
  id?: string
  label: string
  description?: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
}) {
  const display = unit ? `${value}${unit}` : value.toString()
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <label htmlFor={id} className="text-[10px] font-bold text-muted-foreground/80 tracking-wide cursor-pointer">{label}</label>
          {description && <p className="text-[9px] text-muted-foreground/50 mt-0.5">{description}</p>}
        </div>
        <span className="text-[10px] font-mono tabular-nums text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
          {display}
        </span>
      </div>
      <Slider 
        id={id}
        min={min} 
        max={max} 
        step={step} 
        value={[value]} 
        onValueChange={(v) => {
          const val = Array.isArray(v) ? v[0] : v
          if (typeof val === 'number') onChange(val)
        }} 
      />
    </div>
  )
}

export function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  description?: string
  checked?: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 h-8 px-1 rounded-md hover:bg-accent/50 transition-colors cursor-pointer group">
      <div className="flex flex-col justify-center overflow-hidden">
        <label htmlFor={id} className="text-xs font-medium cursor-pointer select-none leading-tight truncate">
          {label}
        </label>
        {description && (
          <p className="text-[10px] text-muted-foreground/60 truncate">{description}</p>
        )}
      </div>
      <Switch id={id} checked={checked ?? false} onCheckedChange={onCheckedChange} className="shrink-0" />
    </div>
  )
}

export function SegmentGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; render: () => React.ReactNode; label: string }[]
}) {
  return (
    <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border/50 gap-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          title={o.label}
          className={cn(
            'flex-1 flex items-center justify-center py-1.5 rounded-md transition-all text-xs cursor-pointer',
            value === o.value
              ? 'bg-background text-foreground shadow-sm font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
          )}
        >
          {o.render()}
        </button>
      ))}
    </div>
  )
}
