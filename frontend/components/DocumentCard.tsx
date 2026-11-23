'use client'
import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { MoreHorizontal } from 'lucide-react'
import { DocumentThumbnail, CARD_FRAME_ASPECT } from '@/components/DocumentThumbnail'
import { TEMPLATE_META } from '@/components/web'
import type { Resume } from '@/lib/store/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function updatedLabel(ts: number): string {
  if (!ts) return ''
  const diff = Date.now() - ts
  const day = 86_400_000
  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < day) return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Dashboard card for a resume or cover letter: a live thumbnail you can page
 * through (arrows, swipe, or ← → with the card focused), then name and details.
 * Click or Enter opens it.
 */
export function DocumentCard({ doc, onOpen, menu }: {
  doc: Resume
  onOpen: () => void
  /** DropdownMenuItems for the "…" menu. */
  menu: ReactNode
}) {
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const template = TEMPLATE_META[doc.template]?.label ?? doc.template

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen()
    } else if (e.key === 'ArrowRight' && page < pageCount - 1) {
      e.preventDefault()
      setPage(page + 1)
    } else if (e.key === 'ArrowLeft' && page > 0) {
      e.preventDefault()
      setPage(page - 1)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${doc.name}${pageCount > 1 ? `, ${pageCount} pages` : ''}`}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      className="group/card flex flex-col gap-2 cursor-pointer rounded-xl outline-none"
    >
      <div className="relative rounded-lg overflow-hidden border border-border/70 shadow-sm transition-all duration-200 group-hover/card:shadow-lg group-hover/card:-translate-y-0.5 group-focus-visible/card:ring-2 group-focus-visible/card:ring-ring/60">
        <DocumentThumbnail
          resume={doc}
          page={page}
          onPageChange={setPage}
          onPageCount={setPageCount}
        />
      </div>

      <div className="flex items-start justify-between gap-1 px-0.5">
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate leading-tight">{doc.name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {template}
            {pageCount > 1 && ` · ${pageCount} pages`}
            {doc.updatedAt ? ` · ${updatedLabel(doc.updatedAt)}` : ''}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`More actions for ${doc.name}`}
            className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={13} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {menu}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}

/** Matches a DocumentCard's frame so "New" tiles line up with the grid. */
export const CARD_PAGE_ASPECT = CARD_FRAME_ASPECT
