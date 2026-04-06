# Troubleshooting: High Resource Usage during Build

If your computer slows down or crashes when running `npm run electron:dist`, it's likely due to the high memory demands of compiling Next.js and packaging the application.

## Recommended Solutions

### 1. Increase Node.js Memory Limit
By default, Node.js may not allocate enough memory for large builds. You can increase the heap size by setting the `NODE_OPTIONS` environment variable.

**On macOS/Linux:**
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run electron:dist
```

**On Windows (PowerShell):**
```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run electron:dist
```

### 2. Prune Dependencies Before Packaging
To reduce the package size and build time, ensure you are only including production dependencies in your final bundle.

You can try running `npm prune --production` in the `frontend` directory before building the Electron app.

### 3. Build Components Individually
Instead of running `npm run electron:dist`, try running the build steps one by one to isolate the resource usage:

1.  `npm run build` (Frontend)
2.  `npm run electron:build` (Electron)
3.  `npx electron-builder` (Packaging)
