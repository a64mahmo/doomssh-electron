import { create } from 'zustand'
import type { UIStore } from '@/lib/store/types'

export const useUIStore = create<UIStore>()((set) => ({
  activeSection: null,
  showAIPanel: false,
  previewZoom: 2.0,
  isExporting: false,
  selectedText: '',

  setActiveSection: (id) => set({ activeSection: id }),
  setShowAIPanel: (show) => set({ showAIPanel: show }),
  setPreviewZoom: (zoom) => set({ previewZoom: zoom }),
  setIsExporting: (exporting) => set({ isExporting: exporting }),
  setSelectedText: (text) => set({ selectedText: text }),
}))
