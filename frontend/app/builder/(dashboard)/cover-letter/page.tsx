'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { DocumentCard, CARD_PAGE_ASPECT } from '@/components/DocumentCard'
import { PageHeader } from '@/components/PageHeader'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getAllCoverLetters, createNewCoverLetter, saveResume, deleteResume,
} from '@/lib/db/database'
import type { Resume } from '@/lib/store/types'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export default function CoverLetterDashboard() {
  const router = useRouter()
  const [letters, setLetters] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLetters(await getAllCoverLetters())
  }

  // Starts in the loading state; the first read ends it.
  useEffect(() => {
    let cancelled = false
    getAllCoverLetters()
      .then((all) => { if (!cancelled) setLetters(all) })
      .catch((err) => {
        console.error('Failed to load cover letters:', err)
        toast.error("Couldn't load your cover letters")
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function handleCreate() {
    const letter = createNewCoverLetter()
    await saveResume(letter)
    router.push(`/builder/new?id=${letter.id}`)
  }

  async function handleDelete(id: string) {
    try {
      await deleteResume(id)
      await load()
      toast.success('Cover letter deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <>
      <PageHeader title="Cover Letters">
        <Button
          onClick={handleCreate}
          size="sm"
          aria-label="New Cover Letter"
          className="h-7.5 bg-foreground text-background hover:bg-foreground/90 gap-1.5 font-semibold text-xs px-3 sm:px-4 rounded-lg"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Cover Letter</span>
        </Button>
      </PageHeader>

      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-1">My Cover Letters</h2>
            <p className="text-muted-foreground text-sm">
              {/* Blank while loading, so the count doesn't flash "Loading…". */}
              {loading ? '\u00a0' : `${letters.length} cover letter${letters.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <motion.button
              onClick={handleCreate}
              whileHover={{ scale: 1.02 }}
              className={`group ${CARD_PAGE_ASPECT} self-start rounded-lg border border-dashed border-border hover:border-foreground/25 flex flex-col items-center justify-center gap-2.5 transition-colors`}
            >
              <div className="w-9 h-9 rounded-full border border-border group-hover:border-foreground/25 flex items-center justify-center transition-colors">
                <Plus size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">New Cover Letter</span>
            </motion.button>

            <AnimatePresence>
              {letters.map((letter) => (
                <DocumentCard
                  key={letter.id}
                  doc={letter}
                  onOpen={() => router.push(`/builder/new?id=${letter.id}`)}
                  menu={
                    <>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/builder/new?id=${letter.id}`) }}>
                        <Pencil size={13} className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(letter.id) }}
                      >
                        <Trash2 size={13} className="mr-2" /> Delete
                      </DropdownMenuItem>
                    </>
                  }
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </>
  )
}
