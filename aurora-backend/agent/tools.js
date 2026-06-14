const supabase = require('../supabaseClient')

// ─── TOOL 1: log_water ────────────────────────────────────
// Adds water intake to hydration_logs table
async function log_water({ user_id, amount_ml }) {
  const { data, error } = await supabase
    .from('hydration_logs')
    .insert([{ user_id, amount_ml }])
    .select()

  if (error) return { success: false, message: error.message }
  return {
    success: true,
    message: `Logged ${amount_ml}ml of water successfully.`,
    data
  }
}

// ─── TOOL 2: log_sleep ───────────────────────────────────
// Records how many hours the user slept
async function log_sleep({ user_id, duration_hours, quality = 'good' }) {
  const { data, error } = await supabase
    .from('sleep_logs')
    .insert([{ user_id, duration_hours, quality }])
    .select()

  if (error) return { success: false, message: error.message }
  return {
    success: true,
    message: `Logged ${duration_hours} hours of sleep.`,
    data
  }
}

// ─── TOOL 3: create_habit ────────────────────────────────
// Creates a new habit for the user
async function create_habit({ user_id, name, time_of_day = 'anytime', icon = '⭐' }) {
  const { data, error } = await supabase
    .from('habits')
    .insert([{ user_id, name, time_of_day, icon }])
    .select()

  if (error) return { success: false, message: error.message }
  return {
    success: true,
    message: `Created habit "${name}" successfully.`,
    data
  }
}

// ─── TOOL 4: complete_habit ──────────────────────────────
// Marks a habit as completed for today
async function complete_habit({ user_id, habit_name }) {
  // First find the habit by name
  const { data: habits, error: findError } = await supabase
    .from('habits')
    .select('id, name')
    .eq('user_id', user_id)
    .ilike('name', `%${habit_name}%`)
    .eq('is_active', true)
    .limit(1)

  if (findError || !habits?.length) {
    return { success: false, message: `Could not find habit "${habit_name}"` }
  }

  const habit = habits[0]

  const { error } = await supabase
    .from('habit_logs')
    .insert([{ user_id, habit_id: habit.id, status: 'completed' }])

  if (error) return { success: false, message: error.message }
  return {
    success: true,
    message: `Marked "${habit.name}" as completed! Great work.`
  }
}

// ─── TOOL 5: get_health_summary ──────────────────────────
// Fetches today's stats — used to give the AI context
async function get_health_summary({ user_id }) {
  const today = new Date().toISOString().split('T')[0]

  // Today's water
  const { data: waterLogs } = await supabase
    .from('hydration_logs')
    .select('amount_ml')
    .eq('user_id', user_id)
    .gte('logged_at', `${today}T00:00:00`)

  const totalWater = waterLogs?.reduce((sum, l) => sum + l.amount_ml, 0) || 0

  // Last sleep
  const { data: sleepLogs } = await supabase
    .from('sleep_logs')
    .select('duration_hours, quality')
    .eq('user_id', user_id)
    .order('logged_at', { ascending: false })
    .limit(1)

  const lastSleep = sleepLogs?.[0] || null

  // Today's habits
  const { data: habits } = await supabase
    .from('habits')
    .select('id, name')
    .eq('user_id', user_id)
    .eq('is_active', true)

  const { data: completedLogs } = await supabase
    .from('habit_logs')
    .select('habit_id')
    .eq('user_id', user_id)
    .gte('completed_at', `${today}T00:00:00`)

  const completedIds = completedLogs?.map(l => l.habit_id) || []
  const completedHabits = habits?.filter(h => completedIds.includes(h.id)) || []

  // Profile for water goal
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, daily_water_goal_ml')
    .eq('id', user_id)
    .single()

  return {
    success: true,
    summary: {
      name: profile?.name || 'User',
      water: {
        logged_ml: totalWater,
        goal_ml: profile?.daily_water_goal_ml || 2500,
        remaining_ml: Math.max(0, (profile?.daily_water_goal_ml || 2500) - totalWater)
      },
      sleep: lastSleep,
      habits: {
        total: habits?.length || 0,
        completed: completedHabits.length,
        pending: (habits?.length || 0) - completedHabits.length
      }
    }
  }
}

// ─── TOOL 6: log_nutrition ───────────────────────────────
// Logs a meal for the user
async function log_nutrition({ user_id, meal_type, description, calories = 0 }) {
  const { data, error } = await supabase
    .from('nutrition_logs')
    .insert([{ user_id, meal_type, description, calories }])
    .select()

  if (error) return { success: false, message: error.message }
  return {
    success: true,
    message: `Logged your ${meal_type}: "${description}".`,
    data
  }
}

module.exports = {
  log_water,
  log_sleep,
  create_habit,
  complete_habit,
  get_health_summary,
  log_nutrition
}
