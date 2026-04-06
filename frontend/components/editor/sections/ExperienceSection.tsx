'use client'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { ExperienceItem } from '@/lib/store/types'
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

export function ExperienceSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = (section?.items as ExperienceItem[]) || []

  function add() {
    updateItems([...items, {
      id: generateId(), company: '', position: '', location: '',
      startDate: '', endDate: '', present: false, description: '',
    }])
  }

  function update(id: string, changes: Partial<ExperienceItem>) {
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
            <Field label="Position">
              <Input className="h-7 text-xs" value={item.position} onChange={(e) => update(item.id, { position: e.target.value })} />
            </Field>
            <Field label="Company">
              <Input className="h-7 text-xs" value={item.company} onChange={(e) => update(item.id, { company: e.target.value })} />
            </Field>
          </div>

          <Field label="Location">
            <Input className="h-7 text-xs" value={item.location} onChange={(e) => update(item.id, { location: e.target.value })} />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Start">
              <Input className="h-7 text-xs" type="month" value={item.startDate} onChange={(e) => update(item.id, { startDate: e.target.value })} />
            </Field>
            <Field label="End">
              <Input className="h-7 text-xs" type="month" value={item.endDate} disabled={item.present} onChange={(e) => update(item.id, { endDate: e.target.value })} />
            </Field>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={item.present}
              onChange={(e) => update(item.id, { present: e.target.checked })}
              className="rounded border-border"
            />
            <span className="text-xs text-muted-foreground">Currently working here</span>
          </label>

          <Field label="Description">
            <Textarea
              className="text-xs resize-none"
              rows={4}
              placeholder="• Led a team of 5 engineers…"
              value={item.description}
              onChange={(e) => update(item.id, { description: e.target.value })}
            />
          </Field>
        </div>
      ))}

      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8" onClick={add}>
        <Plus size={12} /> Add Experience
      </Button>
    </div>
  )
}
