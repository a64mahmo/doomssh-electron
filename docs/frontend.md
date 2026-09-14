# Frontend Documentation

The DoomSSH frontend is a sophisticated Next.js application designed for real-time document editing and high-fidelity rendering.

## Core Technologies

-   **Next.js 16 (App Router):** Provides routing, server-side rendering, and optimized builds.
-   **Zustand & Immer:** Manage the complex, nested state of a resume with immutable update patterns.
-   **Tailwind CSS 4:** Modern, utility-first styling for a sleek and responsive UI.
-   **Framer Motion:** Smooth transitions between editor panels and templates.
-   **@dnd-kit:** Powerful drag-and-drop functionality for reordering resume sections and list items.
-   **Dexie.js:** IndexedDB wrapper used for storage in the web build (the desktop app uses the vault).

## Navigation and Viewport Layout

DoomSSH uses a "Fixed-Viewport" architecture to provide a stable, professional desktop experience.

### Global Sidebar
The `Sidebar` (`frontend/components/Sidebar.tsx`) is the primary navigation hub. It is:
- **Collapsible:** Saves horizontal space for editing.
- **Animated:** Uses `framer-motion` for smooth width transitions.
- **Context-Aware:** Highlights the active route and provides tooltips when collapsed.
- **Shared Settings:** Integrates the global settings dialog and theme switcher. The dialog depends on the build: the desktop app shows Software Update, the Anthropic API key and Bug Mode; the web build shows only a note that data is stored in this browser.

### Fixed Layout Architecture
The root builder layout (`frontend/app/builder/layout.tsx`) implements a `h-screen overflow-hidden` container. This prevents the browser's default global scrolling, ensuring that the sidebar and top headers remain anchored. Scrolling is localized to individual panels (Editor, Preview, etc.).

## Modular Component Architecture

The frontend is organized into highly modularized directories to manage the complexity of dual rendering and deep customization.

### Customization Panel
The design and styling logic is decoupled into `frontend/components/customize/sections/`. Each customization category (e.g., Typography, Colors, Layout) is an isolated component, coordinated by a main `CustomizePanel` shell. Common UI patterns are abstracted into `CustomizePrimitives.tsx`.

### Renderer Paths
-   **Web Path (source of truth):** `frontend/components/web/`. Contains `MasterTemplate.tsx` and modular section renderers in `sections/`. It powers the live preview and, through the `/print` page, the desktop app's PDF export (Chromium `printToPDF`). Elements carry `data-*` hooks (`data-resume-page`, `data-sidebar-panel`, `data-section-heading`, `data-entry`, `data-entry-desc`, `data-keep`) that the print CSS uses for page breaks — keep them when restructuring markup.
-   **PDF Path:** `frontend/components/pdf/`. Mirrors the web path with `@react-pdf/renderer` primitives and is used only for the web build's PDF download. Utilizes shared components like `HeaderRendererPDF` and `ContactLinePDF`. Visual changes to the web path must still be mirrored here while the web download depends on it.
-   **Shared layout math:** `frontend/lib/pdf/layoutFit.ts` (content width, name fitting, contact-row packing) and `frontend/lib/pdf/styleUtils.ts` are used by both paths.

## State Management

The `resumeStore` is the heart of the frontend. It maintains the `Resume` object, which includes:
-   `sections`: An array of `ResumeSection` objects (Experience, Education, etc.).
-   `settings`: Visual preferences (colors, fonts, margins).

### Update Flow
1.  User interacts with a UI component (e.g., editing a job description).
2.  A Zustand action is dispatched.
3.  Immer handles the immutable update to the store.
4.  The `PreviewPanel` re-renders the HTML template immediately.
5.  The persistence manager saves the change 500 ms after edits pause — to the vault (desktop) or IndexedDB (web).

## Component Architecture

-   **Builder Page (`/app/builder/[id]`):** The main workspace, split into:
    -   `EditorPanel`: Left side. Contains input fields for each resume section. Features a simplified sidebar with square selection backgrounds and interactive **tooltips** powered by `@base-ui/react`.
    -   `PreviewPanel`: Right side. Renders the resume as live HTML with zoom, fullscreen and approximate dashed page guides. **Export** calls `downloadResumePDF`.
    -   `CustomizePanel`: Sidebar for adjusting fonts, colors, and layout settings. Also utilizes the standardized tooltip-enabled sidebar.
    -   `AIPanel`: Interactive assistant for generating and improving content.

## Form Validation & Robustness

To ensure data integrity and a smooth user experience, DoomSSH implements strict validation patterns:
-   **Image Uploads:** Profile photos are restricted to **JPEG, PNG, and WEBP** formats. The system manually validates the MIME type and provides immediate feedback via `sonner` toasts if unsupported formats (like HEIC) are selected, preventing Base64 rendering failures.
-   **TypeScript Enforcement:** The application maintains zero `any` types in critical paths. All drag-and-drop interactions (`dnd-kit`) and complex form components (like the `MonthYearPicker`) are strictly typed to prevent runtime errors.

## Platform Detection

Use `frontend/lib/platform.ts` to branch between the desktop and web builds:

```typescript
import { isElectron, isWeb } from '@/lib/platform'

if (isElectron()) {
  // desktop-only UI: updates, API key, Bug Mode
}
```

The value comes from `NEXT_PUBLIC_APP_PLATFORM` at build time (`web` on Cloudflare, `electron` for the desktop build); unset, it is detected from `window.electron`. See [Deployment](./deployment.md).

## Resume Templates

Templates are **setting presets**, not separate components: every template renders through `MasterTemplate.tsx`. Presets are defined in `frontend/components/web/index.ts` (`TEMPLATE_META` and `getTemplateSettings`); see the [Template Customization Guide](./template-customization.md#creating-custom-templates). Because the web build's PDF download still uses `components/pdf/`, visual changes to the template must be mirrored there.

### Visual Standards
-   **Unified Headings:** Section headings (font size, margins, and spacing) are unified across both main and sidebar columns to ensure a balanced, professional layout.
-   **Icon Rendering:** Section icons maintain their stroke (outline) definition across all modes. In "Filled" mode, the system uses a "reverse fill" or **etched** look, where the icon is solid-filled with the primary color but highlights its internal details using the background color.

## Job Tracker Design

The Job Tracker is a specialized module for managing the application lifecycle. It follows the same high-fidelity design standards as the resume builder but introduces specific patterns for data safety and audit logging.

### Staged Creation Flow
To prevent clutter and accidental data entry, the Job Tracker implements a staged creation mechanism:
-   **Draft State:** New job applications are initialized in a local draft state. Changes are held in memory and are not persisted to the database until the user explicitly saves the application.
-   **Editing Sandbox:** For existing jobs, the system uses a deep-cloned draft state. This allows users to modify multiple fields, manage contacts, and add timeline notes in a sandbox environment, with the option to discard all changes via a Cancel action.

### Automated Timeline Events
The system maintains a non-deletable audit trail of critical application milestones:
-   **Status Tracking:** Automatically records an event when an application moves between pipeline stages (e.g., from Phone Screen to Technical Interview).
-   **Deadline Monitoring:** 
    -   **Detection:** Scans applications on load and update to identify passed deadlines.
    -   **Automatic Logging:** Records a "Deadline Passed" event if an application's window has closed.
    -   **Change History:** Logs "Deadline Updated" events when dates are modified, capturing both the old and new values.
-   **Persistence:** All automated events are finalized during the save operation, ensuring the timeline perfectly matches the user's intent.
