# Engineering Mandates for AI Agents (AGENT.md)

As an AI agent, you are part of the core engineering team. You must adhere to these strict architectural constraints to ensure the stability and maintainability of the DoomSSH platform.

---

## 1. Domain Integrity (Types)
- **Constraint:** `frontend/lib/store/types.ts` is the **Single Source of Truth**.
- **Mandate:** Never use `any` or `Record<string, unknown>` for core data structures. If you add a field to a resume section, you **must** update the interface in `types.ts` first.
- **Style:** Prefer Discriminated Unions for section types to allow for exhaustive switch-case handling in the renderers.

## 2. Immutable State Contract
- **Constraint:** We use Zustand with the `immer` middleware.
- **Mandate:** Mutate the `state` draft directly within `set()` calls.
- **Async Warning:** Never access the `state` draft inside an `async` callback or `setTimeout`. The proxy is revoked immediately after the `set()` function returns.
- **Persistence Pattern:** Store actions only mutate state and set `isDirty`. Saving is automatic: `persistenceManager.ts` / `jobPersistenceManager.ts` (built on `createDebouncedSaver` in `lib/store/debouncedSaver.ts`) watch the document and save 500 ms after edits pause. Never call `saveResume()` / `saveAllJobs()` from components, and never gate saves on `isDirty` transitions or rate limits — that silently drops edits.

## 3. Rendering: HTML First, PDF Mirror
- **Constraint:** The HTML template (`MasterTemplate.tsx` + `components/web/sections/`) is the source of truth. It renders the live preview and, through `app/print`, the desktop PDF export (Chromium `printToPDF`).
- **Mandate (print hooks):** Keep the `data-*` attributes the print CSS depends on — `data-resume-page`, `data-sidebar-panel`, `data-section-heading`, `data-entry`, `data-entry-desc`, `data-keep`, `data-footer-fixed`. Removing one reintroduces blank pages or split headings.
- **Mandate (mirror):** The browser build still downloads PDFs from `@react-pdf/renderer` (`ResumePDF.tsx`). Until that path is retired, apply visual changes to the corresponding PDF component too.
- **Primitive Matching:**
    - `<div>` / `<section>` → `<View>`
    - `<span>` / `<p>` / `<h1>` → `<Text>`
    - `border-bottom: 1px solid` → `borderBottomWidth: 1, borderBottomColor: ..., borderBottomStyle: 'solid'`

## 4. UI Architecture (Base UI + Tailwind)
- **Constraint:** We use `@base-ui/react` (Radix) for unstyled primitives and Tailwind 4 for styling.
- **Mandate:** 
    - Keep UI components in `frontend/components/ui/` pure and atomic.
    - Use the `cn()` utility for all class merges.
    - Ensure Dark Mode compatibility by using `dark:` variants or CSS variables defined in `globals.css`.

## 5. Security & IPC Boundary
- **Constraint:** The Renderer process is untrusted.
- **Mandate:** 
    - Never import `@anthropic-ai/sdk` or `fs` in the `frontend/` directory.
    - All desktop-level features must be accessed via `window.electron`.
    - If a new IPC channel is needed, define it in `electron/main.ts` (handler), `electron/preload.ts` (bridge) and `frontend/electron.d.ts` (type).
    - Branch web vs desktop behaviour with `isElectron()` / `isWeb()` from `frontend/lib/platform.ts` (driven by the `NEXT_PUBLIC_APP_PLATFORM` build variable). Every `window.electron` call needs a browser fallback or must be hidden in the web build.

## 6. Layout Mathematics
- **Constraint:** Pages are fixed-size; the preview is fluid.
- **Mandate:** When implementing multi-column layouts, use explicit percentage widths (e.g., `68%` and `32%`) and solid spacing units (`pt` or `mm`). Avoid `flex-grow` behaviors that behave differently between Chromium and `@react-pdf`. Width estimates shared by both renderers live in `frontend/lib/pdf/layoutFit.ts`.

## 7. Global Navigation & Layout
- **Constraint:** The application uses a viewport-fixed layout (`h-screen overflow-hidden`) defined in `frontend/app/builder/layout.tsx`.
- **Mandate:** 
    - Never allow the root `<body>` or `main` container to scroll. Only individual panels (Sidebar, Editor, Preview) should have `overflow-y-auto`.
    - All builder pages must be wrapped by the global `Sidebar`.

## 8. Shared Component DRY-ness (PDF)
- **Constraint:** Resumes and Cover Letters must share visual branding.
- **Mandate:** 
    - Always use the `HeaderRendererPDF` component for document headers. Do not implement custom header logic in `CoverLetterPDF`.
    - Use `ContactLinePDF` for all contact information rendering to ensure consistent wrapping and delimiter logic.

## 9. Unit Testing & Logic Validation
- **Constraint:** Logic changes must be empirically verified before being committed.
- **Mandate:** 
    - Every change to a Headless Controller (`frontend/lib/renderers/`) or Store Action (`frontend/lib/store/`) **must** be accompanied by a new or updated Vitest unit test.
    - Run `npm test --prefix frontend` to verify logic integrity after any data model or transformation change.

## 10. CI & Releases
- **Tests:** `.github/workflows/test.yml` runs the frontend unit tests (`npm test --prefix frontend`) on every push and pull request to `main`.
- **Releases:** Versions are not bumped automatically. Bump `version` in `package.json`, commit, then push a `v*` tag (e.g. `git tag v1.8.0 && git push origin v1.8.0`). `.github/workflows/release.yml` builds the macOS and Windows artifacts for that tag.

## 11. Mandatory Documentation & Audit Trail
- **Constraint:** Every significant feature, architectural change, or UI overhaul must be documented.
- **Mandate:** 
    - **Changelog:** Always add a new entry to `CHANGELOG.md` under the appropriate version heading (or create a new one if bumping version).
    - **README:** Update the feature list or technology stack in `README.md` if the change affects high-level capabilities.
    - **Docs:** If the internal logic or component structure changes, update the relevant files in `/docs` (e.g., `frontend.md`, `architecture.md`).

---

### Verification Checklist for AI Changes
1. [ ] Did I update `types.ts`?
2. [ ] Did I make the UI change in `MasterTemplate.tsx` (keeping its print `data-*` hooks) and mirror it in `ResumePDF.tsx`?
3. [ ] Is the state mutation happening safely within an `immer` draft?
4. [ ] Does the change support both Light and Dark modes?
5. [ ] Did I avoid introducing node-only modules into the frontend bundle, and does the change work in the browser build (`isWeb()`)?
6. [ ] Does the layout remain fixed to the viewport without global scrolling?
7. [ ] Did I use shared PDF components (`HeaderRendererPDF`) for visual consistency?
8. [ ] Did I add/update Vitest unit tests for any logic changes?
9. [ ] Did I run `npm test --prefix frontend` and confirm all tests pass?
10. [ ] If this is a release, did I bump `package.json` and push a matching `v*` tag?
11. [ ] **Documentation:** Did I update `CHANGELOG.md`, `README.md`, and relevant files in `/docs`?

**Failure to follow these mandates will result in layout drift, state corruption, or build failures.**
