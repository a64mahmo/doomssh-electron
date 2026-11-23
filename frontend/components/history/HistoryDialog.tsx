'use client'
import { useCallback, useEffect, useState } from 'react'
import { History, RotateCcw, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DocumentThumbnail } from '@/components/DocumentThumbnail'
import { useResumeStore } from '@/lib/store/resumeStore'
import { getVersion, listVersions, VERSION_REASON_LABELS, type VersionMeta } from '@/lib/db/history'
import { onVersionsChanged, prepareRestore, saveVersionNow } from '@/lib/store/historyTracker'
import type { Resume } from '@/lib/store/types'
import { cn } from '@/lib/utils'

const CURRENT = 'current'

function dayLabel(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date(today.getTime() - 86_400_000)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function timeLabel(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

/**
 * "History" in the builder header: every kept version of this document, a
 * preview of the one selected (pages turn like the dashboard cards), and
 * Restore. Restoring keeps the current document as a version first, so it can
 * always be undone.
 */
export function HistoryDialog({ resume }: { resume: Resume }) {
  const setResume = useResumeStore((st) => st.setResume)
  const [open, setOpen] = useState(false)
  const [versions, setVersions] = useState<VersionMeta[] | null>(null)
  const [selected, setSelected] = useState<string>(CURRENT)
  const [preview, setPreview] = useState<Resume | null>(null)
  const [page, setPage] = useState(0)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setVersions(await listVersions(resume.id))
    } catch (err) {
      console.error('[history] could not list versions:', err)
      setVersions([])
    }
  }, [resume.id])

  useEffect(() => {
    if (!open) return
    void refresh()
    return onVersionsChanged(() => void refresh())
  }, [open, refresh])

  // Load the selected version for the preview.
  useEffect(() => {
    if (!open || selected === CURRENT) return
    let cancelled = false
    getVersion(resume.id, selected).then((v) => {
      if (!cancelled) setPreview(v)
    })
    return () => { cancelled = true }
  }, [open, selected, resume.id])

  function select(id: string) {
    setSelected(id)
    setPreview(null)
    setPage(0)
  }

  async function handleSaveNow() {
    setBusy(true)
    try {
      const meta = await saveVersionNow(resume)
      toast.success(meta ? 'Version saved' : 'No changes since the last version')
    } catch {
      toast.error("Couldn't save a version")
    } finally {
      setBusy(false)
    }
  }

  async function restore(version: Resume, versionId: string, savedAt: number) {
    setBusy(true)
    try {
      const { restored, backup } = await prepareRestore(resume, version, versionId)
      setResume(restored)
      setOpen(false)
      toast.success(`Restored the version from ${dayLabel(savedAt).toLowerCase()} at ${timeLabel(savedAt)}`, {
        description: 'The version you replaced is kept in History.',
        action: backup
          ? {
              label: 'Undo',
              onClick: async () => {
                const previous = await getVersion(resume.id, backup.id)
                if (previous) setResume({ ...previous, updatedAt: Date.now() })
              },
            }
          : undefined,
      })
    } catch (err) {
      console.error('[history] restore failed:', err)
      toast.error("Couldn't restore that version")
    } finally {
      setBusy(false)
    }
  }

  const shown = selected === CURRENT ? resume : preview
  const selectedMeta = versions?.find((v) => v.id === selected)

  // Group the list by day, newest first.
  const groups: { day: string; items: VersionMeta[] }[] = []
  for (const v of versions ?? []) {
    const day = dayLabel(v.savedAt)
    const last = groups[groups.length - 1]
    if (last?.day === day) last.items.push(v)
    else groups.push({ day, items: [v] })
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => { select(CURRENT); setOpen(true) }}
        className="h-7.5 gap-1.5 text-xs font-semibold px-3 rounded-lg"
      >
        <History size={13} />
        History
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
            <DialogTitle>Version history</DialogTitle>
            <DialogDescription className="text-xs">
              Versions are kept when you start editing, every 10 minutes while you edit, before a restore, and each time you download a PDF.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-[minmax(0,15rem)_1fr] h-[min(70vh,560px)]">
            {/* Version list */}
            <div className="border-r border-border overflow-y-auto p-2 space-y-3">
              <button
                type="button"
                onClick={() => select(CURRENT)}
                className={cn(
                  'w-full text-left rounded-lg px-3 py-2 transition-colors',
                  selected === CURRENT ? 'bg-accent' : 'hover:bg-accent/60',
                )}
              >
                <p className="text-xs font-semibold">Current version</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">What you&apos;re editing now</p>
              </button>

              {versions === null ? (
                <div className="flex justify-center py-6"><Loader2 size={14} className="animate-spin text-muted-foreground" /></div>
              ) : versions.length === 0 ? (
                <p className="px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
                  No earlier versions yet. One is kept as soon as you edit, or press Save version.
                </p>
              ) : (
                groups.map((g) => (
                  <div key={g.day}>
                    <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70">{g.day}</p>
                    {g.items.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => select(v.id)}
                        className={cn(
                          'w-full text-left rounded-lg px-3 py-1.5 transition-colors',
                          selected === v.id ? 'bg-accent' : 'hover:bg-accent/60',
                        )}
                      >
                        <p className="text-xs font-medium tabular-nums">{timeLabel(v.savedAt)}</p>
                        <p className="text-[10px] text-muted-foreground">{VERSION_REASON_LABELS[v.reason]}</p>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Preview */}
            <div className="flex flex-col min-h-0 bg-muted/30">
              <div className="flex-1 min-h-0 flex items-center justify-center p-5">
                <div className="h-full aspect-[8.5/11] max-w-full">
                  {shown ? (
                    <div className="rounded-md overflow-hidden border border-border shadow-sm">
                      <DocumentThumbnail key={selected} eager resume={shown} page={page} onPageChange={setPage} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border bg-background px-4 py-3">
                <p className="text-[11px] text-muted-foreground truncate">
                  {selected === CURRENT
                    ? 'Keep a copy of the resume as it is now.'
                    : selectedMeta
                      ? `${dayLabel(selectedMeta.savedAt)}, ${timeLabel(selectedMeta.savedAt)} · ${shown?.name ?? ''}`
                      : ''}
                </p>
                {selected === CURRENT ? (
                  <Button size="sm" variant="outline" disabled={busy} onClick={handleSaveNow} className="h-7.5 gap-1.5 text-xs">
                    <Save size={13} /> Save version
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={busy || !preview || !selectedMeta}
                    onClick={() => preview && selectedMeta && restore(preview, selectedMeta.id, selectedMeta.savedAt)}
                    className="h-7.5 gap-1.5 text-xs"
                  >
                    <RotateCcw size={13} /> Restore this version
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
