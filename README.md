# DoomSSH

> **The AI-Powered, Local-First, Privacy-Focused Resume Builder**

<div align="center">

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
- **Headless-Sync Renderer:** Experience a what-you-see-is-what-you-get workflow. Our custom headless architecture ensures that the logic driving the HTML preview and the PDF export is perfectly synchronized.
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

DoomSSH treats your resumes as first-class citizens of your file system. By default, it uses a secure system folder, but you can select any directory to act as your Vault. This allows you to:

- **Version Control:** Track changes to your resume using Git.
- **Interoperability:** Open and edit your resume JSON in any text editor.
- **Backup:** Sync your Vault folder via iCloud, Dropbox, or Syncthing.

### IPC Security Boundary

API keys and sensitive operations never touch the untrusted frontend.

1. **Keychain Storage:** Keys are stored in the macOS Keychain or Windows Credential Manager.
2. **Main Process AI:** The Electron Main Process handles Anthropic SDK calls.
3. **Secure Streaming:** AI responses are streamed over secure IPC channels to the renderer.

### Headless Rendering Architecture

To prevent logic drift between the screen and the page, DoomSSH uses a "Headless Controller" pattern. All business logic for a section (formatting, ordering, visibility) is extracted into a single controller in `frontend/lib/renderers/`. Both the HTML and PDF renderers consume a unified `SectionViewModel`, ensuring that the exported PDF is always a perfect reflection of the editor.

### Persistence Manager

State mutations are decoupled from disk I/O via a dedicated `PersistenceManager` (`frontend/lib/store/persistenceManager.ts`). The Zustand store manages in-memory state only; a subscription-based manager debounces writes to the Vault, ensuring efficient I/O without blocking the UI.

---

## Project Structure

```text
doomssh/
├── electron/                    # Main Process
│   ├── main.ts                  # Entry point, IPC handlers, window management
│   └── preload.ts               # Secure bridge to renderer
├── frontend/                     # Next.js 15 Workspace
│   ├── app/                     # App Router pages
│   │   ├── builder/             # Resume builder UI
│   │   ├── print/               # PDF export route
│   │   └── api/ai/             # AI streaming endpoints
│   ├── components/
│   │   ├── web/                 # HTML renderers (Web preview)
│   │   │   └── sections/        # Section components (DOM)
│   │   ├── pdf/                 # PDF renderers (Vector export)
│   │   │   └── sections/        # Section components (@react-pdf)
│   │   ├── customize/            # Design panel & styling controls
│   │   ├── editor/              # Data entry forms & inputs
│   │   └── jobs/               # Application tracker UI
│   ├── hooks/                  # useResume, useAI, useJobs
│   └── lib/
│       ├── renderers/           # Headless section controllers
│       │   ├── index.ts         # Controller registry
│       │   ├── experience.ts   # Experience logic
│       │   └── types.ts        # ViewModel types
│       ├── store/               # Zustand stores
│       │   ├── resumeStore.ts   # Resume state (source of truth)
│       │   ├── persistenceManager.ts  # Debounced vault writes
│       │   ├── jobStore.ts      # Job tracker state
│       │   └── uiStore.ts      # UI state (errors, modals)
│       ├── db/                  # Vault CRUD via Electron IPC
│       └── pdf/                 # PDF build utilities
├── tests/                       # Playwright E2E & regression tests
└── docs/                        # Architecture & deep-dive docs
```

---

## Getting Started

### Prerequisites

- Node.js (Latest LTS)
- npm or yarn

### Installation

```bash
# Install all dependencies (root + frontend)
npm run install-all

# Start development environment (Next.js + Electron)
npm run dev
```

### Build & Distribution

```bash
# Production build (Next.js static export)
npm run build

# Package for macOS/Windows/Linux
npm run electron:dist
```

---

## Template Customization Guide

DoomSSH offers deep control over every aspect of your resume's appearance. This guide explains how to adjust templates both through the UI and programmatically.

### Available Settings

The following settings can be adjusted via the **Customize Panel** in the builder:

#### Typography

| Setting | Options | Description |
|---------|---------|-------------|
| **Font Family** | Any Google Font | e.g., "Merriweather", "Raleway", "Inter" |
| **Font Size** | 8–16pt | Base body text size |
| **Name Size** | S / M / L / XL | Scales the candidate's name proportionally |
| **Section Heading Size** | S / M / L / XL | Scales section titles |
| **Line Height** | 1.0–2.0 | Vertical spacing between lines |
| **Letter Spacing** | Tight / Normal / Wide | Horizontal spacing on headings |
| **Section Capitalization** | Uppercase / Capitalize / None | Transforms section heading text |

#### Colors

| Setting | Options | Description |
|---------|---------|-------------|
| **Accent Color** | Hex color | Primary brand color (links, headings, decorations) |
| **Color Mode** | Basic / Advanced | Basic uses one color; Advanced enables a full palette |
| **Heading Color** | Hex color | Color for section titles (Advanced mode) |
| **Text Color** | Hex color | Body text color (Advanced mode) |
| **Background Color** | Hex color | Page background (Advanced mode) |

#### Layout

| Setting | Options | Description |
|---------|---------|-------------|
| **Paper Size** | Letter / A4 | Standard North American or international |
| **Margin** | 10–30mm | Page margins |
| **Column Layout** | One Column / Two Columns / Mix | Single-page or sidebar layout |
| **Column Width** | 25%–40% | Sidebar width in two-column layouts |
| **Column Reverse** | On / Off | Swaps sidebar to the left side |
| **Entry Spacing** | Compact / Normal / Spacious | Vertical gap between resume entries |

#### Section Display

| Setting | Options | Description |
|---------|---------|-------------|
| **Show Section Labels** | On / Off | Toggle section headings |
| **Section Heading Style** | Underline / Overline / Top-Bottom / Box / Background / Left Bar | Decoration style for headings |
| **Section Heading Icon** | None / Outline / Filled / Knockout | Icon before section headings |
| **Experience Order** | Position → Company / Company → Position | Which field appears first |
| **Education Order** | School → Degree / Degree → School | Which field appears first |
| **Skill Display** | Compact / Grid / Level / Bubble | How skills are laid out |
| **Photo** | Enable / Disable, Shape, Position | Optional profile photo |
| **Contact Icons** | None / Outline / Filled | Icon style for contact details |

### Programmatic Template Customization

Templates are defined as **JSON data** in `frontend/lib/store/types.ts` via the `ResumeSettings` interface. You can create custom templates by modifying settings programmatically:

```typescript
// Example: Create a "Modern Minimal" template preset
const modernMinimalTemplate = {
  template: 'modern-minimal',
  settings: {
    fontFamily: 'Inter',
    fontSize: 10,
    nameSize: 'M',
    sectionHeadingSize: 'S',
    accentColor: '#2563eb',
    colorMode: 'advanced',
    headingColor: '#1e293b',
    textColor: '#334155',
    backgroundColor: '#ffffff',
    columnLayout: 'one',
    marginHorizontal: 20,
    marginVertical: 15,
    entrySpacing: 1.2,
    lineHeight: 1.4,
    sectionHeadingStyle: 'underline',
    sectionHeadingCapitalization: 'uppercase',
    showSectionLabels: true,
    experienceOrder: 'position-employer',
    educationOrder: 'school-degree',
    skillDisplay: 'compact',
    dateFormat: 'MMM YYYY',
  }
}
```

To add a new template preset:

1. Define the settings in `frontend/lib/store/types.ts`
2. Add the template name to the `Template` type union
3. Register the template in the Customize Panel (`frontend/components/customize/sections/TemplatesSection.tsx`)

### Adjusting Headless Controllers

Section logic (how items are ordered, formatted, and displayed) lives in `frontend/lib/renderers/`. For example, to change how **Experience** entries are rendered:

```typescript
// frontend/lib/renderers/experience.ts

export const experienceController: SectionController = (section, ctx) => {
  const items = (section.items as ExperienceItem[]) || [];
  const { helpers } = ctx;
  const settings = (ctx.settings || {}) as any;

  const processedItems = items.map(item => {
    const isEmployerFirst = settings.experienceOrder === 'employer-title';
    
    return {
      id: item.id,
      // primaryText = bold/large title
      primaryText: isEmployerFirst ? item.company : item.position,
      // secondaryText = subtitle/label
      secondaryText: isEmployerFirst ? item.position : item.company,
      location: item.location,
      dateRange: helpers.formatDate(item.startDate, item.endDate, item.present, settings.dateFormat || 'YYYY'),
      description: item.description,
    };
  });

  return {
    title: section.title,
    isVisible: section.visible !== false && processedItems.length > 0,
    type: 'experience',
    items: processedItems,
  };
};
```

Both the **Web renderer** (`frontend/components/web/sections/experience.tsx`) and the **PDF renderer** (`frontend/components/pdf/sections/experience.tsx`) then consume this ViewModel, guaranteeing that a change to the controller is reflected instantly in both the live preview and the exported PDF.

---

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

---

## Documentation

For deeper technical insights, check out the `/docs` directory:

- [Architecture Overview](docs/architecture.md) — System design, rendering pipeline, storage model
- [Frontend Deep-Dive](docs/frontend.md) — Component architecture and state management
- [Electron & IPC Protocol](docs/electron.md) — Main process, preload bridge, and security
- [Vault Storage Specification](docs/ideas/vault-storage.md) — JSON file format and CRUD operations

---

## License

DoomSSH is open-source software licensed under the [MIT License](LICENSE).

---

<div align="center">
  Built by <strong>Abdallh Mahmood</strong>
</div>
