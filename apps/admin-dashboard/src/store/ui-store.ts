import { create } from 'zustand';

/**
 * Global UI state (Zustand per PLAN §3.2 — atomic, re-render friendly for the
 * large data views to come). Kept minimal for the basic home: sidebar
 * collapse state, persisted nowhere yet (UI-only phase).
 */
type UiState = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
}));
