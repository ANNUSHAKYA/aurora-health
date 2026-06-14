import { API_BASE } from '../constants/api'

export const api = {
  // Health
  logWater: (user_id: string, amount_ml: number) =>
    fetch(`${API_BASE}/health/hydration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, amount_ml }),
    }).then((r) => r.json()),

  getHydration: (user_id: string) =>
    fetch(`${API_BASE}/health/hydration/${user_id}`).then((r) => r.json()),

  logSleep: (user_id: string, duration_hours: number, quality = 'good') =>
    fetch(`${API_BASE}/health/sleep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, duration_hours, quality }),
    }).then((r) => r.json()),

  getSleep: (user_id: string) =>
    fetch(`${API_BASE}/health/sleep/${user_id}`).then((r) => r.json()),

  getHabits: (user_id: string) =>
    fetch(`${API_BASE}/health/habits/${user_id}`).then((r) => r.json()),

  createHabit: (user_id: string, name: string, icon: string, time_of_day: string) =>
    fetch(`${API_BASE}/health/habits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, name, icon, time_of_day }),
    }).then((r) => r.json()),

  completeHabit: (user_id: string, habit_id: number) =>
    fetch(`${API_BASE}/health/habits/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, habit_id }),
    }).then((r) => r.json()),

  getNutrition: (user_id: string) =>
    fetch(`${API_BASE}/health/nutrition/${user_id}`).then((r) => r.json()),

  logNutrition: (user_id: string, meal_type: string, description: string, calories: number) =>
    fetch(`${API_BASE}/health/nutrition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, meal_type, description, calories }),
    }).then((r) => r.json()),

  // Companion
  chat: (user_id: string, message: string, history: any[] = []) =>
    fetch(`${API_BASE}/companion/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, message, history }),
    }).then((r) => r.json()),

  // Profile
  getProfile: (user_id: string) =>
    fetch(`${API_BASE}/user/${user_id}`).then((r) => r.json()),

  updateProfile: (user_id: string, updates: any) =>
    fetch(`${API_BASE}/user/${user_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).then((r) => r.json()),
}
