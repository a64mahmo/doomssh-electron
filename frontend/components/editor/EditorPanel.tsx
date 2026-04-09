'use client'
import { SectionList } from './SectionList'

export function EditorPanel() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <header className="px-5 h-11 border-b border-border flex items-center justify-between shrink-0 bg-background/50 backdrop-blur-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/80">
          Content
        </h3>
      </header>

      <div
        className="flex-1 overflow-y-auto px-4 py-5 pb-24"
        style={{ overscrollBehavior: 'contain' }}
      >
        <SectionList />
      </div>
    </div>
  )
}
