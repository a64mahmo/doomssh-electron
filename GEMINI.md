# DoomSSH: AI Engineering Protocol (GEMINI.md)

As a Gemini-powered engineering agent, you are expected to operate at a "Super Senior" level. This protocol defines the technical constraints and logic patterns required to maintain DoomSSH's architectural integrity.

---

## 1. The Single Source of Truth (SSOT)
The core data structures (Resume, Jobs) are defined in `frontend/lib/shared/types.ts`. Store-specific logic and UI state are defined in `frontend/lib/store/types.ts`.
- **Constraint:** Do not create shadow interfaces or redundant types in Electron or separate frontend files.
- **Action:** If you are adding a new feature (e.g., "Job Tracker"), start by defining its schema in `frontend/lib/shared/types.ts` and then update the stores.

## 2. State Mutation & Persistence Patterns
We use **Zustand + Immer**. This requires a specific mental model for async operations.
- **Pattern:** `set((state) => { state.data = newValue; })`.
- **CRITICAL:** The `state` object inside the `set` function is a Proxy. It is **revoked** as soon as the function returns.
- **Persistence Rule:** Never call `saveResume()` inside a component. Use store actions such as `updateSettings` or `updateSection`; they mark the document dirty, and the persistence managers (`createDebouncedSaver` in `lib/store/debouncedSaver.ts`) save it 500 ms after edits pause — to the vault on desktop, IndexedDB in the browser.

## 3. Rendering: One HTML Template
DoomSSH has one renderer, used two ways:
1.  **Live preview:** `MasterTemplate.tsx` and `web/sections/`, rendered directly in the builder.
2.  **PDF export:** the same template on `app/print`, printed with Chromium `printToPDF` on desktop and through the browser's print dialog (Save as PDF) on the web.

**Mandates for AI Agents:**
- Keep the `data-*` hooks the print CSS relies on (`data-resume-page`, `data-sidebar-panel`, `data-section-heading`, `data-entry`, `data-entry-desc`, `data-keep`, `data-footer-fixed`).
- Check visual changes in print (`/print/new/?mode=export`) as well as the preview — page breaks only happen there.
- New template options go in `base()` in `components/web/index.ts`, so switching templates resets them.
- **Colors:** Use the `colors` object from the `TemplateCtx`. In `basic` mode, `colors.heading` and `colors.accent` are often identical.

## 4. Electron IPC & Security Boundary
- **Mandate:** The frontend must remain "ignorant" of the underlying OS.
- **Bridge:** Use `window.electron` for all AI, File System, and Secure Storage operations.
- **Preload:** If you add a new IPC channel, you must update `electron/main.ts` (the handler), `electron/preload.ts` (the bridge), and `frontend/electron.d.ts` (the type definition).
- **Web build:** The same frontend ships as a static site. Branch behaviour with `isElectron()` / `isWeb()` from `frontend/lib/platform.ts` (`NEXT_PUBLIC_APP_PLATFORM` build variable) and give every `window.electron` feature a browser fallback or hide it.

## 5. UI Component Architecture
- **Foundation:** We use `@base-ui/react` for primitives.
- **Styling:** Use Tailwind CSS 4.
- **Consistency:** Ensure all new UI components support Dark Mode via Tailwind's `dark:` modifier and reference the CSS variables in `globals.css`.

---

## 7. Mandatory Documentation & Audit Trail
- **Mandate:** AI Agents must maintain the project's documentation. 
- **Action:** After every feature implementation or bug fix:
    1. Add an entry to `CHANGELOG.md`.
    2. Update `README.md` if high-level features or tech stack changed.
    3. Update files in `docs/` if architectural or internal logic changed.

---

## Pre-Flight Checklist for AI Edits
Before declaring a task complete, verify the following:
1. [ ] **Types:** Are all new data structures reflected in `types.ts`?
2. [ ] **Persistence:** Does the change correctly trigger the auto-save debouncer?
3. [ ] **Rendering:** Did I change the HTML template, keep its print hooks, and check the printed output?
4. [ ] **Web build:** Does the change work without `window.electron`?
5. [ ] **Security:** Did I avoid leaking logic into the frontend that belongs in the Electron main process?
6. [ ] **Documentation:** Have I updated `CHANGELOG.md`, `README.md`, and relevant `/docs`?

**Any deviation from this protocol will lead to technical debt and layout desynchronization.**
