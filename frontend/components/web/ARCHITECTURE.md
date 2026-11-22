# DoomSSH Template Architecture

This document describes the rendering architecture for resumes and cover letters.

## Core Mandate: HTML First

The HTML template is the **source of truth**:

1. **Live preview** — `components/preview/PreviewPanel.tsx` renders `PagedResume.tsx`.
2. **PDF export** — `app/print/[resumeId]/PrintClient.tsx` renders the same `PagedResume.tsx`. Electron captures it with Chromium's `printToPDF`; the browser build prints it from a hidden iframe (`lib/utils/export.tsx`) through the print dialog.

There is no second renderer: a change here is the change to every output.

## Pages

`PagedResume` lays `MasterTemplate` out once, hidden, as one continuous flow, and `lib/pdf/paginate.ts` picks where each page ends. Every page is a frame of exact paper size (`contain: strict`, one sheet each) that paints its own background, sidebar panel, border and numbered footer, and shows its slice of the flow through a clipped window inset by the page margins. So every page has its margin on all four sides. Breaks are measured where the pages are rendered: desktop export uses an offscreen window at device scale 1 so the measurement matches print; the preview, at the screen's scale, can occasionally break one line differently on a Retina display.

Breaks never cut a line of text or an image. These attributes add keep-together rules on top (dropped only when a block is taller than a page). Keep them when restructuring markup:

| Attribute | Element | Rule |
|-----------|---------|------|
| `data-resume-page` | Flow root (resume and cover letter) | Its padding and border are the page margins |
| `data-header` | Header | Kept whole |
| `data-section` / `data-section-heading` | Section / its heading | The heading stays with the first line or block below it |
| `data-entry` | Entry (`sections/shared.tsx`) | Its head stays with its first description line |
| `data-entry-desc` | Entry description | Each line / bullet kept whole |
| `data-keep` | Skills, languages, references | Kept whole |

With a sidebar, the two columns (`data-column="main"` / `"sidebar"`) are paginated separately: each breaks where it suits and continues on the next page from there, and each page shows them through one window per column. The header never spans both columns: it heads one of them (`resolveHeaderPlacement`; the Customize panel offers Left / Right), so both columns, the sidebar panel and the divider run the full height of every page.

`MasterTemplate`'s `paged` prop renders the flow without page height, fill, sidebar panel, divider colour, border or footer; `getPageChrome` gives the frames those, and the frames draw the divider from the top margin to the footer on every page.

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
- `npx vitest run tests/lib/pdf/paginate.test.ts` — break selection.
- Export a PDF (or load `/print/new/?mode=export`) to check page breaks, with and without a photo.
