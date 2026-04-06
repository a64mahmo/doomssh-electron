'use client'
import { useSection } from '@/hooks/useResume'
import { Textarea } from '@/components/ui/textarea'
import type { SummaryItem } from '@/lib/store/types'

interface Props { sectionId: string }

export function SummarySection({ sectionId }: Props) {
  const { section, updateItems } = useSection(sectionId)
  const item = (section?.items as SummaryItem) || { text: '' }

  return (
    <Textarea
      rows={4}
      className="text-xs resize-none"
      placeholder="A results-driven engineer with 5+ years of experience…"
      value={item.text}
      onChange={(e) => updateItems({ text: e.target.value })}
    />
  )
}
