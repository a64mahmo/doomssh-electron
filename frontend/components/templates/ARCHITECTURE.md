# DoomSSH Template Architecture

This document describes the consolidated rendering architecture for resumes.

## Core Mandate: The Mirror Rule
DoomSSH has two independent rendering paths that **must** remain visually identical:
1. **HTML Preview**: `MasterTemplate.tsx` + `SectionRenderers.tsx` (using Tailwind CSS)
2. **PDF Export**: `ResumePDF.tsx` + `SectionsPDF.tsx` (using `@react-pdf/renderer`)

**Any visual change (margins, colors, font sizes) made to one path MUST be manually replicated in the other.**

## File Map

### Shared Definitions
- `frontend/lib/store/types.ts`: Single source of truth for resume data shapes (including `HeaderData`).
- `frontend/lib/pdf/templateCtx.ts`: Calculates layout math (margins, base font sizes) shared by both renderers.
- `frontend/lib/pdf/styleUtils.ts`: Shared color resolution and unit conversions.
- `frontend/lib/icons/sectionIcons.ts`: Single registry for Lucide icons (HTML) and SVG paths (PDF).
- `frontend/lib/utils/text.ts`: Shared markdown-style text tokenization.

### Rendering Paths
- **HTML**: `MasterTemplate.tsx` handles the main shell; `SectionRenderers.tsx` handles individual section items.
- **PDF**: `ResumePDF.tsx` handles the main shell; `SectionsPDF.tsx` handles individual section items.

## Common Workflows

### Adding a New Template Design
1. Open `frontend/components/templates/index.ts`.
2. Add a new preset to `getTemplateSettings`.
3. Do **not** create a new `.tsx` file unless the layout is fundamentally different from `MasterTemplate.tsx`.

### Adding a New Section Type
1. Define the data structure in `frontend/lib/store/types.ts`.
2. Add an icon to `frontend/lib/icons/sectionIcons.ts`.
3. Implement the HTML renderer in `frontend/components/templates/SectionRenderers.tsx`.
4. Implement the PDF renderer in `frontend/components/pdf/SectionsPDF.tsx`.
5. Update the switch statements in both `SectionRenderer` and `SectionRendererPDF`.
