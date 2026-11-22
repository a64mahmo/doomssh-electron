'use client'
import { useEffect, type RefObject } from 'react'
import { useSettingsSearch } from '@/lib/store/settingsSearchStore'
import type { SettingEntry } from '@/lib/settings/settingsIndex'

/**
 * The control for a search result: its row inside its group, or the group when
 * the control is not shown right now (it depends on another setting), or null
 * while the panel is still rendering.
 */
export function findSettingElement(root: HTMLElement, group: string | undefined, label: string, settled: boolean) {
  const esc = (v: string) => (typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(v) : v.replace(/"/g, '\\"'))
  const groupEl = group ? root.querySelector<HTMLElement>(`[data-control-group="${esc(group)}"]`) : null
  const scope = groupEl ?? root
  const labelEl = scope.querySelector<HTMLElement>(`[data-setting-label="${esc(label)}"]`)
  if (labelEl) return labelEl.closest<HTMLElement>('[data-setting-row]') ?? fieldOf(labelEl, scope)
  if (label === group && groupEl) return groupEl
  if (settled) return groupEl
  return null
}

/** Wait this long after opening a tab or section before looking (its animation). */
const SETTLE_MS = 220
/** Stop looking after this long. */
const GIVE_UP_MS = 1500

/** What a person edits; preferred over buttons (a field's Remove button sits by its label). */
const FIELD_CONTROLS = 'input:not([type="hidden"]), textarea, select, [role="switch"], [role="slider"], [contenteditable="true"]'
const CONTROLS = `${FIELD_CONTROLS}, button, [tabindex="0"]`

/**
 * The field a label belongs to: the nearest ancestor that also holds a
 * control (a label's own wrapper often holds only the label and an icon),
 * never going past `limit`.
 */
function fieldOf(labelEl: HTMLElement, limit: HTMLElement): HTMLElement {
  for (const selector of [FIELD_CONTROLS, CONTROLS]) {
    let el: HTMLElement | null = labelEl.parentElement
    while (el && el !== limit) {
      if (el.querySelector(selector)) return el
      el = el.parentElement
    }
  }
  return labelEl.parentElement ?? labelEl
}

/**
 * Scroll to `el`, flash it once and focus its first control. The flash uses
 * the Web Animations API, not a class: React re-renders the panel right away
 * and would drop a class it did not set.
 */
function highlight(el: HTMLElement) {
  el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  const ring = getComputedStyle(document.documentElement).getPropertyValue('--ring').trim() || '#3b82f6'
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  el.animate?.(
    [
      { boxShadow: `0 0 0 2px ${ring}`, backgroundColor: `color-mix(in oklab, ${ring} 12%, transparent)`, borderRadius: '8px' },
      { boxShadow: `0 0 0 2px ${ring}`, backgroundColor: `color-mix(in oklab, ${ring} 12%, transparent)`, borderRadius: '8px', offset: 0.3 },
      { boxShadow: '0 0 0 2px transparent', backgroundColor: 'transparent', borderRadius: '8px' },
    ],
    { duration: reduce ? 1200 : 1600, easing: 'ease-out' },
  )
  el.dataset.settingFlash = ''
  window.setTimeout(() => delete el.dataset.settingFlash, 1600)
  ;(el.querySelector<HTMLElement>(FIELD_CONTROLS) ?? el.querySelector<HTMLElement>(CONTROLS))?.focus({ preventScroll: true })
}

/**
 * Lets a panel answer the builder search. When a result it `accepts` is picked,
 * `open` shows the right tab or section; then, once that has rendered, the
 * result's control is scrolled to, highlighted and focused. A result with no
 * `group` is a whole tab or section: the panel just scrolls to its top.
 */
export function useRevealSetting(
  scrollRef: RefObject<HTMLElement | null>,
  accepts: (entry: SettingEntry) => boolean,
  open: (entry: SettingEntry) => void,
) {
  const target = useSettingsSearch((s) => s.target)
  const clearTarget = useSettingsSearch((s) => s.clearTarget)

  useEffect(() => {
    if (!target || !accepts(target)) return
    open(target)
    const started = performance.now()
    let raf = 0
    const find = (settled: boolean) => {
      const root = scrollRef.current
      return root ? findSettingElement(root, target.group, target.label, settled) : null
    }
    const tick = () => {
      const elapsed = performance.now() - started
      const root = scrollRef.current
      // Tabs and sections animate out before the new one mounts (about 150ms),
      // so anything found sooner may be the outgoing copy.
      if (root && elapsed >= SETTLE_MS) {
        if (!target.group) {
          root.scrollTo({ top: 0, behavior: 'smooth' })
          clearTarget()
          return
        }
        const el = find(elapsed > GIVE_UP_MS * 0.75)
        if (el) {
          highlight(el)
          clearTarget()
          // If the panel still swapped the content after all, find it again.
          // Not cancelled on cleanup: clearing the target re-runs this effect.
          window.setTimeout(() => {
            if (el.isConnected) return
            const again = find(true)
            if (again) highlight(again)
          }, 400)
          return
        }
      }
      if (elapsed < GIVE_UP_MS) raf = requestAnimationFrame(tick)
      else clearTarget()
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // `accepts` and `open` are fresh closures each render; the target drives this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, clearTarget, scrollRef])
}
