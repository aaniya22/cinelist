require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 5000
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TYPES = ['multi', 'movie', 'tv']

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.get('/api/search', async (req, res) => {
  const { query, type = 'multi' } = req.query
  if (!query || !query.trim()) return res.json({ results: [] })
  if (!TYPES.includes(type)) return res.status(400).json({ error: 'Invalid type' })

  try {
    const url = `${TMDB_BASE}/search/${type}?query=${encodeURIComponent(query)}&include_adult=false&api_key=${process.env.TMDB_KEY}`
    const r = await fetch(url)
    if (!r.ok) return res.status(502).json({ error: 'TMDB error ' + r.status })
    const data = await r.json()
    res.json({ results: data.results || [] })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))