'use client'
import { useState } from 'react'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, GraduationCap, MapPin, Calendar, Award, type LucideIcon } from 'lucide-react'
import type { EducationItem } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'
import { MonthYearPicker } from '../MonthYearPicker'
import { FieldLabel, EntryCard, ToggleRow } from '../EditorPrimitives'

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

export function EducationSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = (section?.items as EducationItem[]) || []
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null)

  function add() {
    const id = generateId()
    updateItems([{
      id, institution: '', degree: '', field: '',
      location: '', startDate: '', endDate: '', present: false, gpa: '', description: '',
    }, ...items])
    setOpenId(id)
  }

  function update(id: string, changes: Partial<EducationItem>) {
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
            title={item.degree ? `${item.degree}${item.field ? ` in ${item.field}` : ''}` : 'New Education'}
            subtitle={item.institution}
            isOpen={openId === item.id}
            onOpenChange={(open) => setOpenId(open ? item.id : null)}
            onRemove={() => remove(item.id)}
            onDuplicate={() => duplicate(item.id)}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Institution" icon={GraduationCap}>
                  <Input 
                    placeholder="e.g. Stanford University"
                    className="h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20" 
                    value={item.institution} 
                    onChange={(e) => update(item.id, { institution: e.target.value })} 
                  />
                </Field>
                <Field label="Location" icon={MapPin}>
                  <Input 
                    placeholder="e.g. Stanford, CA"
                    className="h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20" 
                    value={item.location} 
                    onChange={(e) => update(item.id, { location: e.target.value })} 
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Degree" icon={Award}>
                  <Input 
                    placeholder="e.g. Bachelor of Science"
                    className="h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20" 
                    value={item.degree} 
                    onChange={(e) => update(item.id, { degree: e.target.value })} 
                  />
                </Field>
                <Field label="Field of Study" icon={Award}>
                  <Input 
                    placeholder="e.g. Computer Science"
                    className="h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20" 
                    value={item.field} 
                    onChange={(e) => update(item.id, { field: e.target.value })} 
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Field label="Start Date" icon={Calendar}>
                  <MonthYearPicker
                    value={item.startDate}
                    onChange={(v) => update(item.id, { startDate: v })}
                  />
                </Field>
                <Field label="End Date" icon={Calendar}>
                  <MonthYearPicker
                    value={item.endDate}
                    disabled={item.present}
                    onChange={(v) => update(item.id, { endDate: v })}
                  />
                </Field>
              </div>

              <Field label="GPA" icon={Award}>
                <Input
                  placeholder="e.g. 3.8/4.0"
                  className="h-9 text-xs bg-muted/20 border-border/50 focus-visible:ring-primary/20"
                  value={item.gpa}
                  onChange={(e) => update(item.id, { gpa: e.target.value })}
                />
              </Field>

              <div className="flex items-center justify-end">
                <ToggleRow
                  id={`present-edu-${item.id}`}
                  label="I currently study here"
                  checked={item.present}
                  onCheckedChange={(v) => update(item.id, { present: v })}
                />
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
          Add Education
        </span>
      </Button>
    </div>
  )
}
