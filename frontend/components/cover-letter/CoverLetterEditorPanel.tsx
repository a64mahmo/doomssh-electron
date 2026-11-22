'use client'
import { useRef, useState } from 'react'
import { useResumeStore } from '@/lib/store/resumeStore'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { RailNav, RailItem } from '@/components/ui/rail-nav'
import { SearchButton } from '@/components/settings-search/SettingsPalette'
import { useRevealSetting } from '@/components/settings-search/useRevealSetting'
import {
  User,
  Briefcase,
  Building,
  FileText,
  PenLine,
  type LucideIcon
} from 'lucide-react'

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
  const scrollRef = useRef<HTMLDivElement>(null)

  // Builder search: open the card, then highlight and focus the field.
  useRevealSetting(
    scrollRef,
    (entry) => entry.tab === 'content' && SECTIONS.some((s) => s.id === entry.contentSection),
    (entry) => setActiveSectionId(entry.contentSection as CLSection),
  )

  if (!resume || !resume.coverLetter) return null

  const activeSection = SECTIONS.find(s => s.id === activeSectionId)

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ── Icon Nav ──────────────────────────────────────────────── */}
      <RailNav label="Cover letter sections">
        {SECTIONS.map((section) => (
          <RailItem
            key={section.id}
            icon={section.icon}
            label={section.title}
            active={activeSectionId === section.id}
            onClick={() => setActiveSectionId(section.id)}
          />
        ))}
      </RailNav>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header bar */}
        <header className="px-4 h-10 border-b border-border flex items-center justify-between shrink-0 bg-background/60 backdrop-blur-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/70 truncate mr-2">
            {activeSection?.title}
          </h3>
          <div className="flex items-center gap-2">
            <SearchButton />
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest border border-border/50 px-1.5 py-0.5 rounded">
              Cover Letter
            </span>
          </div>
        </header>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
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
