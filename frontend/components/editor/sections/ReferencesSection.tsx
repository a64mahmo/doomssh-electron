'use client'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { ReferenceItem } from '@/lib/store/types'
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

export function ReferencesSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = (section?.items as ReferenceItem[]) || []

  function add() {
    updateItems([...items, { id: generateId(), name: '', company: '', position: '', email: '', phone: '' }])
  }

  function update(id: string, changes: Partial<ReferenceItem>) {
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
            <Field label="Name">
              <Input className="h-7 text-xs" value={item.name} onChange={(e) => update(item.id, { name: e.target.value })} />
            </Field>
            <Field label="Company">
              <Input className="h-7 text-xs" value={item.company} onChange={(e) => update(item.id, { company: e.target.value })} />
            </Field>
          </div>

          <Field label="Position">
            <Input className="h-7 text-xs" value={item.position} onChange={(e) => update(item.id, { position: e.target.value })} />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Email">
              <Input className="h-7 text-xs" type="email" value={item.email} onChange={(e) => update(item.id, { email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input className="h-7 text-xs" type="tel" value={item.phone} onChange={(e) => update(item.id, { phone: e.target.value })} />
            </Field>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8" onClick={add}>
        <Plus size={12} /> Add Reference
      </Button>
    </div>
  )
}
