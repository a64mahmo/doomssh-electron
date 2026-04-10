# DoomSSH — Resume Builder

A privacy-first, local-only resume builder. No accounts. No servers. Your data lives on your machine.

---

## Tech Stack

| Layer    | Technology                                        |
| :------- | :------------------------------------------------ |
| Runtime  | Electron 34                                       |
| Frontend | Next.js 15 (App Router, static export)            |
| State    | Zustand + Immer                                   |
| Storage  | Vault — local `.json` files (Obsidian-style)      |
| Styles   | Tailwind CSS 4                                    |
| PDF      | @react-pdf/renderer                               |
| AI       | Anthropic SDK (claude-opus-4-6, streamed via IPC) |

---

## Architecture

### Storage — Vault

On first launch the user picks a folder (the vault). Every resume is stored as a plain `.json` file inside it.

```
~/Documents/Resumes/
├── abc123.json
├── def456.json
└── ghi789.json
```

The vault path is saved in Electron's `userData` directory. The rest of the app calls the same functions (`getAllResumes`, `saveResume`, `deleteResume`) — they route through IPC to the main process which reads/writes files directly.

```
Renderer → window.electron.vault.* → IPC → main.ts fs.*
```

### AI Bridge

API keys are stored encrypted via Electron `safeStorage` (OS keychain). The renderer never touches the key — it sends messages via `window.electron.aiStream`, the main process owns the Anthropic SDK and streams chunks back.

### PDF Export

`@react-pdf/renderer` generates the PDF binary entirely in the renderer. Nothing leaves the machine

### Rendering

Two synchronized paths from the same Zustand store:

- **HTML preview** — interactive, real-time, drag-and-drop
- **PDF** — `@react-pdf/renderer`, pixel-matched to the preview

---

## Development

```bash
# Install dependencies
npm install && cd frontend && npm install && cd ..

# Dev (Next.js dev server + Electron)
npm run electron:dev

# Test production build locally (no packaging)
npm run electron:preview

# Build distributable
npm run electron:dist
```

---

## Project Structure

```
electron/         # Main process + preload
frontend/
  app/            # Next.js routes
  components/     # UI components + templates
  lib/
    db/           # database.ts — CRUD via IPC
    store/        # Zustand store + types.ts (single source of truth)
    pdf/          # PDF rendering helpers
```

---

**Author:** Abdallh Mahmood
