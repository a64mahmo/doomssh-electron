# Electron Documentation

DoomSSH uses Electron to provide a native desktop experience while leveraging a unified Next.js/Express codebase.

## Application Architecture

The Electron app consists of two primary processes:

1.  **Main Process (`electron/main.ts`):** Runs in a Node.js environment. It is responsible for window management, system-level integrations, and secure data storage.
2.  **Renderer Process (Next.js Frontend):** Runs in a sandboxed browser environment. This is where the actual user interface lives.

## Core Responsibilities

### Process Orchestration
When DoomSSH starts, the Main Process spawns the Next.js server as a background child process. It then waits for the server to be ready before creating and displaying the application window.

### Secure Storage
The Main Process uses Electron's `safeStorage` API to encrypt and decrypt sensitive data, such as:
-   **Anthropic API Keys:** Stored locally on the user's machine, ensuring they never touch the cloud unless explicitly sent to the AI.
-   **JWT Secrets:** Automatically generated and stored locally to facilitate secure communication and future authentication needs.

### AI Proxy & IPC
To keep API keys secure and bypass browser-level CORS restrictions, all AI interactions (powered by **Claude Opus 4.6**) are routed through the Main Process using Inter-Process Communication (IPC):
1.  **Renderer** sends an `ai:start` message with the prompt and context.
2.  **Main Process** retrieves the encrypted API key, initializes the Anthropic SDK, and starts a stream.
3.  **Main Process** sends `ai:chunk` messages back to the Renderer as the AI generates content.
4.  **Main Process** sends `ai:done` or `ai:error` to signal the end of the operation.

### PDF Export (`export-pdf`)
The desktop app exports resumes by printing the same HTML the live preview shows:
1.  **Renderer** calls `window.electron.exportPdf({ resume, fileName })` (exposed in `electron/preload.ts`).
2.  **Main Process** opens a hidden `BrowserWindow` (white background, same preload) on `/print/new/?mode=export` — `app://-` in production, the Next.js dev server in development.
3.  **Main Process** injects the resume as `window.__DOOMSSH_PRINT_RESUME__` and fires a `doomssh:print-resume` event.
4.  **Main Process** polls until the page sets `html[data-print-ready="true"]` (fonts loaded, layout settled), giving up after 15 seconds.
5.  **Main Process** calls `webContents.printToPDF({ printBackground: true, preferCSSPageSize: true })`, shows the save dialog and writes the file. The hidden window is always destroyed.

`printBackground` is required — without it sidebar tints, header bands and skill pills print white. Page size and margins come from the print page's CSS; see [PDF Export](./architecture.md#pdf-export-html--pdf).

The older `save-pdf` handler (writes bytes produced in the renderer) is still exposed for callers that generate a PDF themselves.

## Native UI Integration

### macOS Traffic Light Padding
To provide a truly native look and feel on macOS, the application uses **hiddenInset** title bar styling. This places the standard macOS window controls (close, minimize, maximize) directly inside the application's content area.

To prevent UI overlap:
1.  The `electron/preload.ts` script exposes the `window.electron.platform` property to the renderer.
2.  The frontend identifies when it is running on **darwin** (macOS).
3.  Dynamic CSS padding (`pl-[72px]`) is automatically applied to the top navigation bars and sidebar headers to shift content to the right, ensuring the native window controls are never obscured.

### App Icons
The DoomSSH mark — a D whose top-left corner folds like a page — lives in:
-   `frontend/public/logo.svg` and `frontend/app/icon.svg`: the source artwork (a dark tile with a thin edge so it stays visible on dark docks and taskbars).
-   `frontend/public/icon.png`: the window icon (`BrowserWindow` ignores SVG icons on Windows and Linux).
-   `electron/resources/icon.icns`, `icon.ico`, `icon.png`: packaging icons, referenced per platform from `build.mac.icon`, `build.win.icon` and `build.linux.icon` in the root `package.json`. They live outside `build/` because that folder is git-ignored. The macOS icon keeps Apple's transparent margin.
-   `frontend/components/Logo.tsx`: the in-app mark, which inverts with the light/dark theme.

## Development & Distribution

### Development Mode
-   Run `npm run electron:dev` to start the Electron wrapper and Next.js in development mode.
-   The app will automatically connect to the local Next.js dev server at `http://localhost:3000`.

### Packaging
DoomSSH uses `electron-builder` to package the application for distribution:
-   **macOS:** DMG and App bundles (supporting both Intel and Apple Silicon).
-   **Windows:** NSIS installer.
-   **Linux:** AppImage.

Packaging is performed via the `npm run electron:dist` command, which handles the full build pipeline (frontend, backend, and Electron scripts).

### Platform Flag
The root `build` script (used by `electron:preview` and `electron:dist`) builds the frontend with `NEXT_PUBLIC_APP_PLATFORM=electron`, so `isElectron()` in `frontend/lib/platform.ts` is true in the packaged app. In development the variable is unset and the platform is detected from `window.electron`.
