import { create } from 'zustand'

interface SleepState {
  lastSleep: number | null
  weeklyAvg: number | null
  logs: any[]
  setLastSleep: (h: number) => void
  setWeeklyAvg: (h: number) => void
  setLogs: (logs: any[]) => void
}

export const useSleepStore = create<SleepState>((set) => ({
  lastSleep: null,
  weeklyAvg: null,
  logs: [],
  setLastSleep: (h) => set({ lastSleep: h }),
  setWeeklyAvg: (h) => set({ weeklyAvg: h }),
  setLogs: (logs) => set({ logs }),
}))
