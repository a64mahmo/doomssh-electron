# DoomSSH Template Architecture

This document describes the rendering architecture for resumes and cover letters.

## Core Mandate: HTML First

The HTML template is the **source of truth**:

1. **Live preview** — `components/preview/PreviewPanel.tsx` renders `MasterTemplate.tsx` directly.
2. **PDF export** — `app/print/[resumeId]/PrintClient.tsx` renders the same `MasterTemplate.tsx`. Electron captures it with Chromium's `printToPDF`; the browser build prints it from a hidden iframe (`lib/utils/export.tsx`) through the print dialog.

There is no second renderer: a change here is the change to every output.

## Print Hooks

The print CSS in `PrintClient.tsx` targets these attributes. Keep them when restructuring markup:

| Attribute | Element | Print behaviour |
|-----------|---------|-----------------|
| `data-resume-page` | Page root (resume and cover letter) | No full-page `min-height`; padding cloned onto every page as the margin |
| `data-sidebar-panel` | Tinted or solid sidebar background | `position: fixed`, repeats on every page |
| `data-footer-fixed` | Footer | Fixed and inset by the page margins |
| `data-section-heading` | Section heading | `break-after: avoid` |
| `data-section` | Section wrapper | The last one's final entry drops its bottom margin (prevents a blank trailing page) |
| `data-entry` | Entry (`sections/shared.tsx`) | Its head block stays with its first line |
| `data-entry-desc` | Entry description | Each line / bullet never splits |
| `data-keep` | Skills, languages, references | Printed as one block |

## File Map

### Shared Definitions
- `frontend/lib/shared/types.ts`: Single source of truth for resume data shapes (re-exported from `frontend/lib/store/types.ts`).
- `frontend/lib/pdf/templateCtx.ts`: Template context (colours, base font sizes) and `sidebarCtx`, the light colour set for content on a solid dark sidebar.
- `frontend/lib/pdf/styleUtils.ts`: Color resolution and unit conversions.
- `frontend/lib/pdf/layoutFit.ts`: Width estimates — content width, name fitting, contact-row packing.
- `frontend/lib/renderers/`: Headless section controllers producing the view models the section components consume.
- `frontend/lib/icons/sectionIcons.ts`: Single registry for section heading icons.
- `frontend/lib/utils/text.ts`: Shared markdown-style text tokenization.

### Rendering
- `MasterTemplate.tsx` handles the page shell, header, sidebar panel and columns; `sections/` handles individual sections.

## Common Workflows

### Adding a New Template Design
1. Add the id to `TemplateId` in `frontend/lib/shared/types.ts`.
2. In `frontend/components/web/index.ts`, add an entry to `TEMPLATE_META` and a preset to `getTemplateSettings` starting from `...base(accent)`.
3. Do **not** create a new `.tsx` file unless the layout is fundamentally different from `MasterTemplate.tsx`.

See `docs/template-customization.md` for details.

### Adding a New Section Type
1. Define the data structure in `frontend/lib/shared/types.ts`.
2. Add a controller in `frontend/lib/renderers/` that reads the field names the editor writes.
3. Add an icon to `frontend/lib/icons/sectionIcons.ts`.
4. Implement the renderer in `frontend/components/web/sections/` (add `data-keep` if it must never split across pages).
5. Add it to the switch in `SectionRenderer`.

### Verifying Output
- `npx vitest run tests/components/web/templateSmoke.test.tsx` — HTML renders for every preset with every section type.
- Load `/print/new/?mode=export` (or export a PDF) to check page breaks, with and without a photo.
