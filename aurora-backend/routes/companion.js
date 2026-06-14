const express = require('express')
const router = express.Router()
const { runAuroraAgent } = require('../agent/auroraAgent')

// Main AI chat endpoint
router.post('/chat', async (req, res) => {
  const { message, user_id, history } = req.body

  if (!message || !user_id) {
    return res.status(400).json({ error: 'message and user_id are required' })
  }

  try {
    const result = await runAuroraAgent({ message, user_id, history })
    res.json(result)
  } catch (err) {
    console.error('Agent error:', err)
    res.status(500).json({ error: 'Agent failed', details: err.message })
  }
})

// Transcribe voice to text (Groq Whisper)
router.post('/transcribe', async (req, res) => {
  // For now return empty — in production send audio to Groq Whisper
  // const audioFile = req.file
  // const transcription = await groq.audio.transcriptions.create({
  //   file: fs.createReadStream(audioFile.path),
  //   model: 'whisper-large-v3',
  // })
  res.json({ text: '' })
})

module.exports = router
