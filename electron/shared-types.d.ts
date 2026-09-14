// Re-export the shared frontend types through a declaration file. Importing
// ../frontend/lib/shared/types directly pulls a .ts source outside electron's
// rootDir into the program, which fails tsc with TS6059 (see electron/tsconfig.json).
export type { Resume, JobApplication, JobsVaultFile } from '../frontend/lib/shared/types'
