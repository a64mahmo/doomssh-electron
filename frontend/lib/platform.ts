/**
 * Which build this is: the Electron desktop app or the browser site (Cloudflare).
 *
 * Set NEXT_PUBLIC_APP_PLATFORM at *build* time:
 *   - "web"      — Cloudflare: Workers & Pages → your project → Settings → Build →
 *                  Variables and secrets (a build variable, not a runtime secret)
 *   - "electron" — the desktop build (root package.json "build" script)
 * `next build` inlines NEXT_PUBLIC_* values into the static export, so setting it
 * only at runtime has no effect. Left unset, the platform is detected from the
 * Electron preload bridge (window.electron).
 */
export type AppPlatform = 'web' | 'electron'

const configured = process.env.NEXT_PUBLIC_APP_PLATFORM

export function appPlatform(): AppPlatform {
  if (configured === 'web' || configured === 'electron') return configured
  return typeof window !== 'undefined' && window.electron ? 'electron' : 'web'
}

export const isElectron = (): boolean => appPlatform() === 'electron'
export const isWeb = (): boolean => appPlatform() === 'web'
