'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Mail, Briefcase, MessageSquare, Settings as SettingsIcon,
  Sun, Moon, LayoutGrid, Database, Key, Bug, RefreshCw, Download, 
  ArrowUpCircle, FileText, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/store/uiStore'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

function NavItem({
  icon, label, active, onClick, collapsed
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  collapsed?: boolean
}) {
  const content = (
    <div
      onClick={onClick}
      className={cn(
        'relative w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer group',
        active ? 'text-background' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        collapsed ? 'justify-center' : 'justify-between'
      )}
    >
      {active && (
        <motion.div
          layoutId="nav-active-pill"
          className="absolute inset-0 bg-foreground rounded-lg"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      <div className={cn('relative flex items-center gap-2.5 z-10', collapsed && 'gap-0')}>
        {icon}
        {!collapsed && <span>{label}</span>}
      </div>
    </div>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={content} />
        <TooltipContent side="right">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [appVersion, setAppVersion] = useState('')
  const [isMac, setIsMac] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const globalDebugMode = useUIStore(s => s.globalDebugMode)
  const setGlobalDebugMode = useUIStore(s => s.setGlobalDebugMode)
  const updateStatus = useUIStore(s => s.updateStatus)
  const updateProgress = useUIStore(s => s.updateProgress)
  const updateVersion = useUIStore(s => s.updateVersion)
  const updateError = useUIStore(s => s.updateError)

  useEffect(() => {
    if (window.electron) {
      window.electron.getApiKey().then(key => setApiKey(key || ''))
      if (typeof window.electron.getDebugMode === 'function') {
        window.electron.getDebugMode().then(enabled => setGlobalDebugMode(enabled))
      }
      if (typeof window.electron.getAppVersion === 'function') {
        window.electron.getAppVersion().then(v => setAppVersion(v))
      }
      setIsMac(window.electron.platform === 'darwin')
    }
  }, [setGlobalDebugMode])

  async function saveSettings() {
    if (window.electron) {
      await window.electron.setApiKey(apiKey)
      if (typeof window.electron.setDebugMode === 'function') {
        await window.electron.setDebugMode(globalDebugMode)
      }
    }
    setSettingsOpen(false)
  }

  async function handleCheckUpdates() {
    if (window.electron && typeof window.electron.checkForUpdates === 'function') {
      try { await window.electron.checkForUpdates() } catch { toast.error('Failed to check for updates') }
    }
  }

  async function handleRestartAndInstall() {
    if (window.electron && typeof window.electron.restartAndInstall === 'function') {
      await window.electron.restartAndInstall()
    }
  }

  const isResumes = pathname === '/builder'
  const isCover = pathname?.startsWith('/builder/cover-letter')
  const isJobs = pathname?.startsWith('/builder/jobs')
  const isInterview = pathname?.startsWith('/builder/interview-prep')

  return (
    <>
      <motion.aside 
        initial={false}
        animate={{ width: collapsed ? 64 : 256 }}
        data-testid="main-sidebar"
        className="border-r border-border flex flex-col shrink-0 bg-sidebar relative z-30"
      >
        <div className={cn(
          'border-b border-border drag flex flex-col transition-all duration-300',
          collapsed ? (isMac ? 'h-20' : 'h-11') : 'h-11'
        )}>
          {/* Top row: traffic lights on Mac, or just spacing */}
          <div className={cn('h-11 flex items-center justify-between px-3 shrink-0', isMac && 'pl-[72px]', (collapsed && !isMac) && 'justify-center px-0')}>
            {!collapsed && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 no-drag">Menu</span>
            )}
            
            {/* Toggle button - only show in top row if not collapsed OR not Mac */}
            {(!collapsed || !isMac) && (
              <Tooltip>
                <TooltipTrigger render={
                  <button 
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    className="no-drag p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>
                } />
                <TooltipContent side="right">
                  {collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Bottom row: only for collapsed Mac to prevent overlap with traffic lights */}
          {collapsed && isMac && (
            <div className="flex-1 flex items-center justify-center pb-2">
              <Tooltip>
                <TooltipTrigger render={
                  <button 
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label="Expand Sidebar"
                    className="no-drag p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                } />
                <TooltipContent side="right">
                  Expand Sidebar
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavItem
            icon={<LayoutGrid size={18} />}
            label="Resumes"
            active={isResumes}
            onClick={() => router.push('/builder')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Mail size={18} />}
            label="Cover Letter"
            active={isCover}
            onClick={() => router.push('/builder/cover-letter')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Briefcase size={18} />}
            label="Job Tracker"
            active={isJobs}
            onClick={() => router.push('/builder/jobs')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<MessageSquare size={18} />}
            label="Interview Prep"
            active={isInterview}
            onClick={() => router.push('/builder/interview-prep')}
            collapsed={collapsed}
          />
        </nav>

        <div className="p-3 border-t border-border space-y-4">
          <NavItem
            icon={<SettingsIcon size={18} />}
            label="Settings"
            onClick={() => setSettingsOpen(true)}
            collapsed={collapsed}
          />

          <div className={cn("flex bg-accent/50 rounded-lg p-1", collapsed && "flex-col")}>
            <button
              onClick={() => setTheme('light')}
              className={cn('flex-1 flex items-center justify-center py-1.5 rounded-md transition-all',
                theme === 'light' ? 'bg-background shadow-sm' : 'text-muted-foreground')}
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn('flex-1 flex items-center justify-center py-1.5 rounded-md transition-all',
                theme === 'dark' ? 'bg-background shadow-sm' : 'text-muted-foreground')}
            >
              <Moon size={14} />
            </button>
          </div>

          {!collapsed && (
            <div className="bg-accent/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Database size={12} className="text-muted-foreground" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Local Only</p>
              </div>
              <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                All data is stored locally on this device.
              </p>
            </div>
          )}
        </div>
      </motion.aside>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure your preferences and API keys. These are stored securely on your device.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-3 p-3 rounded-xl bg-accent/30 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ArrowUpCircle size={12} />
                    Software Update
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Current Version: v{appVersion || '0.0.0'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] font-bold uppercase tracking-widest gap-1.5"
                  onClick={handleCheckUpdates}
                  disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
                >
                  <RefreshCw size={12} className={cn(updateStatus === 'checking' && 'animate-spin')} />
                  {updateStatus === 'checking' ? 'Checking...' : 'Check for Updates'}
                </Button>
              </div>

              {updateStatus === 'available' && (
                <div className="flex items-center gap-2 text-[10px] text-primary font-bold animate-pulse">
                  <Download size={12} />
                  New update v{updateVersion} is available and downloading...
                </div>
              )}
              {updateStatus === 'downloading' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Download size={12} /> Downloading Update
                    </span>
                    <span>{Math.round(updateProgress)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${updateProgress}%` }} />
                  </div>
                </div>
              )}
              {updateStatus === 'downloaded' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-green-600 dark:text-green-400 font-bold">
                    <ArrowUpCircle size={12} />
                    Update v{updateVersion} is ready to install!
                  </div>
                  <Button
                    className="w-full h-8 text-[10px] font-bold uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white border-0"
                    onClick={handleRestartAndInstall}
                  >
                    Restart & Install Now
                  </Button>
                </div>
              )}
              {updateStatus === 'not-available' && (
                <p className="text-[10px] text-muted-foreground font-medium">Your software is up to date.</p>
              )}
              {updateStatus === 'error' && updateError && globalDebugMode && (
                <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/30">
                  <p className="text-[10px] font-bold text-destructive mb-1">Update Failed</p>
                  <pre className="text-[9px] text-destructive/80 whitespace-pre-wrap break-all max-h-24 overflow-y-auto">{updateError}</pre>
                </div>
              )}
            </div>

            <Separator className="my-1" />

            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key size={14} />
                Anthropic API Key
              </Label>
              <Input id="apiKey" type="password" placeholder="sk-ant-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              <p className="text-[10px] text-muted-foreground">
                Required for AI features like bullet improvement and summary generation.
              </p>
            </div>

            <Separator className="my-2" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="bug-mode" className="flex items-center gap-2">
                  <Bug size={14} />
                  Bug Mode
                </Label>
                <p className="text-[10px] text-muted-foreground">Enable persistent error notifications for debugging.</p>
              </div>
              <Switch id="bug-mode" checked={globalDebugMode} onCheckedChange={setGlobalDebugMode} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={saveSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
