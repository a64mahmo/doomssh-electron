# Template Customization Guide

DoomSSH offers deep control over every aspect of your resume's appearance. This guide explains how to adjust templates through the UI and programmatically.

## Settings Reference

All customizable settings are defined in `frontend/lib/store/types.ts` under the `ResumeSettings` interface.

### Typography

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `fontFamily` | `string` | `"Merriweather"` | Google Font family name |
| `fontSize` | `number` | `10` | Base body text size in points |
| `nameSize` | `NameSize` | `"M"` | Candidate name scale: S / M / L / XL |
| `sectionHeadingSize` | `HeadingSize` | `"S"` | Section title scale: S / M / L / XL |
| `sectionHeadingCapitalization` | `Capitalization` | `"uppercase"` | Text transform: uppercase / capitalize / none |
| `lineHeight` | `number` | `1.4` | Unitless line-height multiplier |
| `letterSpacing` | `LetterSpacing` | `"normal"` | Horizontal spacing: tight / normal / wide |

### Colors

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `accentColor` | `string` | `"#0f766e"` | Primary brand color (links, headings, decorations) |
| `colorMode` | `ColorMode` | `"basic"` | Basic (single color) or advanced (full palette) |
| `headingColor` | `string` | `"#0f766e"` | Section heading color (advanced mode) |
| `textColor` | `string` | `"#1e293b"` | Body text color (advanced mode) |
| `backgroundColor` | `string` | `"#ffffff"` | Page background (advanced mode) |

### Layout

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `paperSize` | `PaperSize` | `"letter"` | Paper format: letter / a4 |
| `marginHorizontal` | `number` | `20` | Left/right margins in mm |
| `marginVertical` | `number` | `15` | Top/bottom margins in mm |
| `columnLayout` | `ColumnLayout` | `"two"` | One column, two columns, or mix |
| `columnWidth` | `number` | `32` | Sidebar width as percentage |
| `columnReverse` | `boolean` | `false` | Swap sidebar to left side |
| `entrySpacing` | `number` | `1.0` | Vertical scale factor between entries |

### Section Display

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `showSectionLabels` | `boolean` | `true` | Toggle section headings on/off |
| `sectionHeadingStyle` | `HeadingStyle` | `"underline"` | Decoration: underline / overline / top-bottom / box / background / left-bar |
| `sectionHeadingIcon` | `SectionHeadingIcon` | `"none"` | Icon: none / outline / filled / knockout |
| `sectionHeadingIconSize` | `number` | `1.0` | Icon scale multiplier |
| `experienceOrder` | `ExperienceOrder` | `"position-employer"` | Title→Company or Company→Title |
| `educationOrder` | `EducationOrder` | `"school-degree"` | School→Degree or Degree→School |
| `skillDisplay` | `SkillDisplay` | `"grid"` | Compact / grid / level / bubble |
| `skillColumns` | `number` | `3` | Number of columns in grid view |

### Date Formatting

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `dateFormat` | `string` | `"MMM YYYY"` | Moment.js-compatible date format |

## Built-in Templates

Every template is a **settings preset** applied on top of the resume's current settings; nothing about a template is a separate component. All presets render through `MasterTemplate.tsx` (preview and desktop export).

| Template | Structure | Photo |
|----------|-----------|-------|
| Modern | Two columns, right sidebar with divider | Beside the name, L circle |
| Classic | Centred black serif, hairline rules | Above the name, M circle |
| Minimal | Light name, no heading rules, stacked entries | Beside, square, top-aligned |
| Crisp | Name left, contact details stacked on the right, bar headings | Beside, rounded |
| Tokyo | Red header band, icon headings, skill pills | Above the name, L with white border |
| Elite | Framed page, right-aligned serif header | Right of the name, L square |
| Blocks | Solid blue sidebar on the right, white pills | Beside, L rounded |
| Dublin | Dark navy sidebar with name, as-typed title and icon contacts; centred box headings | Below the name in the sidebar, XL circle |
| London | Warm paper, editorial serif, double rules | Above the name, L with accent border |
| Berlin | Black sidebar on the right with yellow highlights | In the sidebar, XL square |
| Oslo | Warm tinted sidebar, skill pills | Beside, L with border |
| Zurich | Boxed headings, contact grid, rated skills | Beside, square |
| Milano | Italic job title beside the name, summary and skills in a left column, icon headings | Beside, XL circle |
| Seoul | Lavender sidebar on the left, details beside the name, skills grid | Beside, S rounded |
| Aspen | Soft green sidebar with photo, name and details | Above the name in the sidebar, XL |
| Vega | Dense single column | Beside, S rounded |
| Lumen | Spacious and centred | Above the name, XL with border |
| Atlas | Navy header band over two columns | Beside, in the band |
| Sierra | Warm left sidebar, knockout icons, big name | Beside, L rounded |
| Nova | Executive serif, portrait and name centred together | Beside, centred group |
| Custom | Your own settings | — |

Every preset starts from `base(accent)`, which resets every layout setting — colours, columns, sidebar fill, header and photo placement, headings, entries — so nothing from the previous template leaks into the next. Photo on/off is left alone except in photo-led presets (Aspen, Dublin, Berlin, Lumen, Atlas), which turn it on; with no uploaded photo nothing is drawn.

## Creating Custom Templates

### Step 1: Add the template id

Add the id to the `TemplateId` union in `frontend/lib/shared/types.ts` (re-exported from `frontend/lib/store/types.ts`):

```typescript
export type TemplateId =
  | 'modern'
  // ...
  | 'my-template' // ← add before 'custom'
  | 'custom'
```

### Step 2: Describe it and define the preset

In `frontend/components/web/index.ts`:

1. Add a label and description to `TEMPLATE_META` — the Templates panel lists every entry automatically.
2. Add a `case` to `getTemplateSettings` returning the settings to apply. Start from `...base(accent)` and override only what makes the template different.

```typescript
case 'my-template':
  return {
    ...base('#0f766e'),
    columnLayout: 'two',
    sectionHeadingStyle: 'left-bar',
    skillDisplay: 'bubble',
    fontFamily: 'Lato',
    fontSize: 10,
    marginHorizontal: 18,
    marginVertical: 14,
    // ...
  }
```

Prefer varying structural settings so the template changes the page's structure, not only its colour and font:

| Setting | Values | Effect |
|---------|--------|--------|
| `sidebarTheme` + `sidebarFill` | `accent` / `custom` (+ `sidebarBackgroundColor`); `tint` / `solid` | Tinted or solid sidebar panel. On a dark solid panel, text, headings and accent details turn light. |
| `headerLayout` | `top` / `sidebar` | Name, photo and details across the top or at the top of the sidebar |
| `themeColorStyle` | `basic` / `advanced` / `border` | Plain, full-bleed header band, or framed page |
| `detailsPosition` | `below` / `beside` | Contact details under the name or in a column beside it |
| `photoPosition` | `beside` / `top` / `bottom` | Beside the name, above it, or below it (in the sidebar: under the job title) |
| `jobTitleStyle` / `jobTitlePlacement` | `caps` / `normal` / `italic`; `below` / `inline` | Small caps under the name, or as typed / italic on the name's line |
| `sectionHeadingStyle` / `sectionHeadingAlign` | `underline` … `left-bar`; `left` / `center` | Heading decoration and position |
| `sidebarSectionTypes` | e.g. `['summary', 'skills']` | Which section types go in the sidebar (sections the user drags still win) |
| `columnDivider` | `true` / `false` | Hairline between the columns |
| `entryLayout`, `skillDisplay`, `subtitlePlacement` | see types | Entry and skill structure |

A new option needs a default in `base()` so other presets reset it.

### Step 3: Check the thumbnail

`TemplateVisual` in `frontend/components/customize/CustomizePrimitives.tsx` draws each card from the preset's settings (columns, header band, page border, tinted or solid sidebar, header in sidebar, details beside the name, photo, skill pills). No per-template work is needed unless your preset introduces a new visual trait.

### Step 4: Verify the output

```bash
cd frontend
npx vitest run tests/components/web/templateSmoke.test.tsx      # HTML renders for every preset
```

Export a PDF (desktop app, or Save as PDF in the browser) to confirm the printed output: no blank trailing page, margins intact, and try it with a photo.

## Headless Controller Reference

Section business logic lives in `frontend/lib/renderers/`. Each controller receives raw section data and a `RenderContext`, and returns a `SectionViewModel`.

### ViewModel Shape

```typescript
interface SectionViewModel {
  title: string;       // Section heading text
  isVisible: boolean;  // Whether to render at all
  type: SectionType;   // Section type identifier
  items: any[];        // Processed items ready for rendering
  meta?: Record<string, any>; // Optional metadata
}
```

### Common Patterns

**Ordering:**
```typescript
const isEmployerFirst = settings.experienceOrder === 'employer-title';
primaryText: isEmployerFirst ? item.company : item.position,
secondaryText: isEmployerFirst ? item.position : item.company,
```

**Visibility:**
```typescript
isVisible: section.visible !== false && processedItems.length > 0,
```

**Date Formatting:**
```typescript
dateRange: helpers.formatDate(item.startDate, item.endDate, item.present, s.dateFormat || 'YYYY'),
```
