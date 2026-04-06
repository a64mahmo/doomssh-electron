'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Copy, Trash2, Pencil, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { getAllResumes, deleteResume, duplicateResume, createNewResume, createSampleResumes, saveResume } from '@/lib/db/database'
import { generateId } from '@/lib/utils/ids'
import type { Resume } from '@/lib/store/types'

const TEMPLATE_GRADIENT: Record<string, string> = {
  modern:  'from-violet-500 to-indigo-600',
  classic: 'from-slate-500 to-slate-700',
  minimal: 'from-zinc-400 to-zinc-600',
  crisp:   'from-sky-500 to-blue-600',
  tokyo:   'from-rose-500 to-pink-600',
  elite:   'from-emerald-600 to-teal-800',
}

export default function BuilderDashboard() {
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllResumes().then(async (existing) => {
      if (existing.length === 0) {
        const samples = createSampleResumes()
        await Promise.all(samples.map(saveResume))
        setResumes(samples)
      } else {
        setResumes(existing)
      }
      setLoading(false)
    })
  }, [])

  async function handleCreate() {
    const id = generateId()
    const resume = createNewResume('Untitled Resume')
    resume.id = id
    await saveResume(resume)
    router.push(`/builder/${id}`)
  }

  async function handleDuplicate(id: string) {
    await duplicateResume(id)
    setResumes(await getAllResumes())
  }

  async function handleDelete(id: string) {
    await deleteResume(id)
    setResumes(await getAllResumes())
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
            <FileText size={14} className="text-background" />
          </div>
          <span className="font-semibold text-sm tracking-tight">DoomSSH</span>
        </div>
        <Button
          onClick={handleCreate}
          size="sm"
          className="bg-foreground text-background hover:bg-foreground/90 gap-1.5 font-medium"
        >
          <Plus size={14} />
          New Resume
        </Button>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight mb-1">My Resumes</h1>
          <p className="text-muted-foreground text-sm">{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Create card */}
          <motion.button
            onClick={handleCreate}
            whileHover={{ scale: 1.02 }}
            className="group aspect-[3/4] rounded-xl border border-dashed border-border hover:border-foreground/25 flex flex-col items-center justify-center gap-2.5 transition-colors"
          >
            <div className="w-9 h-9 rounded-full border border-border group-hover:border-foreground/25 flex items-center justify-center transition-colors">
              <Plus size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">New Resume</span>
          </motion.button>

          {resumes.map((resume, i) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.02 }}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
              onClick={() => router.push(`/builder/${resume.id}`)}
            >
              {/* Gradient bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${TEMPLATE_GRADIENT[resume.template] ?? 'from-slate-500 to-slate-700'} opacity-80`} />

              {/* Faux resume lines */}
              <div className="absolute inset-0 p-4 flex flex-col gap-2 pt-6">
                <div className="w-2/3 mx-auto h-2 rounded-full bg-white/40" />
                <div className="w-1/2 mx-auto h-1.5 rounded-full bg-white/25 mb-1" />
                {[...Array(8)].map((_, j) => (
                  <div key={j} className="flex flex-col gap-1">
                    <div className="h-1 rounded-full bg-white/20" style={{ width: `${50 + (j * 11) % 40}%` }} />
                  </div>
                ))}
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold">Edit</span>
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-end justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate leading-tight">{resume.name}</p>
                    <p className="text-white/45 text-[10px] mt-0.5 capitalize">{resume.template}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={13} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/builder/${resume.id}`) }}>
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
