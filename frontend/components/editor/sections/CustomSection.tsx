'use client'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { CustomItem } from '@/lib/store/types'
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

export function CustomSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = (section?.items as CustomItem[]) || []

  function add() {
    updateItems([...items, { id: generateId(), title: '', subtitle: '', date: '', description: '' }])
  }

  function update(id: string, changes: Partial<CustomItem>) {
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
            variant="ghost" size="icon"
            className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => remove(item.id)}
          >
            <Trash2 size={12} />
          </Button>

          <div className="grid grid-cols-2 gap-2 pr-8">
            <Field label="Title">
              <Input className="h-7 text-xs" value={item.title} onChange={(e) => update(item.id, { title: e.target.value })} />
            </Field>
            <Field label="Subtitle">
              <Input className="h-7 text-xs" value={item.subtitle} onChange={(e) => update(item.id, { subtitle: e.target.value })} />
            </Field>
          </div>

          <Field label="Date">
            <Input className="h-7 text-xs w-40" type="month" value={item.date} onChange={(e) => update(item.id, { date: e.target.value })} />
          </Field>

          <Field label="Description">
            <Textarea
              className="text-xs resize-none" rows={3}
              value={item.description}
              onChange={(e) => update(item.id, { description: e.target.value })}
            />
          </Field>
        </div>
      ))}

      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8" onClick={add}>
        <Plus size={12} /> Add Entry
      </Button>
    </div>
  )
}
