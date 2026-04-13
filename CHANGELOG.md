# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-04-12

### Added

- **Enhanced Photo Settings** - Comprehensive photo positioning and styling controls
  - New `PhotoSize` options: XS, S, M, L, XL (previously only S and M)
  - New `PhotoShape` options: circle, rounded, square (previously only circle and rounded)
  - New `PhotoAlignment` control: left, center, right for horizontal positioning
  - New `PhotoVerticalAlign` control: top, center, bottom for vertical alignment
  - New `PhotoBorderStyle` control: none, thin, medium, thick
  - New `PhotoBorderColor` setting for custom border colors
  - New `PhotoGap` slider (0-32pt) for controlling space between photo and text
  - Updated HeaderSection UI with all new controls
  - Updated MasterTemplate and ResumePDF to apply new settings
  - Added 21 new tests for photo settings (`frontend/lib/store/photoSettings.test.ts`)

- **Comprehensive Persistence Tests** - Full coverage for save behavior
  - `frontend/lib/store/resumeStore.test.ts` - 29 tests for store state transitions
  - `frontend/lib/store/persistence.test.ts` - 14 tests for persistence behavior

### Changed

- **TemplatesSection** - `frontend/components/customize/sections/TemplatesSection.tsx`
  - Complete UI rewrite with cleaner card-based design
  - Better hover/active states and transitions
- **CustomizePanel** - Removed `asChild` prop from TooltipTrigger (base-ui doesn't support it)
- **Headless Rendering Architecture** - Unified Web and PDF renderers via `SectionViewModel` and `SectionController` interfaces
- **Persistence Manager** - Added `subscribeWithSelector` middleware for proper Zustand subscriptions

### Fixed

- **Persistence not saving** - Template and text changes now persist correctly
  - Added `subscribeWithSelector` middleware to Zustand store
  - Fixed `setResume` to mark dirty on template changes (unless loading from storage)
  - Updated `BuilderClient.tsx` to pass `isLoaded=true` when loading resumes
- **TemplatesSection asChild prop error** - Removed `asChild` from TooltipTrigger
- **CustomizePanel parsing errors** - Fixed missing/misplaced closing braces
- **Duplicate code in CustomizePanel** - Removed duplicate code block
- **Removed mono template** - Cleaned up unused template from types and settings
- Null-safe guards added to all section controllers (`ctx.settings || {} as any`)

### Removed

- **mono template** - Removed from TemplateId type, TEMPLATE_META, and getTemplateSettings

## [0.3.0] - 2026-04-12

### Added

- **Headless Rendering Architecture** - Unified Web and PDF renderers via `SectionViewModel` and `SectionController` interfaces
  - `frontend/lib/renderers/types.ts` - Core interfaces for headless rendering
  - `frontend/lib/renderers/experience.ts` - Experience section controller
  - `frontend/lib/renderers/index.ts` - All section controllers registry (education, skills, projects, certifications, awards, volunteering, publications, references, custom)
  - All Web section components refactored to use `getSectionViewModel`
  - All PDF section components refactored to use `getSectionViewModel`

- **Persistence Manager** - Decoupled persistence from Zustand store
  - `frontend/lib/store/persistenceManager.ts` - Subscription-based debounced saves
  - `frontend/components/PersistenceProvider.tsx` - React initialization component
  - `frontend/app/layout.tsx` - Wired PersistenceProvider into app layout
  - `frontend/lib/store/resumeStore.ts` - Removed `scheduleSave`, now pure Zustand state

- **Documentation**
  - `docs/architecture.md` - Headless rendering pipeline, persistence manager, architecture diagrams
  - `docs/template-customization.md` - Settings reference, custom template guide, controller patterns
  - `README.md` - Complete rewrite with architecture, project structure, and template customization guide

- **Tests**
  - `frontend/lib/store/resumePersistence.test.ts` - Rewritten with mocked persistenceManager
  - `frontend/lib/renderers/experience.test.ts` - Controller unit tests

### Changed

- **Electron** - `electron/main.ts` - Default vault path now falls back to `userData/vault/`
- **CustomizePanel** - `frontend/components/customize/CustomizePanel.tsx`
  - Added tooltips to nav icons with descriptions
  - Fixed nested button issue by using div with `role="button"`
- **BuilderClient** - `frontend/app/builder/[resumeId]/BuilderClient.tsx`
  - `DEFAULT_W` set to `MAX_W` (560) - panel opens at max width

### Fixed

- Missing closing braces on conditional expressions in CustomizePanel
- Duplicate code block after component in CustomizePanel
- Nested `<button>` inside `<button>` violation in CustomizePanel nav
- Null-safe guards added to all section controllers (`ctx.settings || {} as any`)

## [0.2.1] - 2026-04-12

### Fixed

- Resizable panel opens at max width on load
- Template selector UI improved
