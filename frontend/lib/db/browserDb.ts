// IndexedDB storage for the web build, where the Electron vault isn't available
import Dexie, { type Table } from 'dexie'
import type { Resume } from '@/lib/store/types'

export interface StoredVersion {
  resumeId: string
  id: string
  savedAt: number
  reason: 'opened' | 'autosave' | 'manual' | 'restore' | 'download'
  resume: Resume
}

interface KeyValue {
  key: string
  value: unknown
}

class BrowserDB extends Dexie {
  resumes!: Table<Resume, string>
  kv!: Table<KeyValue, string>
  versions!: Table<StoredVersion, [string, string]>

  constructor() {
    super('doomssh')
    this.version(1).stores({
      resumes: 'id',
      kv: 'key',
    })
    // Version history. v1 stays as it was so existing databases upgrade in place.
    this.version(2).stores({
      resumes: 'id',
      kv: 'key',
      versions: '[resumeId+id], resumeId',
    })
  }
}

let db: BrowserDB | null = null

// Opened lazily so importing this module never touches IndexedDB during prerender
export function browserDb(): BrowserDB {
  return (db ??= new BrowserDB())
}
