// App.jsx — The "brain" of the whole app.
// All state lives here and gets passed down to child components.

import { useState, useEffect, useRef } from 'react'
import './App.css'
import MovieCard from './components/MovieCard'
import WatchlistItem from './components/WatchlistItem'
import MovieModal from './components/MovieModal'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const getType = (item) => item.media_type || (item.title ? 'movie' : 'tv')

// maps a DB document to the shape your components already expect
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

export default function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [watchlist, setWatchlist] = useState([])
  const [mediaType, setMediaType] = useState('multi')
  const [filter, setFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  // null = no modal open
  // When user clicks a poster, we set this to that movie object
  // When modal closes, we set it back to null

  const debounceRef = useRef(null)

  // Load watchlist from the API on first render
  useEffect(() => {
    fetch(`${API_BASE}/api/watchlist`)
      .then((res) => {
        if (!res.ok) throw new Error('API error ' + res.status)
        return res.json()
      })
      .then((data) => setWatchlist(data.map(fromDb)))
      .catch(() => setError('Could not load your watchlist.'))
  }, [])

  // Debounced search — waits 400ms after user stops typing
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

  // --- Watchlist functions ---

  async function addToWatchlist(item) {
    try {
      const res = await fetch(`${API_BASE}/api/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_BASE}/api/watchlist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_BASE}/api/watchlist/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('API error ' + res.status)
      setWatchlist((prev) => prev.filter((w) => w.id !== id))
    } catch (e) {
      setError('Could not remove item.')
    }
  }

  // --- Derived values ---

  const watchlistKeys = new Set(watchlist.map((w) => `${w.media_type}-${w.tmdbId}`))

  const filteredWatchlist = watchlist.filter((w) => {
    if (filter === 'watched') return w.watched
    if (filter === 'unwatched') return !w.watched
    return true
  })

  const watchedCount = watchlist.filter((w) => w.watched).length

  const ratedItems = watchlist.filter((w) => w.rating > 0)
  const avgRating =
    ratedItems.length
      ? (ratedItems.reduce((sum, w) => sum + w.rating, 0) / ratedItems.length).toFixed(1)
      : '—'

  return (
    <div className="layout">

      {/* ── Header ── */}
      <header>
        <div className="logo">
          <span className="logo-dot" />
          CineList
        </div>
        <div className="header-stats">
          <span><span className="stat-val">{watchlist.length}</span> in list</span>
          <span><span className="stat-val">{watchedCount}</span> watched</span>
          <span>avg <span className="stat-val">{avgRating}</span></span>
        </div>
      </header>

      {/* ── Main search area ── */}
      <main className="main-area">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            placeholder="Search movies & shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="type-tabs">
          {[['multi', 'All'], ['movie', 'Movies'], ['tv', 'TV Shows']].map(([val, label]) => (
            <button
              key={val}
              className={'tab-btn ' + (mediaType === val ? 'active' : '')}
              onClick={() => setMediaType(val)}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="loading-dots">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="section-label">{results.length} results</div>
            <div className="results-grid">
              {results.map((item) => (
                <MovieCard
                  key={item.id}
                  item={item}
                  inList={watchlistKeys.has(`${getType(item)}-${item.id}`)}
                  onAdd={() => setSelectedItem(item)}
                  // Clicking a card now opens the modal instead of adding directly
                  // The modal has the "Add to Watchlist" button inside it
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">{query ? '🔍' : '🎬'}</div>
            <div className="empty-title">
              {query ? 'No results found' : 'Search for a movie or show'}
            </div>
            <div className="empty-sub">
              {query ? 'Try a different search term' : 'Type anything above to get started'}
            </div>
          </div>
        )}
      </main>

      {/* ── Sidebar watchlist ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">My Watchlist</div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {watchlist.length} titles
          </span>
        </div>

        <div className="filter-tabs">
          {[['all', 'All'], ['unwatched', 'Unwatched'], ['watched', 'Watched']].map(([val, label]) => (
            <button
              key={val}
              className={'filter-btn ' + (filter === val ? 'active' : '')}
              onClick={() => setFilter(val)}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredWatchlist.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 12px' }}>
            <div className="empty-icon">📋</div>
            <div className="empty-title">
              {filter === 'all' ? 'Your list is empty' : 'Nothing here yet'}
            </div>
            <div className="empty-sub">
              {filter === 'all' ? 'Click any movie to add it' : 'Mark some items as ' + filter}
            </div>
          </div>
        ) : (
          filteredWatchlist.map((item) => (
            <WatchlistItem
              key={item.id}
              item={item}
              onToggleWatched={toggleWatched}
              onRate={rateItem}
              onRemove={removeItem}
            />
          ))
        )}
      </aside>

      {/* ── Modal — only renders when a movie is selected ── */}
      {selectedItem && (
        <MovieModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={addToWatchlist}
          inList={watchlistKeys.has(`${getType(selectedItem)}-${selectedItem.id}`)}
        />
      )}

    </div>
  )
}