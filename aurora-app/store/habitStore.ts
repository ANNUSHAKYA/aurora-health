import { create } from 'zustand'

interface HabitState {
  habits: any[]
  completedIds: number[]
  setHabits: (habits: any[]) => void
  markComplete: (id: number) => void
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  completedIds: [],
  setHabits: (habits) => set({ habits }),
  markComplete: (id) =>
    set((state) => ({ completedIds: [...state.completedIds, id] })),
}))
