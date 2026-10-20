import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import StarRating from './StarRating'
import '../watchlist.css'

const IMG = 'https://image.tmdb.org/t/p/w342'
const FILTERS = [
  ['01', 'All', 'all'],
  ['02', 'To watch', 'todo'],
  ['03', 'Watched', 'done'],
]

const getTitle = (i) => i.title || i.name || 'Unknown'
const getYear = (i) => (i.release_date || i.first_air_date || '').slice(0, 4) || '—'
const getKind = (i) => (i.media_type === 'tv' ? 'TV' : 'FILM')

export default function WatchlistPage() {
  const { watchlist, watchedCount, toggleWatched, rateItem, removeItem, error } = useApp()
  const [filter, setFilter] = useState('all')

  const counts = {
    all: watchlist.length,
    todo: watchlist.length - watchedCount,
    done: watchedCount,
  }

  const shown = watchlist.filter((w) =>
    filter === 'all' ? true : filter === 'done' ? w.watched : !w.watched
  )

  return (
    <div>
      <div className="mono page-kicker">03 / Watchlist</div>
      <h1 className="page-title">Watchlist</h1>

      <div className="wp-filters">
        {FILTERS.map(([num, label, key]) => (
          <button
            key={key}
            className={'wp-filter' + (filter === key ? ' active' : '')}
            onClick={() => setFilter(key)}
          >
            <span className="mono wp-filter-num">{num}</span>
            <span className="wp-filter-label">{label}</span>
            <span className="mono wp-filter-count">{counts[key]}</span>
          </button>
        ))}
      </div>

      {error && <div className="wp-error mono">{error}</div>}

      {shown.length === 0 ? (
        <div className="wp-empty">
          <p className="mono">
            {watchlist.length === 0 ? 'NOTHING SAVED YET' : 'NOTHING IN THIS VIEW'}
          </p>
          {watchlist.length === 0 && (
            <Link to="/search" className="wp-btn primary">
              Find something to watch
            </Link>
          )}
        </div>
      ) : (
        <div className="wp-grid">
          {shown.map((item) => (
            <article key={item.id} className={'wp-card' + (item.watched ? ' watched' : '')}>
              <div className="wp-poster-wrap">
                {item.poster_path ? (
                  <img
                    className="wp-poster"
                    src={IMG + item.poster_path}
                    alt={getTitle(item)}
                    loading="lazy"
                  />
                ) : (
                  <div className="wp-poster wp-poster-empty mono">NO POSTER</div>
                )}
                {item.watched && <span className="wp-badge mono">WATCHED</span>}
                <button
                  className="wp-remove"
                  onClick={() => removeItem(item.id)}
                  title="Remove"
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>

              <h3 className="wp-title">{getTitle(item)}</h3>

              <div className="wp-meta mono">
                <div>
                  <small>TYPE</small>
                  <b>{getKind(item)}</b>
                </div>
                <div>
                  <small>YEAR</small>
                  <b>{getYear(item)}</b>
                </div>
                <div>
                  <small>TMDB</small>
                  <b>{item.vote_average > 0 ? (item.vote_average / 2).toFixed(1) : '—'}</b>
                </div>
              </div>

              <StarRating
                value={item.rating || 0}
                onChange={(r) => rateItem(item.id, r)}
              />

              <button
                className={'wp-btn' + (item.watched ? '' : ' primary')}
                onClick={() => toggleWatched(item.id)}
              >
                {item.watched ? 'Mark unwatched' : 'Mark watched'}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
