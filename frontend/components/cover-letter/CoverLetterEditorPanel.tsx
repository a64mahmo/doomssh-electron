'use client'
import { useState } from 'react'
import { useResumeStore } from '@/lib/store/resumeStore'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  User,
  Briefcase,
  Building,
  FileText,
  PenLine,
  type LucideIcon
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { TargetJobCard } from './sections/TargetJobCard'
import { LetterheadCard } from './sections/LetterheadCard'
import { RecipientCard } from './sections/RecipientCard'
import { EditorCard } from './sections/EditorCard'
import { SignatureCard } from './sections/SignatureCard'

type CLSection = 'target' | 'letterhead' | 'recipient' | 'body' | 'signature'

const SECTIONS: { id: CLSection; title: string; icon: LucideIcon }[] = [
  { id: 'target',     title: 'Target Job',   icon: Briefcase },
  { id: 'letterhead', title: 'Letterhead',    icon: User },
  { id: 'recipient',  title: 'Recipient',     icon: Building },
  { id: 'body',       title: 'Letter Body',   icon: FileText },
  { id: 'signature',  title: 'Signature',     icon: PenLine },
]

export function CoverLetterEditorPanel() {
  const resume = useResumeStore(s => s.resume)
  const [activeSectionId, setActiveSectionId] = useState<CLSection>('body')

  if (!resume || !resume.coverLetter) return null

  const activeSection = SECTIONS.find(s => s.id === activeSectionId)

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ── Icon Nav ──────────────────────────────────────────────── */}
      <nav className="w-12 border-r border-border flex flex-col items-center py-3 gap-1 shrink-0 bg-sidebar overflow-y-auto no-scrollbar">
        {SECTIONS.map((section) => {
          const Icon = section.icon
          const active = activeSectionId === section.id
          
          return (
            <Tooltip key={section.id}>
              <TooltipTrigger
                type="button"
                aria-label={section.title}
                onClick={() => setActiveSectionId(section.id)}
                className={cn(
                  'relative w-9 h-9 flex items-center justify-center rounded-xl transition-all shrink-0',
                  active
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
              </TooltipTrigger>
              <TooltipContent side="right">
                {section.title}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header bar */}
        <header className="px-4 h-10 border-b border-border flex items-center justify-between shrink-0 bg-background/60 backdrop-blur-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/70 truncate mr-2">
            {activeSection?.title}
          </h3>
          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest border border-border/50 px-1.5 py-0.5 rounded">
            Cover Letter
          </span>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSectionId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="px-4 py-5 space-y-6 pb-24"
            >
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeSectionId === 'target' && <TargetJobCard />}
                {activeSectionId === 'letterhead' && <LetterheadCard />}
                {activeSectionId === 'recipient' && <RecipientCard />}
                {activeSectionId === 'body' && <EditorCard />}
                {activeSectionId === 'signature' && <SignatureCard />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
