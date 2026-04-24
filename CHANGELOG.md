# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2026-04-23

### Added

- **Cover Letter Builder Redesign** — Completely overhauled the editing experience with a focus on modularity and AI-first workflows.
  - **Card-Based Workshop** — Replaced the monolithic editor panel with a structured, multi-card layout (`TargetJobCard`, `LetterheadCard`, `RecipientCard`, `EditorCard`, `SignatureCard`).
  - **Magic AI Draft** — New prominent AI drafting interface that activates when the letter is empty, using job and profile context.
  - **Smart Sync Indicators** — Enhanced visual cues for synced data, including lock icons and distinct background shifts for auto-filled fields.
  - **Refined Assistant UI** — Moved AI actions into a dedicated "AI Assistant" toolbar for easier access to generation, improvement, and tone-shifting tools.
  - **Improved Input Feedback** — Added specialized formatting and layout for date, recipient, and signature fields to improve clarity.
- **Visual Signature Engine** — Integrated support for uploading and scaling handwritten signature images (PNG/JPEG/WEBP) with perfect parity between web preview and PDF export.

### Fixed

- **Nested Button Error** — Resolved a React hydration error where `<button>` tags were nested inside the AI Assistant dropdown trigger.
- **Signature Accent Color** — Fixed a bug where the signature divider line didn't respect the chosen accent color.
- **Dropdown UUID Glitch** — Ensured that sync dropdowns correctly display document/job names instead of raw IDs during load states.
- **Web Preview Parity** — Implemented a dedicated DOM-based cover letter renderer to ensure "Body" customization settings (alignment, spacing, indent) are reflected in real-time.
- **Local Font Bundling** — Downloaded and bundled all 9 professional font families locally for 100% offline support and improved privacy. Replaced Google Fonts and remote CDNs with local `.woff` files.

## [1.6.0] - 2026-04-19
### Added

- **Unified Builder Experience** — A new, collapsible global sidebar providing instant access to all core modules (Resumes, Cover Letters, Job Tracker, and Interview Prep).
- **Redesigned Cover Letter Suite** — Significant overhaul of the cover letter authoring experience.
  - **Modern Editor** — Vertically scrollable, multi-section form with real-time word/character counters.
  - **High-Fidelity PDF Preview** — Cover letters now use the same high-precision `@react-pdf` engine as resumes for 100% export parity.
  - **Letterhead Sync** — Optional "Sync with Resume" toggle to automatically mirror contact details from your primary resume.
  - **Advanced Layout Options** — Deep customization for date and signature positioning (Left/Right) and signature line visibility.
- **Fixed-Viewport Architecture** — Switched to a professional "desktop-app" layout where the main interface is fixed to the window height, with independent scrolling for navigation, editing, and preview panels.
- **New Regression Test Suite** — Automated Playwright tests for sidebar state, viewport integrity, and cross-page navigation.

### Changed

- **Consolidated PDF Engine** — Extracted shared rendering logic into a unified `HeaderRendererPDF` component, ensuring resumes and cover letters share identical branding, photo handling, and theme support.
- **Theme Support for Cover Letters** — Cover letters now fully support "Advanced" (Banner) and "Border" theme color styles.
- **Customization Panel Logic** — Filtered the Customize Panel to show only relevant sections when editing different document types.

### Fixed

- **macOS Navigation Overlap** — Resolved issue where macOS window controls overlapped with the sidebar toggle when collapsed.
- **Global Scrollbar Bug** — Fixed a layout issue where the entire window could scroll, breaking the anchored header feel.
- **Runtime Error in Customization** — Fixed "o.render is not a function" crash in the Header settings panel.
- **Alignment Discrepancies** — Fixed a weird indentation in the PDF name renderer caused by negative letter spacing.

## [1.5.0] - 2026-04-15

### Added

- **Interview Prep Suite** — Full interview preparation feature integrated into the Job Tracker.
  - **AI Mock Interviewer** — Generates 8 role-specific interview questions (technical, behavioral, situational) using the job's title, company, and description as context via the existing Anthropic Claude integration.
  - **STAR Method Builder** — Structured answer editor for behavioral questions with Situation, Task, Action, Result fields.
  - **Company Research Vault** — Free-form notes area for storing company facts, values, culture, and interviewer backgrounds.
  - **Cheat Sheet** — Numbered, inline-editable list of quick talking points for at-a-glance reference during remote interviews.
  - **Post-Interview Reflections** — Structured form for logging what went well, what was difficult, and follow-up tasks after each interview round.
  - **Dedicated full page** (`/builder/interview-prep`) with job selector sidebar and section tabs.
  - **Dialog tab** — Interview Prep tab added to the Job Detail Dialog alongside Details, Contacts, and Timeline.
- **API Key Guard for AI features** — `useAI` hook now exposes `hasApiKey` state. AI buttons are disabled with a tooltip when no API key is configured.
- **Error toast colors** — Added `--destructive-foreground` CSS variable for both light and dark themes. Wired Sonner error toast to use theme-aware `--error-bg`, `--error-text`, `--error-border` variables.
- **Design documentation** — `docs/interview-prep.md` covering architecture, data model, AI integration, and UI layout.

### Changed

- **Kanban drag-and-drop performance** — Replaced `useSortable` with `useDraggable` on cards (lighter, unidirectional). Removed `SortableContext` wrapper and `KeyboardSensor`. Switched collision detection from `closestCorners` to `closestCenter`. Cards are now fully draggable (no hidden grip handle).
- **Kanban cursor behavior** — Hover shows pointer cursor, hold/drag shows grabbing hand.
- **Text selection** — Disabled (`select-none`) on Job Tracker page, Interview Prep page, and Job Detail Dialog to prevent accidental selection during drag and click interactions.
- **AI error logging** — Empty error messages now fall back to a descriptive message. Added `console.error('[AI]', msg)` for proper logging.

### Fixed

- **Error toast invisible in light mode** — Error notifications had white text on light backgrounds. Fixed by defining proper error color CSS variables for Sonner.
- **Tooltip not appearing on disabled AI button** — Disabled buttons swallow pointer events. Wrapped with a `<span>` trigger so hover events fire on the tooltip.

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
