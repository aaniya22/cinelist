import { createContext, useContext, useState, useEffect, useRef } from 'react'

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const getType = (item) => item.media_type || (item.title ? 'movie' : 'tv')

// maps a DB document to the shape the components already expect
const fromDb = (d) => ({
  id: d._id,
  tmdbId: d.tmdbId,
  media_type: d.mediaType,
  title: d.mediaType === 'movie' ? d.title : undefined,
  name: d.mediaType === 'tv' ? d.title : undefined,
  poster_path: d.posterPath,
  release_date: d.mediaType === 'movie' ? d.releaseDate : undefined,
  first_air_date: d.mediaType === 'tv' ? d.releaseDate : undefined,
  overview: d.overview,
  vote_average: d.voteAverage,
  watched: d.watched,
  rating: d.rating,
  addedAt: d.createdAt,
})

const AppContext = createContext(null)

export function useApp() {
  return useContext(AppContext)
}

export function AppProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cinelist-token'))
  const [watchlist, setWatchlist] = useState([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mediaType, setMediaType] = useState('multi')
  const debounceRef = useRef(null)

  function handleAuth(data) {
    localStorage.setItem('cinelist-token', data.token)
    setToken(data.token)
  }

  function logout() {
    localStorage.removeItem('cinelist-token')
    setToken(null)
    setWatchlist([])
  }

  function authFetch(path, options = {}) {
    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (res.status === 401) logout()
      return res
    })
  }

  // Load watchlist once logged in
  useEffect(() => {
    if (!token) return
    authFetch('/api/watchlist')
      .then((res) => {
        if (!res.ok) throw new Error('API error ' + res.status)
        return res.json()
      })
      .then((data) => setWatchlist(data.map(fromDb)))
      .catch(() => setError('Could not load your watchlist.'))
  }, [token])

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      search(query, mediaType)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [query, mediaType])

  async function search(q, type) {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `${API_BASE}/api/search?query=${encodeURIComponent(q)}&type=${type}`
      )
      if (!res.ok) throw new Error('API error ' + res.status)
      const data = await res.json()
      const filtered = (data.results || []).filter(
        (r) => r.media_type !== 'person' && (r.poster_path || r.title || r.name)
      )
      setResults(filtered.slice(0, 20))
    } catch (e) {
      setError('Could not fetch results. Is the server running?')
      setResults([])
    }
    setLoading(false)
  }

  async function addToWatchlist(item) {
    try {
      const res = await authFetch('/api/watchlist', {
        method: 'POST',
        body: JSON.stringify({
          tmdbId: item.id,
          mediaType: getType(item),
          title: item.title || item.name,
          posterPath: item.poster_path,
          releaseDate: item.release_date || item.first_air_date,
          overview: item.overview,
          voteAverage: item.vote_average,
        }),
      })
      if (res.status === 409) return
      if (!res.ok) throw new Error('API error ' + res.status)
      const created = fromDb(await res.json())
      setWatchlist((prev) => [created, ...prev])
    } catch (e) {
      setError('Could not add to watchlist.')
    }
  }

  async function updateItem(id, changes) {
    try {
      const res = await authFetch(`/api/watchlist/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(changes),
      })
      if (!res.ok) throw new Error('API error ' + res.status)
      const updated = fromDb(await res.json())
      setWatchlist((prev) => prev.map((w) => (w.id === id ? updated : w)))
    } catch (e) {
      setError('Could not update watchlist.')
    }
  }

  function toggleWatched(id) {
    const item = watchlist.find((w) => w.id === id)
    if (item) updateItem(id, { watched: !item.watched })
  }

  function rateItem(id, rating) {
    updateItem(id, { rating })
  }

  async function removeItem(id) {
    try {
      const res = await authFetch(`/api/watchlist/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('API error ' + res.status)
      setWatchlist((prev) => prev.filter((w) => w.id !== id))
    } catch (e) {
      setError('Could not remove item.')
    }
  }

  // Derived values
  const watchlistKeys = new Set(watchlist.map((w) => `${w.media_type}-${w.tmdbId}`))
  const watchedCount = watchlist.filter((w) => w.watched).length
  const ratedItems = watchlist.filter((w) => w.rating > 0)
  const avgRating = ratedItems.length
    ? (ratedItems.reduce((sum, w) => sum + w.rating, 0) / ratedItems.length).toFixed(1)
    : '—'

  const value = {
    token, handleAuth, logout,
    watchlist, watchlistKeys, watchedCount, avgRating,
    query, setQuery, results, loading, error, setError, mediaType, setMediaType,
    addToWatchlist, toggleWatched, rateItem, removeItem,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
