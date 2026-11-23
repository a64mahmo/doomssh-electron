'use client'
import { useRef, useState } from 'react'
import { Download, Upload, ShieldCheck, Loader2, FileJson, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MAX_FILE_BYTES, VaultImportError, sanitizeVault, type SanitizedVault } from '@/lib/vault/sanitize'
import { exportVault, importVault } from '@/lib/vault/vaultTransfer'

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

/**
 * Settings → Vault: download everything as one JSON file, or add one back.
 * An import is read, checked and cleaned first; nothing is stored until the
 * summary is confirmed, and it only ever adds.
 */
export function VaultTransfer() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<'export' | 'read' | 'import' | null>(null)
  const [pending, setPending] = useState<{ name: string; vault: SanitizedVault } | null>(null)

  async function handleExport() {
    setBusy('export')
    try {
      const file = await exportVault()
      toast.success('Vault exported', {
        description: `${plural(file.resumes.length, 'resume')}, ${plural(file.coverLetters.length, 'cover letter')} and ${plural(file.jobs.length, 'job')}. Version history is not included.`,
      })
    } catch (err) {
      console.error('[vault] export failed:', err)
      toast.error("Couldn't export the vault")
    } finally {
      setBusy(null)
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      toast.error('This file is too large to import.')
      return
    }
    setBusy('read')
    try {
      const vault = sanitizeVault(await file.text())
      if (!vault.resumes.length && !vault.coverLetters.length && !vault.jobs.length) {
        toast.error('There is nothing to import in this file.')
        return
      }
      setPending({ name: file.name, vault })
    } catch (err) {
      toast.error(err instanceof VaultImportError ? err.message : "Couldn't read this file.")
      if (!(err instanceof VaultImportError)) console.error('[vault] read failed:', err)
    } finally {
      setBusy(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function confirmImport() {
    if (!pending) return
    setBusy('import')
    try {
      const result = await importVault(pending.vault)
      toast.success('Vault imported', {
        description: `Added ${plural(result.resumes, 'resume')}, ${plural(result.coverLetters, 'cover letter')} and ${plural(result.jobs, 'job')}.`,
      })
      setPending(null)
      // Lists and the job tracker keep what they loaded in memory; reload so
      // they show the import (and the job store can't write an old list back).
      setTimeout(() => window.location.reload(), 900)
    } catch (err) {
      console.error('[vault] import failed:', err)
      toast.error("Couldn't import the vault. Nothing after the first failure was added.")
    } finally {
      setBusy(null)
    }
  }

  const v = pending?.vault

  return (
    <div className="space-y-3 p-3 rounded-xl bg-accent/30 border border-border/50">
      <div className="space-y-0.5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <FileJson size={12} />
          Vault
        </p>
        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
          Back up or move all your resumes, cover letters and job applications as one JSON file.
        </p>
      </div>

      {!pending ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" disabled={busy !== null} onClick={handleExport}>
            {busy === 'export' ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            Export Vault
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" disabled={busy !== null} onClick={() => inputRef.current?.click()}>
            {busy === 'read' ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            Import Vault
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            aria-label="Choose a vault file to import"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="space-y-2.5 rounded-lg border border-border bg-background p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold break-all">{pending.name}</p>
            <button type="button" aria-label="Cancel import" onClick={() => setPending(null)} className="text-muted-foreground hover:text-foreground">
              <X size={13} />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {plural(v!.resumes.length, 'resume')}, {plural(v!.coverLetters.length, 'cover letter')}, {plural(v!.jobs.length, 'job')}.
            They are added alongside what you have; nothing is replaced.
          </p>
          <div className="flex items-start gap-1.5 text-[11px]">
            <ShieldCheck size={13} className="mt-px shrink-0 text-emerald-600" />
            <div className="min-w-0">
              {v!.report.cleaned === 0 ? (
                <p className="text-muted-foreground">Checked: no scripts, unsafe links or unsafe images found.</p>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    Checked and cleaned {plural(v!.report.cleaned, 'item')} (scripts, unsafe links or images, invalid values).
                  </p>
                  <details className="mt-1">
                    <summary className="cursor-pointer text-muted-foreground/80 hover:text-foreground">What was cleaned</summary>
                    <ul className="mt-1 max-h-28 overflow-y-auto space-y-0.5 text-[10px] text-muted-foreground">
                      {v!.report.notes.map((note, i) => <li key={i} className="break-words">{note}</li>)}
                      {v!.report.cleaned > v!.report.notes.length && <li>…and {v!.report.cleaned - v!.report.notes.length} more</li>}
                    </ul>
                  </details>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-0.5">
            <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={busy !== null} onClick={() => setPending(null)}>Cancel</Button>
            <Button size="sm" className="h-7 text-xs gap-1.5" disabled={busy !== null} onClick={confirmImport}>
              {busy === 'import' && <Loader2 size={12} className="animate-spin" />}
              Import
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
