# DoomSSH: AI Engineering Protocol (GEMINI.md)

As a Gemini-powered engineering agent, you are expected to operate at a "Super Senior" level. This protocol defines the technical constraints and logic patterns required to maintain DoomSSH's architectural integrity.

---

## 1. The Single Source of Truth (SSOT)
The entire application is driven by the state tree defined in `frontend/lib/store/types.ts`.
- **Constraint:** Do not create shadow interfaces or redundant types.
- **Action:** If you are adding a new feature (e.g., "Job Tracker"), start by defining its schema in `types.ts` and updating the `Resume` or creating a new domain-specific interface.

## 2. State Mutation & Persistence Patterns
We use **Zustand + Immer**. This requires a specific mental model for async operations.
- **Pattern:** `set((state) => { state.data = newValue; })`.
- **CRITICAL:** The `state` object inside the `set` function is a Proxy. It is **revoked** as soon as the function returns.
- **Persistence Rule:** Never call `saveResume()` inside a component. Always use the `updateSettings` or `updateSection` actions in the store, which trigger the internal `scheduleSave` debouncer.

## 3. The Dual-Renderer Synchronization (The "Mirror" Rule)
DoomSSH has two "realities":
1.  **The DOM Reality:** (`MasterTemplate.tsx`, `SectionRenderers.tsx`)
2.  **The PDF Reality:** (`ResumePDF.tsx`, `SectionsPDF.tsx`)

**Mandates for AI Agents:**
- When you modify a margin, padding, font size, or structural divider in the DOM, you **must** immediately find its counterpart in the PDF files and apply the equivalent `@react-pdf` style.
- **Layout Math:** `@react-pdf` does not support complex CSS flex-box behaviors perfectly. Use explicit percentage widths (e.g., `68%` vs `32%`) to ensure alignment between the two realities.
- **Colors:** Use the `colors` object from the `TemplateCtx`. In `basic` mode, `colors.heading` and `colors.accent` are often identical.

## 4. Electron IPC & Security Boundary
- **Mandate:** The frontend must remain "ignorant" of the underlying OS.
- **Bridge:** Use `window.electron` for all AI, File System, and Secure Storage operations.
- **Preload:** If you add a new IPC channel, you must update `electron/main.ts` (the handler), `electron/preload.ts` (the bridge), and `frontend/electron.d.ts` (the type definition).

## 5. UI Component Architecture
- **Foundation:** We use `@base-ui/react` for primitives.
- **Styling:** Use Tailwind CSS 4.
- **Consistency:** Ensure all new UI components support Dark Mode via Tailwind's `dark:` modifier and reference the CSS variables in `globals.css`.

---

## 6. Pre-Flight Checklist for AI Edits
Before declaring a task complete, verify the following:
1. [ ] **Types:** Are all new data structures reflected in `types.ts`?
2. [ ] **Persistence:** Does the change correctly trigger the auto-save debouncer?
3. [ ] **Mirroring:** Is the visual change identical in both the Preview and the PDF export?
4. [ ] **Fidelity:** Did I avoid using CSS shorthand properties that `@react-pdf` doesn't support (e.g., `border: 1px solid red`)?
5. [ ] **Security:** Did I avoid leaking any logic into the frontend that belongs in the Electron main process?

**Any deviation from this protocol will lead to technical debt and layout desynchronization.**
