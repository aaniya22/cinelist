// WatchlistItem.jsx
// One row in the sidebar watchlist.
// Props: item, onToggleWatched, onRate, onRemove — all functions from App.jsx

import StarRating from './StarRating'

const IMG_BASE = 'https://image.tmdb.org/t/p/w342'

function getYear(item) {
  const d = item.release_date || item.first_air_date || ''
  return d ? d.slice(0, 4) : '—'
}

function getTitle(item) {
  return item.title || item.name || 'Unknown'
}

function getType(item) {
  return item.media_type === 'tv' || item.first_air_date ? 'TV' : 'Film'
}

function WatchlistItem({ item, onToggleWatched, onRate, onRemove }) {
  return (
    <div className={'watchlist-item ' + (item.watched ? 'watched' : '')}>

      {/* Poster thumbnail */}
      {item.poster_path ? (
        <img
          className="wl-poster"
          src={IMG_BASE + item.poster_path}
          alt={getTitle(item)}
        />
      ) : (
        <div className="wl-poster-placeholder">🎬</div>
      )}

      <div className="wl-info">
        <div className="wl-title">
          {getTitle(item)}
          {/* Show a green badge if watched */}
          {item.watched && <span className="watched-badge">✓ watched</span>}
        </div>

        <div className="wl-meta">
          {getType(item)} · {getYear(item)}
        </div>

        {/* StarRating is a child component. We pass the saved rating down,
            and when the user clicks a star, onRate sends the new value back up to App */}
        <StarRating
          value={item.rating || 0}
          onChange={(r) => onRate(item.id, r)}
        />

        <div className="wl-actions">
          <button
            className={'action-btn watched-btn ' + (item.watched ? 'active' : '')}
            onClick={() => onToggleWatched(item.id)}
          >
            {item.watched ? '✓ Watched' : '◷ Mark watched'}
          </button>
        </div>
      </div>

      {/* × button to remove from watchlist */}
      <button
        className="remove-btn"
        onClick={() => onRemove(item.id)}
        title="Remove"
      >
        ×
      </button>
    </div>
  )
}

export default WatchlistItem