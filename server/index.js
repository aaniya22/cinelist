require('dotenv').config()
require('dns').setServers(['1.1.1.1', '8.8.8.8'])
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const WatchlistItem = require('./models/WatchlistItem')

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

app.get('/api/watchlist', async (req, res) => {
  try {
    const items = await WatchlistItem.find().sort({ createdAt: -1 })
    res.json(items)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/watchlist', async (req, res) => {
  const { tmdbId, mediaType, title, posterPath, releaseDate, overview, voteAverage } = req.body
  if (!tmdbId || !['movie', 'tv'].includes(mediaType) || !title) {
    return res.status(400).json({ error: 'Invalid item' })
  }
  try {
    const item = await WatchlistItem.create({
      tmdbId, mediaType, title, posterPath, releaseDate, overview, voteAverage,
    })
    res.status(201).json(item)
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Already in watchlist' })
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

app.patch('/api/watchlist/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' })
  const updates = {}
  if (typeof req.body.watched === 'boolean') updates.watched = req.body.watched
  if (typeof req.body.rating === 'number') updates.rating = req.body.rating
  try {
    const item = await WatchlistItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/api/watchlist/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const item = await WatchlistItem.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })