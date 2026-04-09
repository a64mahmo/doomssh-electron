# Idea: Vault-Based File Storage

Replace IndexedDB (Dexie) with a local folder on the user's machine — Obsidian-style.

## The Model

On first launch, user picks or creates a folder (the "vault"). Each resume is stored as a `.json` file in that folder. The vault path is saved in Electron's `userData` directory (same place as the API key).

```
~/Documents/Resumes/
├── abdallh-mahmood.json
├── pm-jordan-kim.json
└── designer-maya-patel.json
```

## Why

- Data lives on the user's computer, not trapped in a browser database
- Portable — copy/move the folder and everything comes with it
- Version controllable with git
- Easy to back up (Time Machine, Dropbox, etc.)
- User can inspect/edit files outside the app

## What Needs to Change

1. **`electron/main.ts`** — add IPC handlers:
   - `vault:set` — user picks a folder via dialog
   - `vault:get` — returns current vault path
   - `resume:list` — reads all `.json` files in vault
   - `resume:read` — reads one file by id/filename
   - `resume:write` — writes one file
   - `resume:delete` — deletes one file

2. **`electron/preload.ts`** — expose the new handlers via `contextBridge`

3. **`frontend/lib/db/database.ts`** — replace Dexie calls with IPC calls, keeping the same function signatures (`getAllResumes`, `getResume`, `saveResume`, `deleteResume`) so the rest of the frontend is untouched

4. **First-run screen** — vault picker UI when no vault path is stored yet

## File Format

Keep JSON (not markdown). Resume data has deeply structured fields — typed dates, per-item IDs, settings object, section columns map — that are hard to round-trip through a custom markdown format without a parser. JSON is still portable and diffable. A separate "export as markdown" feature could be added later.

## Notes

- Vault path stored in `app.getPath('userData')` alongside `apikey.enc`
- File naming: `{resume-name-slugified}-{id}.json` or just `{id}.json`
- No schema migrations needed — JSON files carry the full resume shape
