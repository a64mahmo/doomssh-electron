'use client'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, GraduationCap, MapPin, Calendar, Award } from 'lucide-react'
import type { EducationItem } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'
import { MonthYearPicker } from '../MonthYearPicker'

interface Props { sectionId: string }

function Field({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 ml-0.5">
        {Icon && <Icon size={12} className="text-muted-foreground/70" />}
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</Label>
      </div>
      {children}
    </div>
  )
}

export function EducationSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = (section?.items as EducationItem[]) || []

  function add() {
    updateItems([{
      id: generateId(), institution: '', degree: '', field: '',
      location: '', startDate: '', endDate: '', present: false, gpa: '', description: '',
    }, ...items])
  }

  function update(id: string, changes: Partial<EducationItem>) {
    updateItems(items.map((it) => it.id === id ? { ...it, ...changes } : it))
  }

  function remove(id: string) {
    updateItems(items.filter((it) => it.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="group relative bg-background rounded-xl border border-border/60 p-4 pt-5 shadow-sm transition-all hover:border-foreground/10 hover:shadow-md"
          >
            <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-background border border-border rounded text-[9px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
              Entry #{items.length - index}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => remove(item.id)}
            >
              <Trash2 size={14} />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Institution" icon={GraduationCap}>
                <Input 
                  placeholder="e.g. Stanford University"
                  className="h-9 text-xs font-medium focus-visible:ring-1" 
                  value={item.institution} 
                  onChange={(e) => update(item.id, { institution: e.target.value })} 
                />
              </Field>
              <Field label="Location" icon={MapPin}>
                <Input 
                  placeholder="e.g. Stanford, CA"
                  className="h-9 text-xs focus-visible:ring-1" 
                  value={item.location} 
                  onChange={(e) => update(item.id, { location: e.target.value })} 
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Field label="Degree" icon={Award}>
                <Input 
                  placeholder="e.g. Bachelor of Science"
                  className="h-9 text-xs focus-visible:ring-1" 
                  value={item.degree} 
                  onChange={(e) => update(item.id, { degree: e.target.value })} 
                />
              </Field>
              <Field label="Field of Study" icon={Award}>
                <Input 
                  placeholder="e.g. Computer Science"
                  className="h-9 text-xs focus-visible:ring-1" 
                  value={item.field} 
                  onChange={(e) => update(item.id, { field: e.target.value })} 
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-2 grid grid-cols-2 gap-3">
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
              <div className="md:col-span-1">
                <Field label="GPA" icon={Award}>
                  <Input 
                    placeholder="e.g. 3.8/4.0"
                    className="h-9 text-xs focus-visible:ring-1" 
                    value={item.gpa} 
                    onChange={(e) => update(item.id, { gpa: e.target.value })} 
                  />
                </Field>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 ml-0.5">
              <input
                type="checkbox"
                id={`present-edu-${item.id}`}
                checked={item.present}
                onChange={(e) => update(item.id, { present: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
              <label htmlFor={`present-edu-${item.id}`} className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none">
                I currently study here
              </label>
            </div>
          </div>
        ))}
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full gap-2 text-xs h-10 border-dashed border-2 hover:border-foreground/20 hover:bg-muted/50 rounded-xl transition-all" 
        onClick={add}
      >
        <Plus size={14} className="text-muted-foreground" />
        <span className="font-bold uppercase tracking-wider text-muted-foreground/80">Add Education</span>
      </Button>
    </div>
  )
}
