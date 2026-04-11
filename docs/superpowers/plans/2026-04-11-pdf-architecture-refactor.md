# PDF Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the parallel rendering systems (HTML vs PDF), eliminate redundant template files, and unify core data structures to improve maintainability and prevent visual drift.

**Architecture:** Consolidate duplicated logic into shared utility files and a single source of truth for section icons. Delete "redirect" template files and reference the master template directly.

**Tech Stack:** React, TypeScript, Tailwind CSS, @react-pdf/renderer, Zustand.

---

### Task 1: Data Model & File System Cleanup

**Files:**
- Modify: `frontend/lib/store/types.ts`
- Modify: `frontend/components/templates/index.ts`
- Modify: `frontend/components/templates/SectionRenderers.tsx`
- Modify: `frontend/components/pdf/SectionsPDF.tsx`
- Delete: `frontend/components/templates/ClassicTemplate.tsx`
- Delete: `frontend/components/templates/MinimalTemplate.tsx`
- Delete: `frontend/components/templates/ModernTemplate.tsx`
- Delete: `frontend/components/templates/CrispTemplate.tsx`
- Delete: `frontend/components/templates/TokyoTemplate.tsx`
- Delete: `frontend/components/templates/EliteTemplate.tsx`

- [ ] **Step 1: Unify HeaderData in `types.ts`**
  Find the most comprehensive `HeaderData` definition (likely in `SectionsPDF.tsx` with ~166 fields) and move it to `frontend/lib/store/types.ts`. Remove local definitions in `SectionRenderers.tsx` and `SectionsPDF.tsx`.

- [ ] **Step 2: Remove Duplicate 'Dublin' in `index.ts`**
  Locate and delete the redundant `case 'dublin':` block in `frontend/components/templates/index.ts`.

- [ ] **Step 3: Delete Dead Templates**
  Delete the 6 template files that currently only act as wrappers for `MasterTemplate`.

- [ ] **Step 4: Update `index.ts` Imports**
  Clean up unused imports in `index.ts`.

- [ ] **Step 5: Verify Build**
  Run `cd frontend && npx tsc --noEmit` to ensure no broken imports remain.

---

### Task 2: Style & Context Consolidation

**Files:**
- Rename: `frontend/lib/pdf/pdfStyles.ts` -> `frontend/lib/pdf/styleUtils.ts`
- Modify: `frontend/lib/pdf/templateCtx.ts`
- Modify: `frontend/components/templates/MasterTemplate.tsx`
- Modify: `frontend/components/pdf/ResumePDF.tsx`

- [ ] **Step 1: Rename `pdfStyles.ts`**
  Rename the file and update all import references across the codebase.

- [ ] **Step 2: Shared Rendering Utils**
  Move `formatDateRange` and `renderMd` into a shared location (e.g., `frontend/lib/pdf/templateHelpers.ts`) so both HTML and PDF renderers use the exact same logic.

---

### Task 3: Single Icon Registry

**Files:**
- Create: `frontend/lib/icons/sectionIcons.ts`
- Modify: `frontend/components/templates/MasterTemplate.tsx`
- Modify: `frontend/components/pdf/ResumePDF.tsx`

- [ ] **Step 1: Create Icon Registry**
  Define a mapping of `SectionType` to an object containing both the Lucide icon name (for HTML) and the SVG path data (for PDF).

- [ ] **Step 2: Refactor MasterTemplate**
  Use the registry to render icons instead of hardcoded Lucide component checks.

- [ ] **Step 3: Refactor ResumePDF**
  Use the registry to render PDF SVG paths, removing the ~80 lines of hand-coded SVG data.

---

### Task 4: Documentation

**Files:**
- Create: `frontend/components/templates/ARCHITECTURE.md`

- [ ] **Step 1: Write Architecture Guide**
  Document the consolidated structure, the role of `MasterTemplate`, and the "Mirror Rule" for keeping PDF and HTML in sync.

---

### Task 5: Final Verification

- [ ] **Step 1: Visual Regression Check**
  Verify that all 12 templates still look correct in the preview and export correctly to PDF without visual regressions.
