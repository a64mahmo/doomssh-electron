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

| Template | Style |
|----------|-------|
| Modern | Two columns, clean lines, balanced accents |
| Classic | Single column, serif, full-bleed header band |
| Minimal | Single column, maximum whitespace |
| Crisp | Mixed grid with vertical accent bars |
| Tokyo | Bold, icon-heavy, strong sidebar |
| Elite | Executive serif with a page border |
| Blocks | Background-block headings |
| Dublin | Reversed sidebar |
| London | Serif single column with header band |
| Berlin | Knockout icons, high contrast |
| Oslo | Tinted sidebar, skill pills |
| Zurich | Boxed headings, contact grid, rated skills |
| Milano | Editorial mixed layout, dates on the left |
| Seoul | Compact reversed sidebar, contact block beside the name |
| Aspen | Photo, name and contact details in a tinted sidebar |
| Vega | Compact one-pager for long histories |
| Lumen | Spacious, centred — for first-job resumes |
| Atlas | Full-bleed colour header band, two columns |
| Sierra | Creative mixed grid, knockout icons, pills |
| Nova | Executive serif, hairline rules, levelled skills |
| Custom | Your own settings |

Switching templates resets colours and the layout choices a preset makes that others don't mention (`headerLayout`, `sidebarTheme`), so a sidebar header from one preset doesn't leak into the next.

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
2. Add a `case` to `getTemplateSettings` returning the settings to apply. Start from `...colorReset(accent)` and set every `applyAccent*` flag explicitly.

```typescript
case 'my-template':
  return {
    ...colorReset('#0f766e'),
    themeColorStyle: 'basic',
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

Prefer varying structural settings (`skillDisplay`, `entryLayout`, `detailsArrangement`, `sidebarTheme`, `headerLayout`) so the template changes the page's structure, not only its colour and font.

### Step 3: Check the thumbnail

`TemplateVisual` in `frontend/components/customize/CustomizePrimitives.tsx` draws each card from the preset's settings (columns, header band, sidebar tint, header in sidebar, photo, skill pills). No per-template work is needed unless your preset introduces a new visual trait.

### Step 4: Verify the output

```bash
cd frontend
npx vitest run tests/components/web/templateSmoke.test.tsx      # HTML renders for every preset
npx tsx scripts/render-templates.tsx /tmp/renders --stress       # web-download PDFs with long content
```

Export from the desktop app to confirm the printed PDF (no blank trailing page, margins intact).

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
