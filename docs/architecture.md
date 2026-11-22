# System Architecture

DoomSSH is a local-first resume builder that ships as two builds from one Next.js codebase: an **Electron desktop app** and a **static web site** (deployed to Cloudflare). It combines a local-first data model, a headless rendering pipeline, and a secure AI integration (desktop only).

## Overview

```mermaid
graph TD
    A[Electron App] --> B[Next.js Frontend]
    B -- IPC --> A
    A --> E[Vault / JSON files]
    A --> F[Anthropic API]
    A -- printToPDF --> P[PDF]
    W[Web build] --> B
    B -. browser build .-> G[IndexedDB]
```

The frontend decides which build it is running in through `frontend/lib/platform.ts` — see [Platform detection](#platform-detection).

## Data Management

### Local State (Zustand)

High-frequency UI updates and the active editing state are managed in-memory using **Zustand** with Immer. This ensures that typing, drag-and-drop, and other interactions are buttery smooth.

### Persistence Manager

The Zustand stores are intentionally **persistence-agnostic**. Two small managers — `frontend/lib/store/persistenceManager.ts` (resumes) and `frontend/lib/store/jobPersistenceManager.ts` (jobs) — are started once by `PersistenceProvider` and built on a shared saver, `createDebouncedSaver` (`frontend/lib/store/debouncedSaver.ts`):

```typescript
// frontend/lib/store/persistenceManager.ts
createDebouncedSaver({
  subscribe: (onChange) => useResumeStore.subscribe((state) => state.resume, onChange),
  getSnapshot: () => useResumeStore.getState().resume,
  isDirty: () => useResumeStore.getState().isDirty,
  save: saveResume,
  onSaved: () => useResumeStore.getState().markSaved(),
  onError: (err) => useUIStore.getState().addError(`Persistence Error: ...`),
});
```

How the saver behaves:
- It watches the **document** (the resume object or the jobs array), not the `isDirty` flag. Every change restarts a 500 ms timer; the save runs when edits pause.
- It only saves when `isDirty` is true, so loading a document never writes it back.
- If the document changes while a save is in flight, it saves again afterwards, and `markSaved()` runs only when nothing changed during the save.
- A failed save leaves `isDirty` true and reports the error to the UI store.

> An earlier version subscribed to `isDirty` and rate-limited saves to one per second. Edits made while the flag was already true — or within a second of the previous save — were silently never written. `tests/lib/store/debouncedSaver.test.ts` covers those cases.

This decoupling means:
- The store is easier to test and reason about
- I/O never blocks the main thread
- Saving logic can be swapped without touching the store

### Vault Storage (Electron)

Resume data is stored as **JSON files** in a user-defined or default system directory. By default, the app creates a `vault/` folder inside its user data directory. Users can also select any custom directory.

Sensitive data (Anthropic API keys) is stored using **Electron's `safeStorage` API**, which leverages the OS keychain (macOS Keychain / Windows Credential Manager).

### Browser Storage (web build)

The web build has no vault. `frontend/lib/db/database.ts` and `frontend/lib/db/jobDatabase.ts` check for `window.electron` and, when it is absent, fall back to **IndexedDB** through Dexie (`frontend/lib/db/browserDb.ts`):

| Table | Key | Holds |
|-------|-----|-------|
| `resumes` | `id` | Resumes and cover letters |
| `kv` | `key` | The jobs file under the key `jobs` |

Data lives only in that browser profile; clearing the site's data deletes it. The database is opened lazily so importing the module never touches IndexedDB during the static prerender.

### Platform detection

`frontend/lib/platform.ts` exposes `appPlatform()`, `isElectron()` and `isWeb()`. The value comes from the build-time variable `NEXT_PUBLIC_APP_PLATFORM` (`web` or `electron`); when it is unset, the platform is detected from the Electron preload bridge (`window.electron`). `next build` inlines the value, so it must be set when building — see [Deployment](./deployment.md).

Use it for behaviour that differs by build (for example, the Settings dialog hides AI, debugging and update controls in the web build). Keep feature checks such as `window.electron?.exportPdf` where you actually call a bridge method.

## Communication

### Frontend to AI

All AI interactions (Claude Opus 4.6) are routed through the Electron Main Process via IPC. This bypasses browser CORS restrictions and keeps API keys off the renderer.

```mermaid
sequenceDiagram
    Frontend ->> Electron: ipcRenderer.send('ai:start', messages)
    Electron ->> Anthropic: messages.stream()
    loop Streaming chunks
        Electron ->> Frontend: ipcRenderer.emit('ai:chunk', text)
    end
    Electron ->> Frontend: ipcRenderer.emit('ai:done')
```

### PDF Export (HTML → PDF)

The HTML template is the single source of truth: the live preview renders it, and the desktop app prints that same HTML with Chromium. Nothing leaves the user's machine.

```mermaid
sequenceDiagram
    Renderer ->> Main: exportPdf({ resume, fileName })
    Main ->> Hidden window: load /print/new/?mode=export
    Main ->> Hidden window: inject window.__DOOMSSH_PRINT_RESUME__
    Hidden window ->> Hidden window: render MasterTemplate, wait for fonts
    Hidden window -->> Main: html[data-print-ready="true"]
    Main ->> Main: webContents.printToPDF({ printBackground, preferCSSPageSize })
    Main ->> User: save dialog, write file
```

- **Entry point:** `downloadResumePDF` in `frontend/lib/utils/export.tsx` calls `window.electron.exportPdf` when the bridge is present, and prints from a hidden iframe otherwise.
- **Main process:** the `export-pdf` IPC handler in `electron/main.ts` owns the hidden window, readiness polling (15 s timeout), `printToPDF` and the save dialog.
- **Print page:** `frontend/app/print/[resumeId]/PrintClient.tsx`. With `?mode=export` it takes the injected resume, skips `window.print()`, and sets `data-print-ready` once fonts and layout settle. Without it, it loads the resume by id and opens the print dialog.

**Pages** (`frontend/components/web/PagedResume.tsx`, `frontend/lib/pdf/paginate.ts`):
- The template is laid out once, hidden, as one flow. Page breaks are chosen from its measured lines and keep-together blocks: no line or image is ever cut, `[data-section-heading]` stays with what follows, an `[data-entry]` head stays with its first line, and `[data-entry-desc] > div` and `[data-keep]` stay whole unless taller than a page.
- Each page is a frame of exact paper size that paints its own background, sidebar panel, border and numbered footer, and shows its slice of the flow through a clipped window inset by the margins.
- Two columns are paginated separately (one window per column per page), and the header heads one column rather than spanning both, so the columns and sidebar panel run the full height of every page. There is no column divider and no footer rule. Every page gets its margin on all four sides; full-bleed bands and panels still reach the paper edge.
- Print CSS is only `@page { size: letter | A4; margin: 0 }` plus `break-after: page` between frames. Frames use `contain: strict` so Chromium prints each as one sheet.
- Desktop export lays the pages out in an offscreen window (device scale 1). A normal hidden window takes the display's scale (2 on Retina), where text metrics round differently from print, and the measured breaks drift a pixel or so per entry until they cut lines.
- The live preview renders the same pages. It measures at the screen's scale, so on a Retina display a break can occasionally land one line differently from the exported PDF.

**Web build:** `downloadResumePDF` loads `/print/new/?mode=export` in a hidden iframe, hands it the in-memory resume (`__DOOMSSH_PRINT_RESUME__` plus a `doomssh:print-resume` event), waits for `data-print-ready`, and calls the frame's `print()`. The browser's dialog saves the PDF; the document title becomes the suggested file name. There is no second renderer.

## Headless Rendering Architecture

DoomSSH uses a **Headless Controller** pattern to guarantee perfect visual parity between the interactive HTML preview and the exported PDF.

### The Pipeline

```
Resume Data → Section Controller → SectionViewModel → Renderer (Web / PDF)
```

### 1. Controllers (`frontend/lib/renderers/`)

Each section type has a dedicated controller that:
- Transforms raw store data into a normalized **ViewModel**
- Handles **visibility logic** (e.g., hide section if no items)
- Handles **ordering logic** (e.g., "Employer → Title" vs "Title → Employer")
- Handles **date formatting** via a shared helper

```typescript
// frontend/lib/renderers/types.ts
export interface SectionViewModel {
  title: string;
  isVisible: boolean;
  type: SectionType;
  items: any[];         // Processed, ready-to-render items
  meta?: Record<string, any>;
}

export interface RenderContext {
  settings: any;         // ResumeSettings
  helpers: {
    formatDate: (start, end, present, format) => string;
    pt: (size) => string;
  };
}
```

### 2. Renderer (`frontend/components/web/`)

Section renderers are "dumb" components. They receive a `SectionViewModel` and render it with React DOM and Tailwind CSS. The same components serve the live preview and, through `/print`, every PDF export.

### Why This Matters

With the headless pattern, **every business rule lives in exactly one place**, separate from markup. Changing `experienceOrder` from `'position-employer'` to `'employer-title'` requires editing only `experience.ts` in the renderers folder. Both the live preview and the PDF export update automatically.

### Adding a New Section

1. Add the section type to `frontend/lib/store/types.ts` (`SectionType` union)
2. Create a controller in `frontend/lib/renderers/` (or add to `index.ts`)
3. Create a Web renderer in `frontend/components/web/sections/`
4. Register it in `frontend/components/web/sections/index.tsx`
5. If the section should never split across printed pages, add `data-keep` to its root element
6. Add editor components in `frontend/components/editor/sections/`
7. Add a data entry form in the Customize Panel if needed

Controllers must read the field names the editor writes. For example, awards use `title` and `date`, volunteering uses `role`, references use `name` and `position`. `tests/lib/renderers/sections.test.ts` pins these.

## Performance Optimization

DoomSSH employs several strategies to keep editing smooth.

### Debounced Input

Typing in editor fields triggers store updates and persistence. To prevent lag during rapid typing, DoomSSH uses debounced input components:

- **`DebouncedInput`** (`frontend/components/ui/debounced-input.tsx`): Wraps standard inputs with a 500ms debounce delay
- **`DebouncedRichTextArea`** (`frontend/components/ui/debounced-rich-text-area.tsx`): Same for rich text areas

These components maintain local state and only propagate changes to the store after the user stops typing for 500ms.

### Live Preview

The preview (`frontend/components/preview/PreviewPanel.tsx`) renders `MasterTemplate` directly as HTML, so it updates on every store change with no PDF generation, no iframe reload and no lost scroll or zoom position. Zoom is a CSS transform. Dashed "Page N" guides are drawn at each page height; they are approximate, because printing moves a heading or an entry's first line to the next page rather than splitting it.

> The preview used to regenerate a full PDF document on every change (debounced) and reload it in an iframe, which caused flicker, scroll resets and noticeable lag.

### Persistence Debouncing

The persistence managers debounce writes (500 ms after the last change) to prevent excessive I/O during editing sessions. See [Persistence Manager](#persistence-manager).

## Testing Strategy

- **Unit Tests** (`frontend/lib/**/*.test.ts`): Vitest tests for controllers, stores, and utilities.
- **Integration Tests** (`tests/`): Playwright tests for UI component coordination.
- **Regression Tests**: Ensure state mutations propagate through the rendering pipeline.
- **Visual Regression**: Automated snapshot comparisons to detect layout drift.
- **Template smoke test** (`frontend/tests/components/web/templateSmoke.test.tsx`): renders the HTML template for every preset and a cover letter, with every section type populated (`frontend/scripts/fixtures.ts`).
- **Sidebar colours** (`frontend/tests/lib/pdf/templateCtx.test.ts`): solid-sidebar detection and the light colour set for dark panels.

Run all tests:
```bash
npm run test --prefix frontend    # Unit tests
npm run test:all                  # Full suite (requires Playwright)
```
