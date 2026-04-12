# DoomSSH Wiki

Welcome to the **DoomSSH** documentation. DoomSSH is a high-performance, AI-powered resume builder application available for Web and Desktop (via Electron).

## Table of Contents

1.  [Overview](#overview)
2.  [Core Features](#core-features)
3.  [Tech Stack](#tech-stack)
4.  [Project Structure](#project-structure)
5.  [Getting Started](#getting-started)
6.  [Documentation Modules](#documentation-modules)

---

## Overview

DoomSSH is designed to simplify the resume creation process by leveraging AI (Anthropic Claude) to help users craft professional content. It provides a real-time preview, multiple professional templates, and seamless export to PDF.

## Core Features

-   **AI-Powered Content Generation:** Integrated with Anthropic Claude for intelligent resume assistance.
-   **Interactive Builder:** Real-time preview with drag-and-drop section reordering.
-   **Multiple Templates:** Choose from various professional designs (Classic, Modern, Tokyo, etc.).
-   **Cross-Platform:** Available as a web application and a desktop application for macOS, Windows, and Linux.
-   **Offline Support:** Uses Dexie.js for robust local data management (IndexedDB).
-   **PDF Export:** High-quality PDF generation using `@react-pdf/renderer`.

## Tech Stack

### Frontend
-   **Framework:** Next.js 16 (App Router)
-   **UI Library:** React 19
-   **Styling:** Tailwind CSS 4
-   **State Management:** Zustand & Immer
-   **Local Database:** Dexie.js (IndexedDB)
-   **AI Integration:** Anthropic SDK via Electron IPC (Claude Opus 4.6)

### Desktop
-   **Runtime:** Electron 34
-   **Security:** `safeStorage` for credentials

---

## Project Structure

-   `/frontend`: Next.js web application and AI API routes.
-   `/electron`: Electron main and preload scripts.
-   `/docs`: Project documentation (this wiki).

---

## Important Note for Developers

DoomSSH uses **Next.js 16**, which contains significant breaking changes compared to previous versions. Developers should refer to `AGENTS.md` and the internal Next.js documentation located in `node_modules/next/dist/docs/` before making structural changes to the frontend.

## Documentation Modules

-   [Architecture](./architecture.md) - System design and data flow.
-   [Frontend Deep Dive](./frontend.md) - Components, hooks, state, and AI routes.
-   [Electron Integration](./electron.md) - Packaging and desktop-specific features.
-   [Troubleshooting](./troubleshooting.md) - Solutions for common issues like high resource usage.

---

## Recent Updates (v0.3.0)

-   **Bug Mode & Global Diagnostics:**
    -   Implemented a system-wide diagnostic mode ("Bug Mode") available in the main dashboard settings.
    -   Added a `DebugToast` component that captures and displays detailed error logs for AI and persistence failures.
    -   Integrated diagnostic reporting into the auto-save engine and AI streaming hooks.
-   **Enhanced Auto-Update UI:**
    -   Added a manual "Check for Updates" control in the application settings.
    -   Implemented a real-time download progress bar for transparent background updates.
    -   Added a "Restart & Install" persistent action for downloaded updates.
    -   Exposed current application version in the UI for better user awareness.
-   **Windows UX & Persistence Optimization:**
    -   Enabled native-style window controls (Close, Maximize, Minimize) on Windows using `titleBarOverlay`.
    -   Optimized Electron IPC payloads with compact JSON serialization to resolve persistence lock-ups on Windows.
    -   Implemented strict `isDirty` state synchronization to prevent data loss during file system operations.
-   **Precision Job Tracker:**
    -   Enhanced salary tracking to support exact values for roles under $1K (no more "0k" rounding).
    -   Added decimal precision for larger salary ranges (e.g., "85.5k").
    -   Improved Job Stats dashboard with one-decimal-place precision for Response, Interview, and Offer rates.
-   **Workflow Improvements:**
    -   Automated "Photo Enabled" toggle when a user uploads a profile picture in the header editor.
    -   Expanded the test suite to include 70+ unit and integration tests covering diagnostic flows and cross-platform persistence.

## Recent Updates (v0.2.5)

-   **Windows Architecture Refinement:** Fixed critical routing issues on Windows/Linux by transitioning from dynamic path segments to query-based navigation (`?id=...`). This ensures full compatibility with Next.js static exports in Electron environments.
-   **Strict Vault Validation:** Enhanced the `resume:list` IPC handler with strict object validation. The application now automatically ignores system files (e.g., `_jobs.json`) and invalid data, ensuring only valid resumes are displayed on the dashboard.
-   **Cross-Platform Fidelity:**
    -   Implemented `pathToFileURL` in the Electron protocol handler to correctly resolve Windows file paths (fixing blank screen issues).
    -   Added platform-aware `titleBarStyle` for native window controls on all operating systems.
    -   Updated the application icon to `file.svg` across all platforms.
-   **Developer Experience & CI/CD:**
    -   Fixed a critical `electron-builder` execution error on macOS runners by implementing a cache clearing step and enforcing native-only builds (`--mac` / `--win` flags).
    -   Wrapped core client components in `<Suspense>` boundaries to resolve Next.js 16 build de-optimization errors.
    -   Integrated permanent unit tests for the `BuilderDashboard` and resume deletion flows.
    -   Improved Electron process management during development with more robust `projectRoot` resolution and `node` binary spawning.
-   **UI/UX Polishing:**
    -   Resolved a visual bug by removing the vertical active indicator from the style panel's navigation sidebar.
    -   Integrated real-time user feedback with `sonner` toast notifications for resume CRUD operations.

## Recent Updates (v0.2.0)

-   **Modular Rendering Architecture:** Reorganized the rendering logic into category-specific files. The `templates` directory has been renamed to `web`, and both `web` and `pdf` paths now use a shared, modular section structure.
-   **Customize Panel Refactor:** Modularized the 1,600+ line `CustomizePanel` into isolated, domain-specific components (Typography, Colors, Layout, etc.), improving maintainability and performance.
-   **Comprehensive CI/CD Test Suite:** Introduced a new testing architecture in `/tests` covering E2E, Regression, Performance, and Visual regression using Playwright.
-   **Enhanced Resilience:** Implemented null-safe fallbacks for resume settings across both rendering engines to ensure stable behavior with incomplete or legacy data.

## Recent Updates (v0.1.1)

-   **Enhanced Navigation:** Added interactive tooltips to the builder sidebar for all resume sections and customization panels.
-   **macOS Desktop Optimization:** Implemented dynamic padding for the Electron app on macOS, ensuring the UI perfectly clears the native "traffic light" window controls.
-   **Refined Visual Identity:** Standardized section heading sizing and spacing across all templates. Icons now feature a high-contrast "etched" look in filled modes, maintaining sharp outlines in both web and PDF.
-   **Robust Data Handling:** Introduced strict validation for profile images (JPEG, PNG, WEBP only) to prevent Base64 rendering issues.
-   **Architecture & Stability:** Enforced strict TypeScript type safety across all complex components, including drag-and-drop systems and nested forms.
