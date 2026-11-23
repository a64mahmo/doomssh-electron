'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Copy, Trash2, Pencil } from 'lucide-react'
import { DocumentCard, CARD_PAGE_ASPECT } from '@/components/DocumentCard'
import { PageHeader } from '@/components/PageHeader'
import { ExampleResumes, readExamplesHidden, writeExamplesHidden } from '@/components/ExampleResumes'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { getAllResumes, deleteResume, duplicateResume, createNewResume, saveResume } from '@/lib/db/database'
import { generateId } from '@/lib/utils/ids'
import type { Resume } from '@/lib/store/types'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export default function ResumesDashboard() {
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [examplesHidden, setExamplesHidden] = useState(false)
  const reduceMotion = useReducedMotion()
  // Where focus should land once the examples finish hiding or showing, so the
  // click has a visible result and keyboard users aren't dropped on <body>.
  const pendingFocus = useRef<'browse' | 'examples' | null>(null)
  const browseRef = useRef<HTMLButtonElement>(null)
  const examplesHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // The dashboard renders nothing until this settles, so a failed read must
    // still end loading rather than leave a blank page.
    getAllResumes()
      .then(setResumes)
      .catch((err) => {
        console.error('Failed to load resumes:', err)
        toast.error("Couldn't load your resumes")
      })
      .finally(() => {
        setExamplesHidden(readExamplesHidden())
        setLoading(false)
      })
  }, [])

  async function handleCreate() {
    const id = generateId()
    const resume = createNewResume('Untitled Resume')
    resume.id = id
    await saveResume(resume)
    router.push(`/builder/new?id=${id}`)
  }

  function setExamplesVisible(visible: boolean) {
    setExamplesHidden(!visible)
    writeExamplesHidden(!visible)
  }

  function hideExamples() {
    pendingFocus.current = 'browse'
    setExamplesVisible(false)
    toast('Examples hidden', {
      id: 'examples-visibility',
      description: 'Bring them back any time with “Browse examples”.',
      action: { label: 'Undo', onClick: showExamples },
    })
  }

  function showExamples() {
    pendingFocus.current = 'examples'
    setExamplesVisible(true)
    toast.dismiss('examples-visibility')
  }

  // Hiding: the Browse link mounts with the state change, so focus it right away.
  useEffect(() => {
    if (examplesHidden && pendingFocus.current === 'browse') {
      pendingFocus.current = null
      browseRef.current?.focus()
    }
  }, [examplesHidden])

  // Showing: wait for the expand animation, then bring the section into view.
  function onExamplesShown() {
    if (pendingFocus.current !== 'examples') return
    pendingFocus.current = null
    examplesHeadingRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    examplesHeadingRef.current?.focus({ preventScroll: true })
  }

  async function handleStartFromExample(resume: Resume) {
    await saveResume(resume)
    router.push(`/builder/new?id=${resume.id}`)
  }

  async function handleDuplicate(id: string) {
    const copy = await duplicateResume(id)
    setResumes(await getAllResumes())
    router.push(`/builder/new?id=${copy.id}`)
  }

  async function handleDelete(id: string) {
    try {
      await deleteResume(id)
      setResumes(await getAllResumes())
      toast.success('Resume deleted')
    } catch {
      toast.error('Failed to delete resume')
    }
  }

  return (
    <>
      <PageHeader title="Resumes">
        <Button
          onClick={handleCreate}
          size="sm"
          aria-label="New Resume"
          className="h-7.5 bg-foreground text-background hover:bg-foreground/90 gap-1.5 font-semibold text-xs px-3 sm:px-4 rounded-lg"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Resume</span>
        </Button>
      </PageHeader>

      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Render nothing until the (fast, local) read finishes, so the empty-state
              copy and the examples don't flash in and out for returning users. */}
          {loading ? null : (
          <>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">My Resumes</h2>
              <p className="text-muted-foreground text-sm">
                {resumes.length === 0
                  ? 'Start from a blank page or an example below. Edits save automatically, and you can download a PDF any time.'
                  : `${resumes.length} resume${resumes.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <AnimatePresence initial={false}>
              {examplesHidden && (
                <motion.button
                  key="browse-examples"
                  ref={browseRef}
                  type="button"
                  onClick={showExamples}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : 0.15 }}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors rounded outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  Browse examples
                </motion.button>
              )}
            </AnimatePresence>
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
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">New Resume</span>
            </motion.button>

            <AnimatePresence>
              {resumes.map((resume) => (
                <DocumentCard
                  key={resume.id}
                  doc={resume}
                  onOpen={() => router.push(`/builder/new?id=${resume.id}`)}
                  menu={
                    <>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/builder/new?id=${resume.id}`) }}>
                        <Pencil size={13} className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(resume.id) }}>
                        <Copy size={13} className="mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(resume.id) }}
                      >
                        <Trash2 size={13} className="mr-2" /> Delete
                      </DropdownMenuItem>
                    </>
                  }
                />
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence initial={false}>
            {!examplesHidden && (
              <motion.div
                key="examples"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.4, 0, 0.2, 1] }}
                onAnimationComplete={onExamplesShown}
                style={{ overflow: 'hidden' }}
              >
                <ExampleResumes
                  onPick={handleStartFromExample}
                  onHide={hideExamples}
                  headingRef={examplesHeadingRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
          </>
          )}
        </div>
      </main>
    </>
  )
}
