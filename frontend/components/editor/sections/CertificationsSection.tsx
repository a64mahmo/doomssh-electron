'use client'
import { useState } from 'react'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Award, Building2, Calendar, Link as LinkIcon, type LucideIcon } from 'lucide-react'
import type { CertificationItem } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'
import { MonthYearPicker } from '../MonthYearPicker'
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

export function CertificationsSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = (section?.items as CertificationItem[]) || []
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null)

  function add() {
    const id = generateId()
    updateItems([{ id, name: '', issuer: '', date: '', url: '' }, ...items])
    setOpenId(id)
  }

  function update(id: string, changes: Partial<CertificationItem>) {
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
            title={item.name || 'New Certification'}
            subtitle={item.issuer}
            isOpen={openId === item.id}
            onOpenChange={(open) => setOpenId(open ? item.id : null)}
            onRemove={() => remove(item.id)}
            onDuplicate={() => duplicate(item.id)}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Certification Name" icon={Award}>
                  <Input 
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="h-10 text-sm bg-muted/20 border-border/50 focus-visible:ring-primary/20" 
                    value={item.name} 
                    onChange={(e) => update(item.id, { name: e.target.value })} 
                  />
                </Field>
                <Field label="Issuer" icon={Building2}>
                  <Input 
                    placeholder="e.g. Amazon Web Services"
                    className="h-10 text-sm bg-muted/20 border-border/50 focus-visible:ring-primary/20" 
                    value={item.issuer} 
                    onChange={(e) => update(item.id, { issuer: e.target.value })} 
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Field label="Date" icon={Calendar}>
                  <MonthYearPicker
                    value={item.date}
                    onChange={(v) => update(item.id, { date: v })}
                  />
                </Field>
              </div>

              <Field label="URL / Link" icon={LinkIcon}>
                <Input
                  placeholder="https://..."
                  className="h-10 text-sm bg-muted/20 border-border/50 focus-visible:ring-primary/20"
                  value={item.url}
                  onChange={(e) => update(item.id, { url: e.target.value })}
                />
              </Field>
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
          Add Certification
        </span>
      </Button>
    </div>
  )
}
