import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp, getType } from '../context/AppContext'
import MovieDetail from './MovieDetail'
import '../search.css'

const IMG = 'https://image.tmdb.org/t/p/w342'
const TYPES = [
  ['multi', 'All'],
  ['movie', 'Films'],
  ['tv', 'TV shows'],
]

const getTitle = (i) => i.title || i.name || 'Unknown'
const getYear = (i) => (i.release_date || i.first_air_date || '').slice(0, 4) || '—'
const getKind = (i) => (getType(i) === 'tv' ? 'TV' : 'FILM')

export default function SearchPage() {
  const {
    query, setQuery, results, loading, error,
    mediaType, setMediaType, addToWatchlist, watchlistKeys,
  } = useApp()
  const [flipKey, setFlipKey] = useState(null)
  const [open, setOpen] = useState(null)

  return (
    <div>
      <h1 className="page-title">Search</h1>

      <input
        className="sp-input"
        type="text"
        placeholder="Search films and shows…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      <div className="sp-types">
        {TYPES.map(([key, label]) => (
          <button
            key={key}
            className={'sp-type mono' + (mediaType === key ? ' active' : '')}
            onClick={() => setMediaType(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <div className="sp-msg mono">{error}</div>}
      {loading && <div className="sp-msg mono">SEARCHING…</div>}
      {!loading && !error && !query.trim() && (
        <div className="sp-msg mono">TYPE ABOVE TO SEARCH</div>
      )}
      {!loading && !error && query.trim() && results.length === 0 && (
        <div className="sp-msg mono">NO RESULTS</div>
      )}

      <div className="sp-grid">
        {results.map((item) => {
          const inList = watchlistKeys.has(`${getType(item)}-${item.id}`)
          return (
            <motion.article
              className="sp-card"
              key={`${getType(item)}-${item.id}`}
              style={{ transformPerspective: 900 }}
              animate={{ rotateY: flipKey === `${getType(item)}-${item.id}` ? 90 : 0 }}
              transition={{ duration: 0.25, ease: 'easeIn' }}
              onClick={() => setFlipKey(`${getType(item)}-${item.id}`)}
              onAnimationComplete={() => {
                if (flipKey === `${getType(item)}-${item.id}`) setOpen(item)
              }}
            >
              <div className="sp-poster-wrap">
                {item.poster_path ? (
                  <img
                    className="sp-poster"
                    src={IMG + item.poster_path}
                    alt={getTitle(item)}
                    loading="lazy"
                  />
                ) : (
                  <div className="sp-poster sp-poster-empty mono">NO POSTER</div>
                )}
                {item.vote_average > 0 && (
                  <span className="sp-badge rate mono">★ {item.vote_average.toFixed(1)}</span>
                )}
                <span className="sp-badge type mono">{getKind(item)}</span>
              </div>

              <h3 className="sp-title">{getTitle(item)}</h3>
              <div className="sp-year mono">{getYear(item)}</div>

              <button
                className={'sp-add mono' + (inList ? ' done' : '')}
                disabled={inList}
                onClick={(e) => {
                  e.stopPropagation()
                  addToWatchlist(item)
                }}
              >
                {inList ? '✓ In watchlist' : '+ Add to watchlist'}
              </button>
            </motion.article>
          )
        })}
      </div>
      <AnimatePresence>
        {open && (
          <MovieDetail
            key={open.id}
            item={open}
            inList={watchlistKeys.has(`${getType(open)}-${open.id}`)}
            onAdd={() => addToWatchlist(open)}
            onClose={() => {
              setOpen(null)
              setFlipKey(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
