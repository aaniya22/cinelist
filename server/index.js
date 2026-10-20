require('dotenv').config()
require('dns').setServers(['1.1.1.1', '8.8.8.8'])
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const WatchlistItem = require('./models/WatchlistItem')
const User = require('./models/User')
const auth = require('./middleware/auth')

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

const DISCOVER = {
  popular: '/trending/all/week',
  latest: '/movie/now_playing',
  top_rated: '/movie/top_rated',
  recommended: '/tv/popular',
}

app.get('/api/discover', async (req, res) => {
  const { tab = 'popular' } = req.query
  const path = DISCOVER[tab]
  if (!path) return res.status(400).json({ error: 'Invalid tab' })

  try {
    const r = await fetch(`${TMDB_BASE}${path}?api_key=${process.env.TMDB_KEY}`)
    if (!r.ok) return res.status(502).json({ error: 'TMDB error ' + r.status })
    const data = await r.json()
    const fallback = path.startsWith('/tv') ? 'tv' : 'movie'
    const results = (data.results || [])
      .filter((x) => x.poster_path)
      .map((x) => ({ ...x, media_type: x.media_type || fallback }))
      .slice(0, 20)
    res.json({ results })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/details/:type/:id', async (req, res) => {
  const { type, id } = req.params
  const region = String(req.query.region || 'IN').toUpperCase().slice(0, 2)
  if (!['movie', 'tv'].includes(type) || !/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  try {
    const url = `${TMDB_BASE}/${type}/${id}?append_to_response=credits,videos,watch/providers&api_key=${process.env.TMDB_KEY}`
    const r = await fetch(url)
    if (!r.ok) return res.status(502).json({ error: 'TMDB error ' + r.status })
    const d = await r.json()

    const makers =
      type === 'tv'
        ? (d.created_by || []).map((p) => p.name)
        : (d.credits?.crew || []).filter((c) => c.job === 'Director').map((c) => c.name)

    const vids = (d.videos?.results || []).filter((v) => v.site === 'YouTube')
    const trailer = vids.find((v) => v.type === 'Trailer') || vids[0]

    const wp = d['watch/providers']?.results?.[region] || {}
    const pick = (list) => (list || []).map((p) => ({ name: p.provider_name, logo: p.logo_path }))

    res.json({
      id: d.id,
      mediaType: type,
      title: d.title || d.name,
      tagline: d.tagline,
      overview: d.overview,
      backdrop: d.backdrop_path,
      release: d.release_date || d.first_air_date,
      runtime: type === 'movie' ? d.runtime : d.episode_run_time?.[0] || null,
      seasons: d.number_of_seasons,
      episodes: d.number_of_episodes,
      genres: (d.genres || []).map((g) => g.name),
      rating: d.vote_average,
      status: d.status,
      makers,
      cast: (d.credits?.cast || []).slice(0, 10).map((c) => ({
        name: c.name,
        character: c.character,
        photo: c.profile_path,
      })),
      trailer: trailer ? trailer.key : null,
      watch: {
        region,
        link: wp.link || null,
        stream: pick(wp.flatrate),
        rent: pick(wp.rent),
        buy: pick(wp.buy),
      },
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body
  if (typeof email !== 'string' || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Email and a password of 6+ characters required' })
  }
  try {
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, password: hash })
    res.status(201).json({ token: signToken(user), email: user.email })
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Email already registered' })
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password required' })
  }
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    res.json({ token: signToken(user), email: user.email })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/watchlist', auth, async (req, res) => {
  try {
    const items = await WatchlistItem.find({ user: req.userId }).sort({ createdAt: -1 })
    res.json(items)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/watchlist', auth, async (req, res) => {
  const { tmdbId, mediaType, title, posterPath, releaseDate, overview, voteAverage } = req.body
  if (!tmdbId || !['movie', 'tv'].includes(mediaType) || !title) {
    return res.status(400).json({ error: 'Invalid item' })
  }
  try {
    const item = await WatchlistItem.create({
      user: req.userId,
      tmdbId, mediaType, title, posterPath, releaseDate, overview, voteAverage,
    })
    res.status(201).json(item)
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Already in watchlist' })
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

app.patch('/api/watchlist/:id', auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' })
  const updates = {}
  if (typeof req.body.watched === 'boolean') updates.watched = req.body.watched
  if (typeof req.body.rating === 'number') updates.rating = req.body.rating
  try {
    const item = await WatchlistItem.findOneAndUpdate({ _id: req.params.id, user: req.userId }, updates, {
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

app.delete('/api/watchlist/:id', auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    const item = await WatchlistItem.findOneAndDelete({ _id: req.params.id, user: req.userId })
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected')
    await WatchlistItem.syncIndexes()
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })