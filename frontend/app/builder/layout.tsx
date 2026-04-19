'use client'

import { useEffect, useState } from 'react'
import { FileText, Database } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { Button } from '@/components/ui/button'

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  const [vaultReady, setVaultReady] = useState(false)

  useEffect(() => {
    if (window.electron) {
      window.electron.vault.getPath().then(p => { if (p) setVaultReady(true) })
    } else {
      setVaultReady(true)
    }
  }, [])

  async function handlePickVault() {
    if (!window.electron) return
    const p = await window.electron.vault.setPath()
    if (p) setVaultReady(true)
  }

  if (!vaultReady) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-background text-foreground">
        <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
          <FileText size={20} className="text-background" />
        </div>
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
