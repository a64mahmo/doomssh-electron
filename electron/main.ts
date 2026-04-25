import { app, BrowserWindow, ipcMain, safeStorage, shell, dialog, protocol } from 'electron'
import { spawn, type ChildProcess } from 'child_process'
import path from 'path'
import fs from 'fs'
import Anthropic from '@anthropic-ai/sdk'
import { autoUpdater, type UpdateInfo } from 'electron-updater'
import type { Resume, JobApplication, JobsVaultFile } from '../frontend/lib/shared/types'

// ── Auto Update Config ────────────────────────────────────────────────────────
autoUpdater.logger = console
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = false // We'll control install manually

const isDev = process.env.NODE_ENV !== 'production' && (process.env.NODE_ENV === 'development' || !app.isPackaged)

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
  return isDev ? path.join(__dirname, '..', '..') : app.getAppPath()
}

// ── Spawn Next.js ─────────────────────────────────────────────────────────────
function startNextJs(): Promise<void> {
  if (!isDev) return Promise.resolve() // In production, we load static files directly

  return new Promise((resolve) => {
    const root = projectRoot()
    const frontendRoot = path.join(root, 'frontend')
    const cmd = 'node'
    const args = [
      path.join(frontendRoot, 'node_modules', 'next', 'dist', 'bin', 'next'),
      'dev',
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
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    titleBarOverlay: process.platform === 'win32' ? {
      color: '#00000000',
      symbolColor: '#94a3b8',
      height: 44
    } : false,
    vibrancy: 'under-window', // macOS
    visualEffectState: 'active', // macOS
    backgroundMaterial: 'acrylic', // Windows 11
    transparent: process.platform !== 'win32',
    icon: path.join(projectRoot(), isDev ? 'frontend/public/file.svg' : 'frontend/out/file.svg'),
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

// ── MIME type helper ─────────────────────────────────────────────────────────
const MIME: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  js:   'application/javascript',
  mjs:  'application/javascript',
  css:  'text/css',
  json: 'application/json',
  png:  'image/png',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  gif:  'image/gif',
  svg:  'image/svg+xml',
  ico:  'image/x-icon',
  woff: 'font/woff',
  woff2:'font/woff2',
  ttf:  'font/ttf',
  txt:  'text/plain',
}

// ── Custom Protocol ──────────────────────────────────────────────────────────
function registerAppProtocol() {
  const outDir = path.join(projectRoot(), 'frontend', 'out')
  
  // Cache for file contents to avoid repeated disk reads
  const fileCache = new Map<string, { data: Buffer; mtime: number }>()
  const CACHE_TTL = 30000 // 30 seconds for dynamic content

  protocol.handle('app', async (request) => {
    try {
      const url = request.url.replace('app://-', '')
      let relativePath = url.split(/[?#]/)[0]
      if (relativePath.startsWith('/')) relativePath = relativePath.slice(1)
      if (!relativePath || relativePath.endsWith('/')) relativePath += 'index.html'

      let fullPath = path.join(outDir, relativePath)

      try {
        await fs.promises.access(fullPath)
      } catch {
        if (relativePath.startsWith('builder/jobs')) {
          fullPath = path.join(outDir, 'builder', 'jobs', 'index.html')
        } else if (relativePath.startsWith('builder/')) {
          fullPath = path.join(outDir, 'builder', 'new', 'index.html')
        } else if (relativePath.startsWith('print/')) {
          fullPath = path.join(outDir, 'print', 'new', 'index.html')
        } else {
          fullPath = path.join(outDir, 'index.html')
        }
      }

      // Use cached data if available and not stale
      const stat = await fs.promises.stat(fullPath)
      const mtime = stat.mtimeMs
      const cached = fileCache.get(fullPath)
      
      if (cached && cached.mtime === mtime && (Date.now() - cached.mtime < CACHE_TTL)) {
        const ext = path.extname(fullPath).slice(1).toLowerCase()
        const isStatic = ['css', 'js', 'woff', 'woff2', 'ttf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico'].includes(ext)
        const cacheHeader = isStatic ? 'public, max-age=31536000, immutable' : 'no-cache'
        
        return new Response(cached.data, {
          headers: { 
            'Content-Type': MIME[ext] ?? 'application/octet-stream',
            'Cache-Control': cacheHeader,
          },
        })
      }

      const data = await fs.promises.readFile(fullPath)
      fileCache.set(fullPath, { data, mtime })
      
      const ext = path.extname(fullPath).slice(1).toLowerCase()
      const isStatic = ['css', 'js', 'woff', 'woff2', 'ttf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico'].includes(ext)
      const cacheHeader = isStatic ? 'public, max-age=31536000, immutable' : 'no-cache'

      return new Response(data, {
        headers: { 
          'Content-Type': MIME[ext] ?? 'application/octet-stream',
          'Cache-Control': cacheHeader,
        },
      })
    } catch (err) {
      console.error('Protocol error:', err)
      return new Response('Not Found', { status: 404 })
    }
  })
}

// ── Vault helpers ─────────────────────────────────────────────────────────────
const VAULT_PATH_FILE = path.join(app.getPath('userData'), 'vault-path.txt')
const fsp = fs.promises

async function readVaultDir(): Promise<string | null> {
  try {
    if (fs.existsSync(VAULT_PATH_FILE)) {
      const p = (await fsp.readFile(VAULT_PATH_FILE, 'utf8')).trim()
      if (p) return p
    }
    // Default vault directory in userData
    const defaultVault = path.join(app.getPath('userData'), 'vault')
    await fsp.mkdir(defaultVault, { recursive: true })
    return defaultVault
  } catch { return null }
}

function vaultFile(dir: string, id: string): string {
  return path.join(dir, `${id}.json`)
}

// ── IPC: Vault ────────────────────────────────────────────────────────────────
ipcMain.handle('vault:get', () => readVaultDir())

ipcMain.handle('vault:set', async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: 'Choose Vault Folder',
    properties: ['openDirectory', 'createDirectory'],
  })
  if (canceled || !filePaths[0]) return null
  await fsp.writeFile(VAULT_PATH_FILE, filePaths[0], 'utf8')
  return filePaths[0]
})

ipcMain.handle('resume:list', async () => {
  const dir = await readVaultDir()
  if (!dir) return []
  try {
    // Only look for .json files that don't start with an underscore (system files)
    const files = (await fsp.readdir(dir)).filter(f => f.endsWith('.json') && !f.startsWith('_'))
    
    const resumes = await Promise.all(
      files.map(async f => {
        try { 
          const content = await fsp.readFile(path.join(dir, f), 'utf8')
          const parsed = JSON.parse(content)
          // Validation: must look like a resume (have id and name)
          if (parsed && typeof parsed === 'object' && parsed.id && parsed.name) {
            return parsed
          }
          return null
        } catch (err) { 
          console.error(`[electron] failed to read/parse ${f}:`, err)
          return null 
        }
      })
    )
    
    const result = resumes
      .filter((r): r is Resume => r !== null)
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    
    return result
  } catch (err) { 
    console.error('[electron] readdir error:', err)
    return [] 
  }
})

ipcMain.handle('resume:read', async (_event, id: string): Promise<Resume | null> => {
  const dir = await readVaultDir()
  if (!dir) return null
  try { 
    const filePath = vaultFile(dir, id)
    const content = await fsp.readFile(filePath, 'utf8')
    return JSON.parse(content) as Resume
  } catch (err) { 
    console.error(`[electron] failed to read resume ${id}:`, err)
    return null 
  }
})

ipcMain.handle('resume:write', async (_event, resume: Resume) => {
  const dir = await readVaultDir()
  if (!dir) throw new Error('No vault set')
  const filePath = vaultFile(dir, resume.id)
  try {
    await fsp.mkdir(dir, { recursive: true })
    const content = JSON.stringify(resume)
    await fsp.writeFile(filePath, content, 'utf8')
    console.log(`[electron] wrote resume ${resume.id} (${content.length} bytes)`)
  } catch (err) {
    console.error(`[electron] failed to write resume ${resume.id}:`, err)
    throw err
  }
})

ipcMain.handle('resume:delete', async (_event, id: string) => {
  console.log('[electron] deleting resume:', id)
  const dir = await readVaultDir()
  if (!dir) return
  const filePath = vaultFile(dir, id)
  try { 
    if (fs.existsSync(filePath)) {
      await fsp.unlink(filePath) 
      console.log('[electron] deleted file:', filePath)
    } else {
      console.warn('[electron] file not found for deletion:', filePath)
    }
  } catch (err) { 
    console.error('[electron] unlink error:', err)
  }
})

// ── IPC: Jobs ────────────────────────────────────────────────────────────────
ipcMain.handle('jobs:read', async (): Promise<JobsVaultFile | null> => {
  const dir = await readVaultDir()
  if (!dir) return null
  try { 
    const filePath = path.join(dir, '_jobs.json')
    if (!fs.existsSync(filePath)) return null
    return JSON.parse(await fsp.readFile(filePath, 'utf8')) as JobsVaultFile
  } catch (err) { 
    console.error('[electron] failed to read jobs:', err)
    return null 
  }
})

ipcMain.handle('jobs:write', async (_event, data: JobsVaultFile) => {
  const dir = await readVaultDir()
  if (!dir) throw new Error('No vault set')
  const filePath = path.join(dir, '_jobs.json')
  try {
    await fsp.mkdir(dir, { recursive: true })
    const content = JSON.stringify(data)
    await fsp.writeFile(filePath, content, 'utf8')
    console.log(`[electron] wrote jobs file (${content.length} bytes)`)
  } catch (err) {
    console.error('[electron] failed to write jobs file:', err)
    throw err
  }
})

// ── IPC: API key management ───────────────────────────────────────────────────
ipcMain.handle('set-api-key', (_event, key: string) => storeApiKey(key))
ipcMain.handle('get-api-key', () => getStoredApiKey())

ipcMain.handle('set-debug-mode', (_event, enabled: boolean) => {
  const path = require('path')
  const fs = require('fs')
  const debugPath = path.join(app.getPath('userData'), 'debug.json')
  fs.writeFileSync(debugPath, JSON.stringify({ enabled }), 'utf8')
})

ipcMain.handle('get-debug-mode', () => {
  const path = require('path')
  const fs = require('fs')
  const debugPath = path.join(app.getPath('userData'), 'debug.json')
  if (!fs.existsSync(debugPath)) return false
  try {
    const data = JSON.parse(fs.readFileSync(debugPath, 'utf8'))
    return !!data.enabled
  } catch {
    return false
  }
})

ipcMain.handle('restart-and-install', () => {
  console.log('[updater] quitAndInstall called')
  try {
    // macOS requires this to be true for the underlying Squirrel.Mac framework
    // to actually apply the update when the app quits.
    autoUpdater.autoInstallOnAppQuit = true
    
    // Defer the quit to allow the IPC response to reach the frontend
    setTimeout(() => {
      autoUpdater.quitAndInstall(false, true)
    }, 100)
    
    return { success: true }
  } catch (err) {
    console.error('[updater] quitAndInstall error:', err)
    throw err
  }
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
autoUpdater.on('checking-for-update', () => {
  console.log('[updater] checking for update...')
  mainWindow?.webContents.send('app:update-checking')
})

autoUpdater.on('update-available', (info: UpdateInfo) => {
  console.log('[updater] update available:', info.version)
  mainWindow?.webContents.send('app:update-available', info)
})

autoUpdater.on('update-not-available', (info: UpdateInfo) => {
  console.log('[updater] update not available:', info.version)
  mainWindow?.webContents.send('app:update-not-available', info)
})

autoUpdater.on('download-progress', (progressObj) => {
  console.log('[updater] download progress:', progressObj.percent, 'bytesPerSecond:', progressObj.bytesPerSecond, 'transferred:', progressObj.transferred, 'total:', progressObj.total)
  mainWindow?.webContents.send('app:update-progress', progressObj)
})

autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
  console.log('[updater] update downloaded:', info.version)
  console.log('[updater] file paths:', (info as any).files)
  mainWindow?.webContents.send('app:update-downloaded', info)
})

autoUpdater.on('error', (err: Error) => {
  console.error('[updater] error:', err)
  // Send detailed error info to frontend for debugging
  const debugInfo = {
    message: err.message,
    stack: err.stack,
    name: err.name,
    cause: (err as any).cause,
  }
  mainWindow?.webContents.send('app:update-error', JSON.stringify(debugInfo))
})

ipcMain.handle('get-app-version', () => app.getVersion())

ipcMain.handle('update-window-controls', (_event, { color, symbolColor }: { color: string, symbolColor: string }) => {
  if (mainWindow && process.platform === 'win32') {
    mainWindow.setTitleBarOverlay({
      color: color,
      symbolColor: symbolColor,
      height: 44
    })
  }
})

ipcMain.handle('check-for-updates', async () => {
  if (isDev) return { message: 'In development mode', status: 'dev' }
  try {
    const result = await autoUpdater.checkForUpdates()
    return result
  } catch (err) {
    console.error('[updater] manual check error:', err)
    throw err
  }
})
