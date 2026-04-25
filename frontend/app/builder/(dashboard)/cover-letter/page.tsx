'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, MoreHorizontal, Trash2, Pencil, FileText, Mail,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getAllCoverLetters, createNewCoverLetter, saveResume, deleteResume,
} from '@/lib/db/database'
import type { Resume } from '@/lib/store/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const TEMPLATE_GRADIENT: Record<string, string> = {
  modern:  'from-violet-500 to-indigo-600',
  classic: 'from-slate-500 to-slate-700',
  minimal: 'from-zinc-400 to-zinc-600',
  crisp:   'from-sky-500 to-blue-600',
  tokyo:   'from-rose-500 to-pink-600',
  elite:   'from-emerald-600 to-teal-800',
}

export default function CoverLetterDashboard() {
  const router = useRouter()
  const [letters, setLetters] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [isWin, setIsWin] = useState(false)

  async function load() {
    if (window.electron) {
      setIsWin(window.electron.platform === 'win32')
    }
    setLoading(true)
    setLetters(await getAllCoverLetters())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

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
      <header className={cn(
        "border-b border-border px-6 h-11 flex items-center justify-between shrink-0 bg-background drag",
        isWin && "win32-padding"
      )}>
        <div className="flex items-center gap-2.5 no-drag">
          <div className="w-5 h-5 rounded bg-foreground flex items-center justify-center shrink-0">
            <Mail size={10} className="text-background" />
          </div>
          <span className="font-bold text-sm tracking-tight">DoomSSH</span>
        </div>
        <div className="no-drag">
          <Button
            onClick={handleCreate}
            size="sm"
            className="h-7.5 bg-foreground text-background hover:bg-foreground/90 gap-1.5 font-semibold text-xs px-4 rounded-lg"
          >
            <Plus size={14} />
            New Cover Letter
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-2xl font-bold tracking-tight mb-1">My Cover Letters</h1>
            <p className="text-muted-foreground text-sm">
              {loading ? 'Loading…' : `${letters.length} cover letter${letters.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <motion.button
              onClick={handleCreate}
              whileHover={{ scale: 1.02 }}
              className="group aspect-[3/4] rounded-xl border border-dashed border-border hover:border-foreground/25 flex flex-col items-center justify-center gap-2.5 transition-colors"
            >
              <div className="w-9 h-9 rounded-full border border-border group-hover:border-foreground/25 flex items-center justify-center transition-colors">
                <Plus size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">New Cover Letter</span>
            </motion.button>

            <AnimatePresence>
              {letters.map((letter) => (
                <CoverLetterCard
                  key={letter.id}
                  letter={letter}
                  onEdit={() => router.push(`/builder/new?id=${letter.id}`)}
                  onDelete={() => handleDelete(letter.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </>
  )
}

function CoverLetterCard({ letter, onEdit, onDelete }: {
  letter: Resume
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
      onClick={onEdit}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${TEMPLATE_GRADIENT[letter.template] ?? 'from-slate-500 to-slate-700'} opacity-80`} />

      <div className="absolute inset-0 p-4 flex flex-col gap-2 pt-6">
        {/* Paper-like header skeleton */}
        <div className="w-2/3 mx-auto h-2 rounded-full bg-white/40" />
        <div className="w-1/2 mx-auto h-1.5 rounded-full bg-white/25 mb-1" />
        
        {/* Paragraph-like skeleton */}
        <div className="space-y-1.5 mt-2">
          {[...Array(6)].map((_, j) => (
            <div key={j} className="h-1 rounded-full bg-white/20" style={{ width: `${75 + (j * 13) % 25}%` }} />
          ))}
        </div>
        
        {/* Bottom sign-off skeleton */}
        <div className="mt-auto w-1/4 h-1.5 rounded-full bg-white/25" />
      </div>

      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold">Edit</span>
      </div>

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-end justify-between gap-1">
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate leading-tight">{letter.name}</p>
            <p className="text-white/45 text-[10px] mt-0.5 capitalize">{letter.template}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={13} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
                <Pencil size={13} className="mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete() }}
              >
                <Trash2 size={13} className="mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  )
}
