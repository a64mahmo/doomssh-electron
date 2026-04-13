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

## Creating Custom Templates

### Step 1: Define the Settings

Edit `frontend/lib/store/types.ts`. Add a new entry to the `Template` type union:

```typescript
export type Template =
  | 'modern'
  | 'minimal'
  | 'classic'
  | 'custom'
  | 'crisp'
  | 'my-template' // ← Add your template name here
```

### Step 2: Create a Controller Preset (Optional)

If your template has custom display logic (e.g., a unique ordering rule), add it to the headless controller registry in `frontend/lib/renderers/index.ts`:

```typescript
mySection: (section, ctx) => {
  const items = (section.items as MyItem[]) || [];
  const s = ctx.settings as any || {};

  return {
    title: section.title,
    isVisible: section.visible !== false,
    type: 'mySection',
    items: items.map(item => ({
      ...item,
      primaryText: /* custom logic */,
    })),
  };
},
```

### Step 3: Register the Template in the UI

Edit `frontend/components/customize/sections/TemplatesSection.tsx` to add your template as a selectable option in the Customize Panel.

### Step 4: Apply via Code

```typescript
import { useResumeStore } from '@/lib/store/resumeStore';

// Switch to a preset template
useResumeStore.getState().updateSettings({
  template: 'my-template',
  accentColor: '#dc2626',
  fontFamily: 'Playfair Display',
  columnLayout: 'one',
});
```

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
