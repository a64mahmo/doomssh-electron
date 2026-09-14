// IndexedDB storage for the web build, where the Electron vault isn't available
import Dexie, { type Table } from 'dexie'
import type { Resume } from '@/lib/store/types'

interface KeyValue {
  key: string
  value: unknown
}

class BrowserDB extends Dexie {
  resumes!: Table<Resume, string>
  kv!: Table<KeyValue, string>

  constructor() {
    super('doomssh')
    this.version(1).stores({
      resumes: 'id',
      kv: 'key',
    })
  }
}

let db: BrowserDB | null = null

// Opened lazily so importing this module never touches IndexedDB during prerender
export function browserDb(): BrowserDB {
  return (db ??= new BrowserDB())
}
