# Engineering Mandates for AI Agents (GEMINI.md)

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
- **Persistence Pattern:** Always use the `scheduleSave(get)` helper. Do not trigger `saveResume()` manually from components.

## 3. The "Mirror-World" Rendering Rule
- **Constraint:** The HTML preview (`MasterTemplate.tsx`) and the PDF engine (`ResumePDF.tsx`) are technically separate systems.
- **Mandate:** If you change a margin, a font size, a color, or a layout structure in the HTML template, you **must** apply the identical change to the corresponding PDF component.
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
    - If a new IPC channel is needed, define it in `electron/main.ts` (handler) and `electron/preload.ts` (bridge).

## 6. Layout Mathematics
- **Constraint:** PDFs are rigid; HTML is fluid.
- **Mandate:** When implementing multi-column layouts, use explicit percentage widths (e.g., `68%` and `32%`) and solid spacing units (`pt` or `mm`). Avoid `flex-grow` behaviors that behave differently between Chrome (Renderer) and Fontkit (PDF).

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

## 10. Automated Release & Versioning
- **Mechanism:** Merging a branch into `main` automatically triggers `.github/workflows/auto-version.yml`.
- **Logic:**
    - The workflow runs all tests (`npm run test:all`).
    - It defaults to a `patch` version bump.
    - To trigger a different bump, include `#minor` or `#major` in the commit message.
    - Pushing a new tag (manually or via CI) triggers `.github/workflows/release.yml` for artifact building.

## 11. Mandatory Documentation & Audit Trail
- **Constraint:** Every significant feature, architectural change, or UI overhaul must be documented.
- **Mandate:** 
    - **Changelog:** Always add a new entry to `CHANGELOG.md` under the appropriate version heading (or create a new one if bumping version).
    - **README:** Update the feature list or technology stack in `README.md` if the change affects high-level capabilities.
    - **Docs:** If the internal logic or component structure changes, update the relevant files in `/docs` (e.g., `frontend.md`, `architecture.md`).

---

### Verification Checklist for AI Changes
1. [ ] Did I update `types.ts`?
2. [ ] Did I mirror the UI change in both `MasterTemplate.tsx` and `ResumePDF.tsx`?
3. [ ] Is the state mutation happening safely within an `immer` draft?
4. [ ] Does the change support both Light and Dark modes?
5. [ ] Did I avoid introducing node-only modules into the frontend bundle?
6. [ ] Does the layout remain fixed to the viewport without global scrolling?
7. [ ] Did I use shared PDF components (`HeaderRendererPDF`) for visual consistency?
8. [ ] Did I add/update Vitest unit tests for any logic changes?
9. [ ] Did I run `npm test --prefix frontend` and confirm all tests pass?
10. [ ] If this is a release-ready merge, did I check if `#minor` or `#major` is required in the commit message?
11. [ ] **Documentation:** Did I update `CHANGELOG.md`, `README.md`, and relevant files in `/docs`?

**Failure to follow these mandates will result in layout drift, state corruption, or build failures.**
