'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, ArrowLeft, Pencil, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { EditorPanel } from '@/components/editor/EditorPanel'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { CustomizePanel } from '@/components/customize/CustomizePanel'
import { useResumeStore } from '@/lib/store/resumeStore'
import { getResume, createNewResume, saveResume } from '@/lib/db/database'
import { downloadResumePDF } from '@/lib/utils/export'
import { cn } from '@/lib/utils'

type Panel = 'content' | 'style'

const MIN_W = 260
const MAX_W = 560
const DEFAULT_W = 360

export default function BuilderPage() {
  const params = useParams()
  const router = useRouter()
  const resumeId = params.resumeId as string
  const { resume, setResume, isDirty } = useResumeStore()
  const [editingName, setEditingName] = useState(false)
  const [panel, setPanel] = useState<Panel>('content')
  const [sideW, setSideW] = useState(DEFAULT_W)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(DEFAULT_W)

  useEffect(() => {
    async function load() {
      let r = await getResume(resumeId)
      if (!r) {
        r = createNewResume('My Resume')
        r.id = resumeId
        await saveResume(r)
      }
      setResume(r)
    }
    load()
  }, [resumeId, setResume])

  // ── Resize drag ──────────────────────────────────────────────────
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return
    const delta = e.clientX - startX.current
    setSideW(Math.min(MAX_W, Math.max(MIN_W, startW.current + delta)))
  }, [])

  const onMouseUp = useCallback(() => {
    dragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  function startResize(e: React.MouseEvent) {
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startW.current = sideW
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  if (!resume) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background overscroll-none" style={{ overscrollBehavior: 'none' }}>

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="h-11 flex items-center gap-3 px-3 border-b border-border shrink-0 bg-background">

        <button
          onClick={() => router.push('/builder')}
          className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft size={14} />
        </button>

        <div className="w-px h-4 bg-border" />

        {/* Logo + name */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-foreground flex items-center justify-center shrink-0">
            <FileText size={10} className="text-background" />
          </div>
          {editingName ? (
            <Input
              value={resume.name}
              onChange={(e) => setResume({ ...resume, name: e.target.value })}
              onBlur={() => { setEditingName(false); saveResume(resume) }}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              autoFocus
              className="h-6 w-40 text-xs px-1.5 border-0 border-b border-border rounded-none focus-visible:ring-0 bg-transparent"
            />
          ) : (
            <button onClick={() => setEditingName(true)} className="flex items-center gap-1 group">
              <span className="text-sm font-medium leading-none">{resume.name}</span>
              <Pencil size={10} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
            </button>
          )}
          {isDirty && <span className="text-[10px] text-muted-foreground/50 ml-1">Saving…</span>}
        </div>

        <div className="ml-auto">
          <Button
            size="sm"
            onClick={() => downloadResumePDF(resume)}
            className="h-7 gap-1.5 text-xs font-medium"
          >
            <Download size={12} />
            Download
          </Button>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Left panel */}
        <div
          className="shrink-0 flex flex-col bg-background overflow-hidden relative"
          style={{ width: sideW }}
        >
          {/* Panel nav */}
          <nav className="flex items-center gap-0 px-4 border-b border-border shrink-0 h-10">
            {(['content', 'style'] as Panel[]).map((p) => (
              <button
                key={p}
                onClick={() => setPanel(p)}
                className={cn(
                  'relative h-full px-3 text-xs font-medium capitalize transition-colors',
                  panel === p ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {p}
                {panel === p && (
                  <motion.span
                    layoutId="panel-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-t"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {panel === 'content' ? (
                <motion.div
                  key="content"
                  className="h-full overflow-hidden flex flex-col"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.12 }}
                >
                  <EditorPanel />
                </motion.div>
              ) : (
                <motion.div
                  key="style"
                  className="h-full overflow-hidden"
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.12 }}
                >
                  <CustomizePanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Resize handle */}
          <div
            onMouseDown={startResize}
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group z-20"
          >
            {/* Visible line — thickens on hover/drag */}
            <div className="absolute inset-y-0 right-0 w-px bg-border group-hover:w-[3px] group-hover:bg-foreground/20 transition-all" />
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <PreviewPanel resume={resume} />
        </div>
      </div>
    </div>
  )
}
