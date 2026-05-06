// MovieModal.jsx
// Popup showing full details for a movie or show.
// Opens when user clicks a poster. Closes on backdrop click or Escape key.

import { useEffect, useState } from 'react'

const IMG_BASE = 'https://image.tmdb.org/t/p/w500'
const TMDB_BASE = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_KEY

function getTitle(item) { return item.title || item.name || 'Unknown' }
function getYear(item) {
  const d = item.release_date || item.first_air_date || ''
  return d ? d.slice(0, 4) : '—'
}
function getType(item) {
  return item.media_type === 'tv' || item.first_air_date ? 'tv' : 'movie'
}

function MovieModal({ item, onClose, onAdd, inList }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch full details (genres, runtime, overview) from TMDB
  // This is a SECOND API call — the search only gives us basic info
  useEffect(() => {
    async function fetchDetail() {
      setLoading(true)
      try {
        const type = getType(item)
        const res = await fetch(
          `${TMDB_BASE}/${type}/${item.id}?api_key=${API_KEY}`
        )
        const data = await res.json()
        setDetail(data)
      } catch (e) {
        setDetail(null)
      }
      setLoading(false)
    }
    fetchDetail()
  }, [item.id])

  // Close on Escape key — good UX, interviewers notice this
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // The return is a "cleanup function" — runs when modal closes
    // Without it, the listener would pile up every time a modal opens
  }, [onClose])

  // Optional chaining (?.) = safe access on possibly-null values
  const genres = detail?.genres?.map(g => g.name) || []
  const runtime = detail?.runtime
    ? `${detail.runtime} min`
    : detail?.episode_run_time?.[0]
    ? `${detail.episode_run_time[0]} min/ep`
    : '—'
  const score = item.vote_average
    ? (item.vote_average / 2).toFixed(1) + ' / 5'
    : '—'
  const type = getType(item)

  return (
    // Clicking the dark backdrop closes the modal
    <div className="modal-backdrop" onClick={onClose}>
      {/* stopPropagation prevents clicks inside from bubbling up to backdrop */}
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-inner">
          {/* Poster */}
          <div className="modal-poster">
            {item.poster_path
              ? <img src={IMG_BASE + item.poster_path} alt={getTitle(item)} />
              : <div className="modal-poster-placeholder">🎬</div>
            }
          </div>

          {/* Info panel */}
          <div className="modal-info">
            <div className="modal-title">{getTitle(item)}</div>

            <div className="modal-meta-row">
              <span className="modal-badge">
                {type === 'tv' ? 'TV Show' : 'Film'}
              </span>
              <span className="modal-year">{getYear(item)}</span>
            </div>

            {loading ? (
              <div className="modal-loading">
                <div className="dot"/><div className="dot"/><div className="dot"/>
              </div>
            ) : (
              <>
                {/* 3 stat boxes */}
                <div className="modal-stats">
                  <div className="modal-stat">
                    <div className="modal-stat-label">TMDB Score</div>
                    <div className="modal-stat-value">{score}</div>
                  </div>
                  <div className="modal-stat">
                    <div className="modal-stat-label">Runtime</div>
                    <div className="modal-stat-value">{runtime}</div>
                  </div>
                  <div className="modal-stat">
                    <div className="modal-stat-label">Year</div>
                    <div className="modal-stat-value">{getYear(item)}</div>
                  </div>
                </div>

                {/* Genre chips */}
                {genres.length > 0 && (
                  <div className="modal-genres">
                    {genres.map(g => (
                      <span key={g} className="genre-chip">{g}</span>
                    ))}
                  </div>
                )}

                {/* Overview / description */}
                {detail?.overview && (
                  <>
                    <div className="modal-overview-label">Overview</div>
                    <div className="modal-overview">{detail.overview}</div>
                  </>
                )}
              </>
            )}

            {/* Add to watchlist button */}
            <button
              className={'modal-add-btn ' + (inList ? 'already-added' : '')}
              onClick={() => { if (!inList) { onAdd(item); onClose() } }}
            >
              {inList ? '✓ Already in your watchlist' : '+ Add to Watchlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieModal