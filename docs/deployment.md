# Deployment

DoomSSH builds two ways from the same frontend:

| Build | How it runs | Storage | PDF export |
|-------|-------------|---------|------------|
| **Desktop** | Electron app (`npm run electron:dist`) | Vault JSON files | Chromium `printToPDF` |
| **Web** | Static site on Cloudflare | Browser IndexedDB | Browser print dialog → Save as PDF |

## Web build on Cloudflare Workers

The frontend is a static export (`output: 'export'` → `frontend/out`). `frontend/wrangler.jsonc` serves that folder as Worker static assets, with Next's `404.html` as the not-found page.

### Build settings

In the Cloudflare dashboard: **Workers & Pages → your Worker → Settings → Build**.

| Setting | Value |
|---------|-------|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

The root directory matters: the repository root's `package.json` only installs Electron tooling, so building from the root fails with `next: not found`.

The `name` in `frontend/wrangler.jsonc` must match the Worker's name in the dashboard.

### Build variables

In **Settings → Build → Variables and secrets**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_APP_PLATFORM` | `web` |

This must be a **build** variable. `next build` inlines `NEXT_PUBLIC_*` values into the static files, so a runtime variable, a secret or a `vars` entry in `wrangler.jsonc` has no effect. Redeploy after changing it.

If the variable is unset, the app detects the platform at runtime (no Electron bridge → web), so the site still works; setting it makes the intent explicit.

### Caching and redirects

`frontend/public/` is copied into `out/`, so two Cloudflare files there shape responses (the desktop app ignores them):

- `_headers`: `/_next/static/*` is content-hashed, so it is served `public, max-age=31536000, immutable`; `/fonts/*` is cached for a week with background refresh. Without this, Workers assets default to `max-age=0, must-revalidate` and every visit revalidates each chunk.
- `_redirects`: `/` → `/builder/` (302) at the edge, skipping the root page's in-browser redirect.

Check after a deploy: `curl -sI https://<host>/_next/static/chunks/<any>.js | grep -i cache-control` and `curl -sI https://<host>/ | grep -i location`.

### What changes in the web build

`isWeb()` / `isElectron()` from `frontend/lib/platform.ts` drive the differences:
- **Storage:** resumes, cover letters and jobs are saved in IndexedDB (`frontend/lib/db/browserDb.ts`). Data does not sync between browsers or devices.
- **Settings:** the dialog shows a storage note only — no Anthropic API key, Bug Mode or software updates.
- **PDF:** Export loads the `/print` page in a hidden frame and opens the browser's print dialog; choose **Save as PDF**. It is the same HTML the desktop app prints, so output matches the preview.

## Desktop build

The root `build` script sets `NEXT_PUBLIC_APP_PLATFORM=electron`:

```bash
npm run electron:dist     # build frontend (electron), compile Electron, package
```

Icons for packaging are in `electron/resources/` and referenced from `package.json` (`build.mac.icon`, `build.win.icon`, `build.linux.icon`). See [Electron Integration](./electron.md).

## Local check of the web build

```bash
cd frontend
npm run build
npx wrangler deploy --dry-run    # validates wrangler.jsonc and lists the assets
```
