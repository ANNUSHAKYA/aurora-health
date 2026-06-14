import { create } from 'zustand'

interface HydrationState {
  totalMl: number
  goalMl: number
  logs: any[]
  setTotal: (ml: number) => void
  setGoal: (ml: number) => void
  setLogs: (logs: any[]) => void
  addWater: (ml: number) => void
}

export const useHydrationStore = create<HydrationState>((set) => ({
  totalMl: 0,
  goalMl: 2500,
  logs: [],
  setTotal: (ml) => set({ totalMl: ml }),
  setGoal: (ml) => set({ goalMl: ml }),
  setLogs: (logs) => set({ logs }),
  addWater: (ml) => set((state) => ({ totalMl: state.totalMl + ml })),
}))
