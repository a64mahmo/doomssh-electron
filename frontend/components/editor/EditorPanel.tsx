'use client'
import { SectionList } from './SectionList'

// No ScrollArea wrapper — parent motion.div already handles overflow-auto
export function EditorPanel() {
  return (
    <div className="space-y-1.5 pb-10">
      <SectionList />
    </div>
  )
}
