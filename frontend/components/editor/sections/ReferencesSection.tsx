'use client'
import { useState } from 'react'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { DebouncedInput } from '@/components/ui/debounced-input'
import { Plus, User, Building2, Briefcase, Mail, Phone, type LucideIcon } from 'lucide-react'
import type { ReferenceItem } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'
import { FieldLabel, EntryCard } from '../EditorPrimitives'

interface Props { sectionId: string }

function Field({ label, icon: Icon, children }: { label: string; icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-0.5">
        {Icon && <Icon size={12} className="text-muted-foreground/50" />}
        <FieldLabel className="mb-0">{label}</FieldLabel>
      </div>
      {children}
    </div>
  )
}

export function ReferencesSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = (section?.items as ReferenceItem[]) || []
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null)

  function add() {
    const id = generateId()
    updateItems([{ id, name: '', position: '', company: '', email: '', phone: '' }, ...items])
    setOpenId(id)
  }

  function update(id: string, changes: Partial<ReferenceItem>) {
    updateItems(items.map((it) => it.id === id ? { ...it, ...changes } : it))
  }

  function remove(id: string) {
    updateItems(items.filter((it) => it.id !== id))
    if (openId === id) setOpenId(null)
  }

  function duplicate(id: string) {
    const item = items.find((it) => it.id === id)
    if (!item) return
    const newId = generateId()
    const copy = { ...item, id: newId }
    const idx = items.findIndex((it) => it.id === id)
    const next = [...items]
    next.splice(idx + 1, 0, copy)
    updateItems(next)
    setOpenId(newId)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        {items.map((item, index) => (
          <EntryCard
            key={item.id}
            index={index}
            title={item.name || 'New Reference'}
            subtitle={item.position ? `${item.position}${item.company ? ` at ${item.company}` : ''}` : item.company}
            isOpen={openId === item.id}
            onOpenChange={(open) => setOpenId(open ? item.id : null)}
            onRemove={() => remove(item.id)}
            onDuplicate={() => duplicate(item.id)}
          >
            <div className="space-y-5">
              <Field label="Reference Name" icon={User}>
<DebouncedInput 
                    placeholder="e.g. Jane Smith"
                    className="h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20" 
                    value={item.name} 
                    onChange={(v) => update(item.id, { name: v })} 
                  />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Position" icon={Briefcase}>
                  <DebouncedInput 
                    placeholder="e.g. CTO"
                    className="h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20" 
                    value={item.position} 
                    onChange={(v) => update(item.id, { position: v })} 
                  />
                </Field>
                <Field label="Company" icon={Building2}>
                  <DebouncedInput 
                    placeholder="e.g. Acme Corp"
                    className="h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20" 
                    value={item.company} 
                    onChange={(v) => update(item.id, { company: v })} 
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" icon={Mail}>
                  <DebouncedInput 
                    placeholder="jane@example.com"
                    className="h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20" 
                    value={item.email} 
                    onChange={(v) => update(item.id, { email: v })} 
                  />
                </Field>
                <Field label="Phone" icon={Phone}>
                  <DebouncedInput 
                    placeholder="+1 (555) 000-0000"
                    className="h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20" 
                    value={item.phone} 
                    onChange={(v) => update(item.id, { phone: v })} 
                  />
                </Field>
              </div>
            </div>
          </EntryCard>
        ))}
      </div>

      <Button 
        variant="outline" 
        onClick={add}
        className="w-full h-12 border-dashed border-2 bg-muted/20 hover:bg-muted/40 hover:border-foreground/20 rounded-2xl flex items-center justify-center gap-2 transition-all group"
      >
        <div className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus size={14} className="text-foreground" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          Add Reference
        </span>
      </Button>
    </div>
  )
}
