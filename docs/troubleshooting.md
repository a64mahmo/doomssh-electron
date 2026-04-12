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

---

## Debugging & Diagnostics

### Bug Mode (Global Diagnostics)
If you encounter persistent errors with AI generation or file saving, you can enable **Bug Mode** to see detailed technical logs.

1.  Navigate to the **Main Dashboard**.
2.  Click the **Settings (Gear Icon)** in the bottom left.
3.  Toggle **Bug Mode** to ON.
4.  Detailed error toasts will now appear whenever a system failure occurs.

### Persistence Failures on Windows
If the application hangs or fails to save on Windows after adding a large photo or creating many jobs:
- Ensure you are running version **v0.3.0** or later.
- Check that your **Vault Folder** has write permissions.
- Enable **Bug Mode** to see the specific file-system error.

---

## Software Updates

### Manual Update Check
If you suspect you are missing an update or the auto-update notification didn't appear:
1.  Open **Settings** from the main dashboard.
2.  Click **Check for Updates**.
3.  If an update is available, you will see a progress bar.
4.  Once complete, click **Restart & Install Now**.

### Update Errors
If an update fails to download:
- Ensure you have a stable internet connection.
- Check that the application is not blocked by a firewall or antivirus.
- Enable **Bug Mode** to see the specific update error message.
