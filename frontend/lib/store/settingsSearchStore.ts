import { create } from 'zustand'
import type { SettingEntry } from '@/lib/settings/settingsIndex'

/**
 * The settings search (⌘P / Ctrl+P). `reveal` asks the builder to show the
 * Style tab and the Customize panel to open the setting's tab, scroll to it
 * and highlight it. `nonce` makes picking the same setting twice still fire.
 */
interface SettingsSearchStore {
  open: boolean
  setOpen: (open: boolean) => void
  target: (SettingEntry & { nonce: number }) | null
  reveal: (entry: SettingEntry) => void
  clearTarget: () => void
}

export const useSettingsSearch = create<SettingsSearchStore>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  target: null,
  reveal: (entry) => set({ open: false, target: { ...entry, nonce: Date.now() } }),
  clearTarget: () => set({ target: null }),
}))
