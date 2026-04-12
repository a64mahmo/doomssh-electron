import { create } from "zustand";
import type { UIStore } from "@/lib/store/types";

export const useUIStore = create<UIStore>()((set) => ({
  activeSection: null,
  showAIPanel: false,
  previewZoom: 0.7,
  isExporting: false,
  selectedText: "",
  errors: [],
  globalDebugMode: false,

  setActiveSection: (id) => set({ activeSection: id }),
  setShowAIPanel: (show) => set({ showAIPanel: show }),
  setPreviewZoom: (zoom) => set({ previewZoom: zoom }),
  setIsExporting: (exporting) => set({ isExporting: exporting }),
  setSelectedText: (text) => set({ selectedText: text }),
  addError: (error) => set((state) => ({ errors: [...state.errors, error] })),
  clearErrors: () => set({ errors: [] }),
  setGlobalDebugMode: (enabled) => set({ globalDebugMode: enabled }),
}));
