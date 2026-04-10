'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { 
  Plus, MoreHorizontal, Copy, Trash2, Pencil, FileText, 
  Mail, Briefcase, MessageSquare, Settings as SettingsIcon,
  Sun, Moon, LayoutGrid, Database, Key
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllResumes, deleteResume, duplicateResume, createNewResume, createSampleResumes, saveResume } from '@/lib/db/database'
import { generateId } from '@/lib/utils/ids'
import type { Resume } from '@/lib/store/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const TEMPLATE_GRADIENT: Record<string, string> = {
  modern:  'from-violet-500 to-indigo-600',
  classic: 'from-slate-500 to-slate-700',
  minimal: 'from-zinc-400 to-zinc-600',
  crisp:   'from-sky-500 to-blue-600',
  tokyo:   'from-rose-500 to-pink-600',
  elite:   'from-emerald-600 to-teal-800',
}

function NavItem({ 
  icon, 
  label, 
  active, 
  comingSoon,
  onClick
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  comingSoon?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={comingSoon ? undefined : onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active 
          ? "bg-foreground text-background" 
          : "text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer",
        comingSoon && "opacity-60 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
      )}
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span>{label}</span>
      </div>
      {comingSoon && (
        <span className="text-[10px] bg-accent text-muted-foreground px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Soon</span>
      )}
    </div>
  )
}

export default function BuilderDashboard() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    let unsubAvailable: (() => void) | undefined
    let unsubDownloaded: (() => void) | undefined

    if (window.electron) {
      window.electron.getApiKey().then(key => setApiKey(key || ''))
      setIsMac(window.electron.platform === 'darwin')

      unsubAvailable = window.electron.onUpdateAvailable((info) => {
        toast.info(`Update Available: Version ${info.version} is being downloaded.`, {
          duration: 10000,
        })
      })

      unsubDownloaded = window.electron.onUpdateDownloaded((info) => {
        toast.success(`Update Ready: Version ${info.version} has been downloaded.`, {
          action: {
            label: 'Restart & Install',
            onClick: () => window.electron?.restartAndInstall()
          },
          duration: Infinity,
        })
      })
    }

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

    return () => {
      unsubAvailable?.()
      unsubDownloaded?.()
    }
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

  async function saveSettings() {
    if (window.electron) {
      await window.electron.setApiKey(apiKey)
    }
    setSettingsOpen(false)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col shrink-0 bg-sidebar">
        {/* Sidebar Header - Dedicated to macOS spacing */}
        <div 
          className={cn(
            "h-11 border-b border-border drag",
            isMac && "pl-[72px]"
          )}
        />

        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            icon={<LayoutGrid size={18} />} 
            label="Resumes" 
            active 
          />
          <NavItem 
            icon={<Mail size={18} />} 
            label="Cover Letter" 
            comingSoon 
          />
          <NavItem 
            icon={<Briefcase size={18} />} 
            label="Job Tracker" 
            comingSoon 
          />
          <NavItem 
            icon={<MessageSquare size={18} />} 
            label="Interview Prep" 
            comingSoon 
          />
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <NavItem 
            icon={<SettingsIcon size={18} />} 
            label="Settings" 
            onClick={() => setSettingsOpen(true)}
          />

          {/* Theme Toggle */}
          <div className="flex bg-accent/50 rounded-lg p-1">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                "flex-1 flex items-center justify-center py-1.5 rounded-md transition-all",
                theme === 'light' ? "bg-background shadow-sm" : "text-muted-foreground"
              )}
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                "flex-1 flex items-center justify-center py-1.5 rounded-md transition-all",
                theme === 'dark' ? "bg-background shadow-sm" : "text-muted-foreground"
              )}
            >
              <Moon size={14} />
            </button>
          </div>

          <div className="bg-accent/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Database size={12} className="text-muted-foreground" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Local Only</p>
            </div>
            <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
              All data is stored in IndexedDB on this device.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border px-6 h-11 flex items-center justify-between shrink-0 bg-background drag">
          {/* Logo + Brand */}
          <div className="flex items-center gap-2.5 no-drag">
            <div className="w-5 h-5 rounded bg-foreground flex items-center justify-center shrink-0">
              <FileText size={10} className="text-background" />
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
              New Resume
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-12">
          <div className="max-w-6xl mx-auto">
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

              <AnimatePresence>
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
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure your preferences and API keys. These are stored securely on your device.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key size={14} />
                Anthropic API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Required for AI features like bullet improvement and summary generation.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={saveSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
