'use client'
import { useSection } from '@/hooks/useResume'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, X, Tag } from 'lucide-react'
import type { SkillItem, ProficiencyLevel } from '@/lib/store/types'
import { generateId } from '@/lib/utils/ids'
import { useMemo, useState } from 'react'

interface Props { sectionId: string }

export function SkillsSection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const items = (section?.items as SkillItem[]) || []
  const [newSkillText, setNewSkillText] = useState<Record<string, string>>({})

  // Group items by category for UI
  const categories = useMemo(() => {
    const groups: Record<string, SkillItem[]> = {}
    items.forEach(item => {
      const cat = item.category || 'Other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    })
    return groups
  }, [items])

  function addSkill(category: string, name: string) {
    if (!name.trim()) return
    const names = name.split(',').map(n => n.trim()).filter(Boolean)
    const newItems = names.map(n => ({
      id: generateId(),
      name: n,
      level: '' as ProficiencyLevel,
      category: category === 'Other' ? '' : category
    }))
    updateItems([...items, ...newItems])
    setNewSkillText(prev => ({ ...prev, [category]: '' }))
  }

  function removeSkill(id: string) {
    updateItems(items.filter(it => it.id !== id))
  }

  function updateCategory(oldCat: string, newCat: string) {
    if (!newCat.trim() || oldCat === newCat) return
    updateItems(items.map(it => (it.category || 'Other') === oldCat ? { ...it, category: newCat } : it))
  }

  function addCategory() {
    const newCat = 'New Category'
    addSkill(newCat, '')
  }

  function removeCategory(category: string) {
    updateItems(items.filter(it => (it.category || 'Other') !== category))
  }

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([cat, skills]) => (
        <div key={cat} className="space-y-3 p-4 bg-background rounded-xl border border-border/60 shadow-sm group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Tag size={14} className="text-muted-foreground/60" />
              <input
                className="text-xs font-bold uppercase tracking-wider bg-transparent border-none focus:ring-0 p-0 w-full"
                value={cat}
                onChange={(e) => updateCategory(cat, e.target.value)}
                placeholder="Category Name"
              />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeCategory(cat)}
            >
              <Trash2 size={12} />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {skills.map(skill => (
              <Badge 
                key={skill.id} 
                variant="secondary" 
                className="pl-2 pr-1 py-0.5 gap-1 text-[11px] font-medium bg-muted/50 hover:bg-muted transition-colors border-none"
              >
                {skill.name}
                <button 
                  onClick={() => removeSkill(skill.id)}
                  className="hover:text-destructive transition-colors p-0.5"
                >
                  <X size={10} />
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <Input
              className="h-8 text-xs bg-muted/20 border-none focus-visible:ring-1"
              placeholder="Add skills (comma separated)..."
              value={newSkillText[cat] || ''}
              onChange={(e) => setNewSkillText(prev => ({ ...prev, [cat]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && addSkill(cat, newSkillText[cat])}
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => addSkill(cat, newSkillText[cat])}>
              <Plus size={14} />
            </Button>
          </div>
        </div>
      ))}

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full gap-2 text-xs h-10 border-dashed border-2 hover:border-foreground/20 hover:bg-muted/50 rounded-xl transition-all" 
        onClick={addCategory}
      >
        <Plus size={14} className="text-muted-foreground" />
        <span className="font-bold uppercase tracking-wider text-muted-foreground/80">Add Skill Group</span>
      </Button>
    </div>
  )
}
