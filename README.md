<div align="center">
  <img src="public/next.svg" alt="DoomSSH Logo" width="120" height="120" />
  <h1>DoomSSH</h1>
  <p><strong>The AI-Powered, Local-First, Privacy-Focused Resume Builder</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Electron](https://img.shields.io/badge/Electron-34-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![AI](https://img.shields.io/badge/AI-Anthropic_Claude-D97757?logo=anthropic&logoColor=white)](https://www.anthropic.com/)
</div>

---

## Why DoomSSH?

Most modern resume builders lock your data behind a subscription or a cloud account. DoomSSH flips the script. It is a professional-grade desktop application designed for engineers and creatives who value privacy, performance, and data ownership.

- **Local-First:** Your resumes are stored as plain JSON files in a Vault of your choice. No cloud, no tracking, no data harvesting.
- **AI-Native:** Powered by Anthropic Claude. Generate high-impact bullet points and summaries directly within the app, with keys stored securely in your OS keychain.
- **Dual-Renderer Sync:** Experience a what-you-see-is-what-you-get workflow. Our custom engine synchronizes a high-performance HTML preview with a pixel-perfect react-pdf generator.
- **Job Application Tracker:** Manage your entire career pipeline with a built-in tracker featuring staged creation, contact management, precision salary tracking, and automated activity timelines.
- **Native Cross-Platform Experience:** Optimized for both macOS and Windows, including native window controls and deep OS integration.
- **Transparent Updates:** Built-in software update system with real-time download progress and manual check controls.
- **Bug Mode & Diagnostics:** Built-in diagnostic system ("Bug Mode") to capture and display system errors for easier troubleshooting.
- **Infinite Customization:** Dozens of professionally designed templates with deep control over typography, colors, layout mathematics, and section arrangements.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | **Electron 34** (Native OS integration & Security) |
| **Frontend** | **Next.js 15** (App Router, React 19, Static Export) |
| **State** | **Zustand + Immer** (High-performance immutable state) |
| **Storage** | **Local Vault** (JSON-based files) |
| **Styles** | **Tailwind CSS 4** + **Base UI** (Atomic, Dark-mode ready) |
| **PDF Engine** | **@react-pdf/renderer** (Client-side vector generation) |
| **AI Bridge** | **Anthropic SDK** (IPC-streamed for credential safety) |

---

## Architecture

### The Vault System
DoomSSH treats your resumes as first-class citizens of your file system. When you start the app, you select a directory to act as your Vault. This allows you to:
- **Version Control:** Track changes to your resume using Git.
- **Interoperability:** Open and edit your resume JSON in any text editor.
- **Backup:** Sync your Vault folder via iCloud, Dropbox, or Syncthing.

### IPC Security Boundary
API keys and sensitive operations never touch the untrusted frontend. 
1. **Keychain Storage:** Keys are stored in the macOS Keychain or Windows Credential Manager.
2. **Main Process AI:** The Electron Main Process handles Anthropic SDK calls.
3. **Secure Streaming:** AI responses are streamed over secure IPC channels to the renderer.

### The Mirror-World Rule
We maintain two identical rendering trees. Any visual change made in the editor's DOM preview is instantly mirrored in the PDF engine, ensuring that your exported .pdf looks exactly like the screen.

---

## Project Structure

```text
.
├── electron/           # Main process: IPC, Window management, Keychain
├── frontend/           # Next.js 15 Workspace
│   ├── app/            # App Router (Builder, Print, AI routes)
│   ├── components/     
│   │   ├── web/        # HTML/Web-based renderers (Mirror path 1)
│   │   ├── pdf/        # PDF-based renderers (Mirror path 2)
│   │   ├── customize/  # Modular styling & design panel
│   │   └── editor/     # Data entry components
│   ├── hooks/          # useResume (State), useAI (Streaming)
│   └── lib/
│       ├── store/      # Zustand store (Single Source of Truth)
│       └── db/         # Local file-system CRUD via Electron IPC
├── tests/              # Comprehensive CI/CD Test Suite
└── docs/               # Technical deep-dives
```

---

## Getting Started

### Prerequisites
- Node.js (Latest LTS)
- npm or yarn

### Installation
```bash
# 1. Install all dependencies (Root + Frontend)
npm run install-all

# 2. Start the development environment (Next.js + Electron)
npm run dev
```

### Build & Distribution
```bash
# Production Build
npm run build

# Package for macOS/Windows/Linux
npm run electron:dist
```

## Testing & Quality

DoomSSH employs a rigorous testing architecture to ensure stability across its dual-renderer system.

- **Automated Test Suite:** Run all tests across Chromium, Firefox, and Webkit.
  ```bash
  npm run test:all
  ```
- **Categories:**
  - `npm run test:e2e`: Main user flows and navigation.
  - `npm run test:regression`: Logic synchronization and state integrity.
  - `npm run test:integration`: Modular UI component coordination.
  - `npm run test:performance`: Render speed benchmarks and load testing.
  - `npm run test:visual`: Visual regression snapshots (Pixel-perfect parity).
- **Unit Testing:** Powered by Vitest for core frontend logic.
  ```bash
  npm run test --prefix frontend
  ```

## Documentation

For deeper technical insights, check out the /docs directory:
- [Architecture Overview](docs/architecture.md)
- [Frontend Deep-Dive](docs/frontend.md)
- [Electron & IPC Protocol](docs/electron.md)
- [Vault Storage Specification](docs/ideas/vault-storage.md)

---

## License

DoomSSH is open-source software licensed under the [MIT License](LICENSE).

---

<div align="center">
  Built by <strong>Abdallh Mahmood</strong>
</div>
