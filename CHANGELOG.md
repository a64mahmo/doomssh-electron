# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-04-14

### Added

- **Extended Distribution Targets** - Added portable targets for Windows and Linux, and NSIS for macOS (arm64) to improve installation reliability.
- **Detailed Update Logging** - Integrated deep error reporting for the auto-updater, accessible via Bug Mode in Settings.
- **Job Tracker UX Improvements** - Added keyboard support for drag-and-drop, increased activation distance, and enhanced visual feedback (column highlights and scale effects).

### Changed

- **Performance Tuning** - Reduced debounce timings for inputs (300ms) and PDF regeneration (500ms) to improve perceived responsiveness.
- **Static Asset Optimization** - Implemented caching headers and in-memory file caching for the `app://` protocol in Electron.
- **Layout Controls** - Simplified column layout options and replaced the sidebar position toggle with a a clear Left/Right selector.
- **Persistence Manager** - Implemented save rate limiting (max 1 save per second) to reduce IPC overhead.
- **Dashboard Performance** - Isolated `ResumeCard` re-renders to prevent full list flashes when updating a single resume.

### Fixed

- **macOS App Integrity** - Fixed "damaged app" error by enabling Hardened Runtime and adjusting Gatekeeper assessment.
- **macOS Auto-Updates** - Added ZIP target support to ensure compatibility with `electron-updater`.
- **UI Polish (ColorsSection)** - Fixed cut-off color pickers and added proper color filling for text color previews.
- **State Management** - Fixed "controlled vs uncontrolled" warning in `ToggleRow` component.
- **TypeScript Errors** - Fixed missing imports and type mismatches in `ExperienceSection` and `AwardsSection`.
- **Two-Column DND** - Fixed section placement logic between columns in the customize panel.

## [1.1.0] - 2026-04-13

### Added

- **ZIP Distribution for macOS** - Added ZIP target to electron-builder config for proper auto-updates
  - `package.json` - Added `zip` target alongside `dmg` for mac builds

### Changed

- **DebouncedInput** - Simplified props interface for better type safety
  - `frontend/components/ui/debounced-input.tsx` - Removed `React.ComponentProps` extension
  - Now explicitly defines `value`, `onChange`, `debounceTime`, `className`, `placeholder`
- **Debounce Timings** - Reduced for faster load times
  - Input debounce: 500ms → 300ms
  - PDF render debounce: 800ms → 500ms
- **Persistence Manager** - Added save rate limiting
  - `frontend/lib/store/persistenceManager.ts` - Max 1 save per second to prevent overwhelming IPC

### Fixed

- **ExperienceSection Missing Imports** - Fixed TypeScript errors
  - Added `LucideIcon` type import from lucide-react
  - Added `ExperienceItem` type import from store/types
  - Added `generateId` from lib/utils/ids
  - Added `MonthYearPicker` component import
  - Added `Building2` and `Sparkles` icon imports
- **Two-Column Drag & Drop** - Fixed section placement between columns
  - `frontend/components/customize/CustomizePrimitives.tsx` - Added `useDroppable` from @dnd-kit/core
  - Columns now highlight when dragging over them
- **PreviewPanel Early Render** - Guard against rendering before resume is ready
  - Added check for `resume?.sections?.length` before PDF generation

### Performance

- **ResumeCard Extraction** - Isolated re-renders on dashboard
  - Extracted to separate component to prevent full list re-renders
  - Removed staggered animation delay from card list

## [1.0.3] - 2026-04-13

### Added

- **Debounced Input Components** - Performance optimization for editor fields
  - `frontend/components/ui/debounced-input.tsx` - Debounced wrapper for Input
  - `frontend/components/ui/debounced-rich-text-area.tsx` - Debounced wrapper for RichTextArea
  - Applied to all editor sections (Experience, Education, Projects, Summary, etc.)
  - 500ms debounce delay prevents excessive state updates during typing

- **Performance Tests** - Visual and load testing suite
  - `tests/performance/render-speed.spec.ts` - Page load and template switching benchmarks
  - `tests/performance/load-test.spec.ts` - Large resume rendering performance

### Changed

- **PreviewPanel** - Increased debounce from 400ms to 800ms for PDF regeneration
- **Editor Sections** - Replaced direct Input/RichTextArea with debounced versions

### Fixed

- **SkillsSection crash** - Fixed null reference when `name` was undefined in `addSkill()`
- **SkillsSection test** - Test failure due to `asChild` prop incompatibility

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
