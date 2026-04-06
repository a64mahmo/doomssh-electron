'use client'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import type { LanguageItem, ProficiencyLevel } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'

interface Props { sectionId: string }

const LEVELS = [
  { value: 'none', label: 'No level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert / Native' },
]

export function LanguagesSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = (section?.items as LanguageItem[]) || []

  function add() {
    updateItems([...items, { id: generateId(), language: '', level: '' }])
  }

  function update(id: string, changes: Partial<LanguageItem>) {
    updateItems(items.map((it) => it.id === id ? { ...it, ...changes } : it))
  }

  function remove(id: string) {
    updateItems(items.filter((it) => it.id !== id))
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-1.5">
          <Input
            className="h-7 text-xs flex-1"
            placeholder="Language"
            value={item.language}
            onChange={(e) => update(item.id, { language: e.target.value })}
          />
          <Select
            value={item.level || 'none'}
            onValueChange={(v) => update(item.id, { level: v === 'none' ? '' : v as ProficiencyLevel })}
          >
            <SelectTrigger className="h-7 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => remove(item.id)}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      ))}

      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8" onClick={add}>
        <Plus size={12} /> Add Language
      </Button>
    </div>
  )
}
