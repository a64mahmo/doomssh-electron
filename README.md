# DoomSSH

just a resume builder so you don't have to pay

## Features

- **AI-Powered Assistance:** Integrated with Anthropic Claude (using the cutting-edge `claude-opus-4-6` model) to help you generate, improve, and bulletize your resume content.
- **Real-Time Preview:** High-fidelity, instant PDF preview as you type, powered by `@react-pdf/renderer`.
- **Multiple Professional Templates:** Choose from a variety of modern, sleek designs including Classic, Modern, Tokyo, and more.
- **Robust Local Storage:** Your data is safe and available offline thanks to Dexie.js and IndexedDB.
- **Desktop Native:** A first-class desktop experience for macOS, Windows, and Linux via Electron, featuring secure API key storage.
- **Drag-and-Drop:** Easily reorder sections and list items with a smooth `@dnd-kit` implementation.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4
- **State:** Zustand with Immer for immutable, lightning-fast state management
- **Database:** Dexie.js (IndexedDB) for local-first persistence
- **Desktop:** Electron with `safeStorage` for credential protection
- **AI:** Anthropic SDK (Claude Opus 4.6)
- **Testing:** Vitest for units and Playwright for E2E

## Project Wiki

Detailed documentation for DoomSSH can be found in the Project Wiki.

- [Architecture](./docs/architecture.md)
- [Frontend Documentation](./docs/frontend.md)
- [Electron Integration](./docs/electron.md)
- [Troubleshooting](./docs/troubleshooting.md)

## Getting Started

### Prerequisites

- Node.js (v18+)
- NPM or Yarn

### Development

1.  **Install dependencies:**

    ```bash
    npm install
    npm run frontend:install
    ```

2.  **Start development server:**

    ```bash
    npm run dev
    ```

3.  **Start Electron (optional):**
    ```bash
    npm run electron:dev
    ```

## Building for Production

To build the full application including the Electron desktop binaries:

```bash
npm run electron:dist
```

The output will be available in the `dist-electron` directory.

## License

[MIT](./LICENSE)
