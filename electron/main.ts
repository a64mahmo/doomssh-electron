import { app, BrowserWindow, ipcMain, safeStorage, shell, dialog, protocol, net } from 'electron'
import { spawn, type ChildProcess } from 'child_process'
import path from 'path'
import fs from 'fs'
import Anthropic from '@anthropic-ai/sdk'
import { autoUpdater } from 'electron-updater'

// ── Auto Update Config ────────────────────────────────────────────────────────
autoUpdater.logger = console
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// ── Privileged Schemes ────────────────────────────────────────────────────────
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
])

// Ports
const NEXT_PORT = 3000

let mainWindow: BrowserWindow | null = null
let nextProc: ChildProcess | null = null

// ── Resolve paths ─────────────────────────────────────────────────────────────
function projectRoot(): string {
  // In dev, __dirname is projetRoot/electron/dist
  // In prod, __dirname is proyectRoot/electron/dist (if using electron-builder default structure)
  return isDev ? path.join(__dirname, '..', '..') : path.join(process.resourcesPath, 'app')
}

// ── Spawn Next.js ─────────────────────────────────────────────────────────────
function startNextJs(): Promise<void> {
  if (!isDev) return Promise.resolve() // In production, we load static files directly

  return new Promise((resolve) => {
    const root = projectRoot()
    const frontendRoot = path.join(root, 'frontend')
    const cmd = process.argv[0] // Use the same node/electron binary that started this process
    const args = [
      path.join(frontendRoot, 'node_modules', 'next', 'dist', 'bin', 'next'),
      isDev ? 'dev' : 'start',
      '--port', String(NEXT_PORT),
      '--hostname', '127.0.0.1',
    ]

    console.log('[electron] project root:', root)
    console.log('[electron] frontend root:', frontendRoot)
    console.log('[electron] spawning:', cmd, args.join(' '))

    nextProc = spawn(cmd, args, {
      cwd: frontendRoot,
      env: { ...process.env, NODE_ENV: isDev ? 'development' : 'production' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let resolved = false
    const onReady = () => {
      if (resolved) return
      resolved = true
      resolve()
    }

    nextProc.stdout?.on('data', (data: Buffer) => {
      const msg = data.toString()
      if (msg.includes('Ready') || msg.includes('started server') || msg.includes('127.0.0.1')) {
        onReady()
      }
      if (isDev) console.log('[next]', msg.trim())
    })

    nextProc.stderr?.on('data', (data: Buffer) => {
      if (isDev) console.error('[next-err]', data.toString().trim())
    })

    nextProc.on('error', (err) => {
      console.error('[electron] Next.js process error:', err)
      if (!resolved) resolve() // Fallback to let createWindow try anyway
    })

    nextProc.on('exit', (code) => {
      if (code !== 0) {
        console.error(`[electron] Next.js process exited with code ${code}`)
      }
    })

    setTimeout(onReady, 10000)
  })
}

// ── API key helpers ───────────────────────────────────────────────────────────
function getStoredApiKey(): string | null {
  const keyPath = path.join(app.getPath('userData'), 'apikey.enc')
  if (!fs.existsSync(keyPath)) return process.env.ANTHROPIC_API_KEY || null
  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(fs.readFileSync(keyPath))
    }
    return fs.readFileSync(keyPath, 'utf8')
  } catch {
    return null
  }
}

function storeApiKey(key: string): void {
  const keyPath = path.join(app.getPath('userData'), 'apikey.enc')
  if (safeStorage.isEncryptionAvailable()) {
    fs.writeFileSync(keyPath, safeStorage.encryptString(key))
  } else {
    fs.writeFileSync(keyPath, key, 'utf8')
  }
}

// ── JWT secret ────────────────────────────────────────────────────────────────
function getOrCreateSecret(): string {
  const secretPath = path.join(app.getPath('userData'), 'jwt.enc')
  if (safeStorage.isEncryptionAvailable()) {
    if (fs.existsSync(secretPath)) {
      return safeStorage.decryptString(fs.readFileSync(secretPath))
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const secret = require('crypto').randomBytes(48).toString('hex')
    fs.writeFileSync(secretPath, safeStorage.encryptString(secret))
    return secret
  }
  if (fs.existsSync(secretPath)) return fs.readFileSync(secretPath, 'utf8')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const secret = require('crypto').randomBytes(48).toString('hex')
  fs.writeFileSync(secretPath, secret, 'utf8')
  return secret
}

// ── Create window ─────────────────────────────────────────────────────────────
async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window', // macOS
    visualEffectState: 'active', // macOS
    backgroundMaterial: 'acrylic', // Windows 11
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: !isDev,
    },
    show: false,
  })

  mainWindow.once('ready-to-show', () => mainWindow?.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    await mainWindow.loadURL(`http://127.0.0.1:${NEXT_PORT}`)
  } else {
    await mainWindow.loadURL('app://-')
  }
}

// ── Custom Protocol ──────────────────────────────────────────────────────────
function registerAppProtocol() {
  protocol.handle('app', async (request) => {
    try {
      const url = request.url.replace('app://-', '')
      let relativePath = url || 'index.html'
      if (relativePath.startsWith('/')) relativePath = relativePath.slice(1)
      if (relativePath.endsWith('/')) relativePath += 'index.html'
      if (!relativePath) relativePath = 'index.html'
      
      // Remove query params or hashes
      relativePath = relativePath.split(/[?#]/)[0]

      const fullPath = path.join(projectRoot(), 'frontend', 'out', relativePath)
      
      // Dynamic route fallbacks for Static Export
      if (!fs.existsSync(fullPath)) {
        // If it's a builder route, fallback to the pre-rendered 'new' page
        if (relativePath.startsWith('builder/')) {
          return net.fetch(`file://${path.join(projectRoot(), 'frontend', 'out', 'builder', 'new', 'index.html')}`)
        }
        // If it's a print route, fallback to the pre-rendered 'new' page
        if (relativePath.startsWith('print/')) {
          return net.fetch(`file://${path.join(projectRoot(), 'frontend', 'out', 'print', 'new', 'index.html')}`)
        }
        // General fallback to root index.html
        return net.fetch(`file://${path.join(projectRoot(), 'frontend', 'out', 'index.html')}`)
      }

      return net.fetch(`file://${fullPath}`)
    } catch (err) {
      console.error('Protocol error:', err)
      return new Response('Not Found', { status: 404 })
    }
  })
}

// ── IPC: API key management ───────────────────────────────────────────────────
ipcMain.handle('set-api-key', (_event, key: string) => storeApiKey(key))
ipcMain.handle('get-api-key', () => getStoredApiKey())

ipcMain.handle('restart-and-install', () => {
  autoUpdater.quitAndInstall()
})

ipcMain.handle('save-pdf', async (_event, { bytes, fileName }: { bytes: number[]; fileName: string }) => {
  try {
    const buffer = Buffer.from(bytes)
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Save Resume',
      defaultPath: fileName,
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
    })
    if (canceled || !filePath) return { success: false, cancelled: true }
    fs.writeFileSync(filePath, buffer)
    return { success: true, path: filePath }
  } catch (error) {
    console.error('PDF Save Error:', error)
    return { success: false, error: String(error) }
  }
})

// ── IPC: AI streaming ─────────────────────────────────────────────────────────
// Frontend sends: ipcMain.emit('ai:start', { id, messages, maxTokens })
// Main streams:   event.sender.send('ai:chunk', { id, text })
//                 event.sender.send('ai:done',  { id })
//                 event.sender.send('ai:error', { id, message })
ipcMain.on('ai:start', async (event, { id, messages, maxTokens = 1024 }: {
  id: string
  messages: Anthropic.MessageParam[]
  maxTokens?: number
}) => {
  const apiKey = getStoredApiKey()
  if (!apiKey) {
    event.sender.send('ai:error', { id, message: 'No API key. Add it in Settings.' })
    return
  }

  try {
    const client = new Anthropic({ apiKey })
    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: maxTokens,
      messages,
    })

    for await (const evt of stream) {
      if (evt.type === 'content_block_delta' && evt.delta.type === 'text_delta') {
        event.sender.send('ai:chunk', { id, text: evt.delta.text })
      }
    }

    event.sender.send('ai:done', { id })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    event.sender.send('ai:error', { id, message })
  }
})

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  if (!isDev) registerAppProtocol()

  console.log('[electron] starting Next.js…')
  // Ensure JWT secret exists (for future auth use)
  getOrCreateSecret()
  await startNextJs()
  console.log('[electron] ready, opening window')
  await createWindow()

  // Check for updates
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  nextProc?.kill()
})

// ── Auto Update Events ───────────────────────────────────────────────────────
autoUpdater.on('update-available', (info) => {
  console.log('[updater] update available:', info.version)
  mainWindow?.webContents.send('app:update-available', info)
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('[updater] update downloaded:', info.version)
  mainWindow?.webContents.send('app:update-downloaded', info)
})

autoUpdater.on('error', (err) => {
  console.error('[updater] error:', err)
})
