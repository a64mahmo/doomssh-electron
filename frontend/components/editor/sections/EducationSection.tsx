'use client'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { EducationItem } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'

interface Props { sectionId: string }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

export function EducationSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = (section?.items as EducationItem[]) || []

  function add() {
    updateItems([...items, {
      id: generateId(), institution: '', degree: '', field: '',
      location: '', startDate: '', endDate: '', present: false, gpa: '', description: '',
    }])
  }

  function update(id: string, changes: Partial<EducationItem>) {
    updateItems(items.map((it) => it.id === id ? { ...it, ...changes } : it))
  }

  function remove(id: string) {
    updateItems(items.filter((it) => it.id !== id))
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-md border border-border p-3 space-y-2.5 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => remove(item.id)}
          >
            <Trash2 size={12} />
          </Button>

          <div className="grid grid-cols-2 gap-2 pr-8">
            <Field label="Institution">
              <Input className="h-7 text-xs" value={item.institution} onChange={(e) => update(item.id, { institution: e.target.value })} />
            </Field>
            <Field label="Location">
              <Input className="h-7 text-xs" value={item.location} onChange={(e) => update(item.id, { location: e.target.value })} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Degree">
              <Input className="h-7 text-xs" value={item.degree} onChange={(e) => update(item.id, { degree: e.target.value })} />
            </Field>
            <Field label="Field of Study">
              <Input className="h-7 text-xs" value={item.field} onChange={(e) => update(item.id, { field: e.target.value })} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Field label="Start">
              <Input className="h-7 text-xs" type="month" value={item.startDate} onChange={(e) => update(item.id, { startDate: e.target.value })} />
            </Field>
            <Field label="End">
              <Input className="h-7 text-xs" type="month" value={item.endDate} disabled={item.present} onChange={(e) => update(item.id, { endDate: e.target.value })} />
            </Field>
            <Field label="GPA">
              <Input className="h-7 text-xs" value={item.gpa} onChange={(e) => update(item.id, { gpa: e.target.value })} />
            </Field>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={item.present}
              onChange={(e) => update(item.id, { present: e.target.checked })}
              className="rounded border-border"
            />
            <span className="text-xs text-muted-foreground">Currently studying here</span>
          </label>
        </div>
      ))}

      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8" onClick={add}>
        <Plus size={12} /> Add Education
      </Button>
    </div>
  )
}
