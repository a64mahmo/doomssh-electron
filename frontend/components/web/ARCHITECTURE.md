# DoomSSH Template Architecture

This document describes the rendering architecture for resumes and cover letters.

## Core Mandate: HTML First

The HTML template is the **source of truth**:

1. **Live preview** — `components/preview/PreviewPanel.tsx` renders `MasterTemplate.tsx` directly.
2. **Desktop PDF export** — `app/print/[resumeId]/PrintClient.tsx` renders the same `MasterTemplate.tsx`, and Electron captures it with Chromium's `printToPDF`.

A second renderer, `components/pdf/ResumePDF.tsx` (`@react-pdf/renderer`), is used **only for the browser build's PDF download**. Until that path is retired, visual changes (margins, colors, font sizes, structure) made here must be mirrored there.

## Print Hooks

The print CSS in `PrintClient.tsx` targets these attributes. Keep them when restructuring markup:

| Attribute | Element | Print behaviour |
|-----------|---------|-----------------|
| `data-resume-page` | Page root (resume and cover letter) | No full-page `min-height`; padding cloned onto every page as the margin |
| `data-sidebar-panel` | Tinted sidebar background | `position: fixed`, repeats on every page |
| `data-footer-fixed` | Footer | Fixed and inset by the page margins |
| `data-section-heading` | Section heading | `break-after: avoid` |
| `data-section` | Section wrapper | The last one's final entry drops its bottom margin (prevents a blank trailing page) |
| `data-entry` | Entry (`sections/shared.tsx`) | Its head block stays with its first line |
| `data-entry-desc` | Entry description | Each line / bullet never splits |
| `data-keep` | Skills, languages, references | Printed as one block |

## File Map

### Shared Definitions
- `frontend/lib/shared/types.ts`: Single source of truth for resume data shapes (re-exported from `frontend/lib/store/types.ts`).
- `frontend/lib/pdf/templateCtx.ts`: Layout math (margins, base font sizes) shared by both renderers.
- `frontend/lib/pdf/styleUtils.ts`: Color resolution and unit conversions.
- `frontend/lib/pdf/layoutFit.ts`: Width estimates — content width, name fitting, contact-row packing.
- `frontend/lib/renderers/`: Headless section controllers producing the view models both renderers consume.
- `frontend/lib/icons/sectionIcons.ts`: Single registry for Lucide icons (HTML) and SVG paths (PDF).
- `frontend/lib/utils/text.ts`: Shared markdown-style text tokenization.

### Rendering Paths
- **HTML**: `MasterTemplate.tsx` handles the page shell, header and columns; `sections/` handles individual sections.
- **PDF (browser download)**: `ResumePDF.tsx` handles the main shell; `components/pdf/sections/` handles individual sections.

## Common Workflows

### Adding a New Template Design
1. Add the id to `TemplateId` in `frontend/lib/shared/types.ts`.
2. In `frontend/components/web/index.ts`, add an entry to `TEMPLATE_META` and a preset to `getTemplateSettings`.
3. Do **not** create a new `.tsx` file unless the layout is fundamentally different from `MasterTemplate.tsx`.

See `docs/template-customization.md` for details.

### Adding a New Section Type
1. Define the data structure in `frontend/lib/shared/types.ts`.
2. Add a controller in `frontend/lib/renderers/` that reads the field names the editor writes.
3. Add an icon to `frontend/lib/icons/sectionIcons.ts`.
4. Implement the HTML renderer in `frontend/components/web/sections/` (add `data-keep` if it must never split across pages).
5. Implement the PDF renderer in `frontend/components/pdf/sections/`.
6. Update the switch statements in both `SectionRenderer` and `SectionRendererPDF`.

### Verifying Output
- `npx vitest run tests/components/web/templateSmoke.test.tsx` — HTML renders for every preset with every section type.
- `npx tsx scripts/render-templates.tsx <dir> [--stress | --matrix | --all-sections]` — browser-download PDFs for inspection.
- Export from the desktop app to check the printed PDF.
