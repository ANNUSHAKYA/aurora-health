import { create } from 'zustand'

interface UserState {
  userId: string | null
  profile: any | null
  isAuthenticated: boolean
  setUserId: (id: string) => void
  setProfile: (profile: any) => void
  setAuthenticated: (val: boolean) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  profile: null,
  isAuthenticated: false,
  setUserId: (id) => set({ userId: id }),
  setProfile: (profile) => set({ profile }),
  setAuthenticated: (val) => set({ isAuthenticated: val }),
  logout: () => set({ userId: null, profile: null, isAuthenticated: false }),
}))
