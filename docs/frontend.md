# Frontend Documentation

The DoomSSH frontend is a sophisticated Next.js application designed for real-time document editing and high-fidelity rendering.

## Core Technologies

-   **Next.js 16 (App Router):** Provides routing, server-side rendering, and optimized builds.
-   **Zustand & Immer:** Manage the complex, nested state of a resume with immutable update patterns.
-   **Tailwind CSS 4:** Modern, utility-first styling for a sleek and responsive UI.
-   **Framer Motion:** Smooth transitions between editor panels and templates.
-   **@dnd-kit:** Powerful drag-and-drop functionality for reordering resume sections and list items.
-   **Dexie.js:** IndexedDB wrapper for local-first persistence.

## State Management

The `resumeStore` is the heart of the frontend. It maintains the `Resume` object, which includes:
-   `sections`: An array of `ResumeSection` objects (Experience, Education, etc.).
-   `settings`: Visual preferences (colors, fonts, margins).

### Update Flow
1.  User interacts with a UI component (e.g., editing a job description).
2.  A Zustand action is dispatched.
3.  Immer handles the immutable update to the store.
4.  The `PreviewPanel` re-renders in real-time.
5.  Changes are periodically synced to Dexie for local persistence.

## Component Architecture

-   **Builder Page (`/app/builder/[id]`):** The main workspace, split into:
    -   `EditorPanel`: Left side. Contains input fields for each resume section. Features a simplified sidebar with square selection backgrounds and interactive **tooltips** powered by `@base-ui/react`.
    -   `PreviewPanel`: Right side. Provides a high-fidelity rendering of the resume.
    -   `CustomizePanel`: Sidebar for adjusting fonts, colors, and layout settings. Also utilizes the standardized tooltip-enabled sidebar.
    -   `AIPanel`: Interactive assistant for generating and improving content.

## Form Validation & Robustness

To ensure data integrity and a smooth user experience, DoomSSH implements strict validation patterns:
-   **Image Uploads:** Profile photos are restricted to **JPEG, PNG, and WEBP** formats. The system manually validates the MIME type and provides immediate feedback via `sonner` toasts if unsupported formats (like HEIC) are selected, preventing Base64 rendering failures.
-   **TypeScript Enforcement:** The application maintains zero `any` types in critical paths. All drag-and-drop interactions (`dnd-kit`) and complex form components (like the `MonthYearPicker`) are strictly typed to prevent runtime errors.

## Resume Templates & The "Mirror Rule"

DoomSSH supports multiple templates, each defined in `frontend/components/templates`. Following the project's **Mirror Rule**, all visual changes are synchronized between the DOM Reality (web preview) and the PDF Reality (PDF generation).

### Visual Standards
-   **Unified Headings:** Section headings (font size, margins, and spacing) are unified across both main and sidebar columns to ensure a balanced, professional layout.
-   **Icon Rendering:** Section icons maintain their stroke (outline) definition across all modes. In "Filled" mode, the system uses a "reverse fill" or **etched** look, where the icon is solid-filled with the primary color but highlights its internal details using the background color.
