const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')

// ── Log water ──────────────────────────────────────────────
router.post('/hydration', async (req, res) => {
  const { user_id, amount_ml } = req.body
  const { data, error } = await supabase
    .from('hydration_logs')
    .insert([{ user_id, amount_ml }])
    .select()
  if (error) return res.status(400).json({ error: error.message })
  res.json({ success: true, data })
})

// ── Get today's hydration ──────────────────────────────────
router.get('/hydration/:user_id', async (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('hydration_logs')
    .select('*')
    .eq('user_id', req.params.user_id)
    .gte('logged_at', `${today}T00:00:00`)
    .order('logged_at', { ascending: false })
  if (error) return res.status(400).json({ error: error.message })
  const total = data?.reduce((sum, l) => sum + l.amount_ml, 0) || 0
  res.json({ logs: data, total_ml: total })
})

// ── Log sleep ──────────────────────────────────────────────
router.post('/sleep', async (req, res) => {
  const { user_id, duration_hours, quality } = req.body
  const { data, error } = await supabase
    .from('sleep_logs')
    .insert([{ user_id, duration_hours, quality }])
    .select()
  if (error) return res.status(400).json({ error: error.message })
  res.json({ success: true, data })
})

// ── Get sleep history ──────────────────────────────────────
router.get('/sleep/:user_id', async (req, res) => {
  const { data, error } = await supabase
    .from('sleep_logs')
    .select('*')
    .eq('user_id', req.params.user_id)
    .order('logged_at', { ascending: false })
    .limit(7)
  if (error) return res.status(400).json({ error: error.message })
  res.json({ logs: data })
})

// ── Get/Create/Complete habits ─────────────────────────────
router.get('/habits/:user_id', async (req, res) => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', req.params.user_id)
    .eq('is_active', true)
  if (error) return res.status(400).json({ error: error.message })
  res.json({ habits: data })
})

router.post('/habits', async (req, res) => {
  const { user_id, name, icon, time_of_day } = req.body
  const { data, error } = await supabase
    .from('habits')
    .insert([{ user_id, name, icon, time_of_day }])
    .select()
  if (error) return res.status(400).json({ error: error.message })
  res.json({ success: true, data })
})

router.post('/habits/complete', async (req, res) => {
  const { user_id, habit_id } = req.body
  const { data, error } = await supabase
    .from('habit_logs')
    .insert([{ user_id, habit_id, status: 'completed' }])
    .select()
  if (error) return res.status(400).json({ error: error.message })
  res.json({ success: true, data })
})

// ── Log nutrition ──────────────────────────────────────────
router.post('/nutrition', async (req, res) => {
  const { user_id, meal_type, description, calories } = req.body
  const { data, error } = await supabase
    .from('nutrition_logs')
    .insert([{ user_id, meal_type, description, calories }])
    .select()
  if (error) return res.status(400).json({ error: error.message })
  res.json({ success: true, data })
})

router.get('/nutrition/:user_id', async (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', req.params.user_id)
    .gte('logged_at', `${today}T00:00:00`)
  if (error) return res.status(400).json({ error: error.message })
  res.json({ logs: data })
})

module.exports = router
