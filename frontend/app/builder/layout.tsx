'use client'

import { useEffect, useState } from 'react'
import { Database } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import { isElectron } from '@/lib/platform'

type VaultState = 'checking' | 'ready' | 'missing'

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  // The browser build has no vault, so it renders the app straight away (also in
  // the static HTML). Only the desktop app waits to learn whether a vault is set.
  const [vault, setVault] = useState<VaultState>(() => (isElectron() ? 'checking' : 'ready'))

  useEffect(() => {
    if (!window.electron) return
    window.electron.vault.getPath().then(p => setVault(p ? 'ready' : 'missing'))
  }, [])

  async function handlePickVault() {
    if (!window.electron) return
    const p = await window.electron.vault.setPath()
    if (p) setVault('ready')
  }

  if (vault === 'checking') {
    return <div className="h-screen bg-background" />
  }

  if (vault === 'missing') {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-background text-foreground">
        <Logo className="size-10" />
        <div className="text-center space-y-1">
          <h1 className="text-lg font-bold tracking-tight">Choose a Vault Folder</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your resumes will be saved as JSON files in a folder you choose — portable, private, and yours.
          </p>
        </div>
        <Button onClick={handlePickVault} className="gap-2">
          <Database size={14} />
          Choose Folder
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {children}
      </main>
    </div>
  )
}
