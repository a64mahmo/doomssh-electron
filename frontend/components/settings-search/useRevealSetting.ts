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
    let frame = 0
    let raf = 0
    const tick = () => {
      frame++
      const root = scrollRef.current
      if (root) {
        if (!target.group) {
          root.scrollTo({ top: 0, behavior: 'smooth' })
          clearTarget()
          return
        }
        const el = findSettingElement(root, target.group, target.label, frame > 45)
        if (el) {
          highlight(el)
          clearTarget()
          return
        }
      }
      // The tab or panel change animates in; keep looking for about a second.
      if (frame < 60) raf = requestAnimationFrame(tick)
      else clearTarget()
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // `accepts` and `open` are fresh closures each render; the target drives this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, clearTarget, scrollRef])
}
