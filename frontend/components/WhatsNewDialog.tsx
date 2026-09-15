'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WHATS_NEW, type WhatsNewTag } from '@/lib/whatsNew'
import { cn } from '@/lib/utils'

const TAG_STYLE: Record<WhatsNewTag, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  improved: { label: 'Improved', className: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' },
  fixed: { label: 'Fixed', className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
}

export function WhatsNewDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle>What’s New</DialogTitle>
          <DialogDescription>Recent changes to DoomSSH.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-8">
          {WHATS_NEW.map((entry) => (
            <section key={entry.id} aria-labelledby={`whats-new-${entry.id}`}>
              <p className="text-[11px] font-medium text-muted-foreground">{entry.date}</p>
              <h3 id={`whats-new-${entry.id}`} className="text-sm font-semibold tracking-tight mt-0.5 mb-3">
                {entry.title}
              </h3>
              <ul className="space-y-2">
                {entry.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <span
                      className={cn(
                        'mt-0.5 shrink-0 w-16 text-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        TAG_STYLE[item.tag].className,
                      )}
                    >
                      {TAG_STYLE[item.tag].label}
                    </span>
                    <span className="text-foreground/90">{item.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
