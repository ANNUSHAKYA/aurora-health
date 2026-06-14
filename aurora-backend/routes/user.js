const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')

// Get profile
router.get('/:user_id', async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.params.user_id)
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.json({ profile: data })
})

// Update profile
router.put('/:user_id', async (req, res) => {
  const { user_id } = req.params
  const updates = req.body
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user_id)
    .select()
  if (error) return res.status(400).json({ error: error.message })
  res.json({ success: true, data })
})

module.exports = router
