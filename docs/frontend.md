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
    -   `EditorPanel`: Left side. Contains input fields for each resume section.
    -   `PreviewPanel`: Right side. Provides a high-fidelity rendering of the resume.
    -   `CustomizePanel`: Sidebar for adjusting fonts, colors, and layout settings.
    -   `AIPanel`: Interactive assistant for generating and improving content.

## Resume Templates

DoomSSH supports multiple templates, each defined in `frontend/components/templates`:
-   `ModernTemplate`: Clean, two-column layout.
-   `ClassicTemplate`: Traditional, single-column design.
-   `TokyoTemplate`: High-impact, modern aesthetic.
-   `MinimalTemplate`: Simple and elegant.
-   `CrispTemplate`: Sharp and professional.

Templates are implemented as React components that consume the `Resume` data and render it using either standard HTML (for web preview) or `@react-pdf/renderer` primitives (for PDF generation).
