const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/health', require('./routes/health'))
app.use('/api/companion', require('./routes/companion'))
app.use('/api/user', require('./routes/user'))

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Aurora backend running ✅' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🌟 Aurora backend running on port ${PORT}`)
})
