// MovieCard.jsx
// Displays one search result as a poster card.
// Props: item (the movie data from TMDB), inList (boolean), onAdd (function)

const IMG_BASE = 'https://image.tmdb.org/t/p/w342'

// Helper functions — small utilities that get info from the messy TMDB data shape
function getYear(item) {
  // Movies use release_date, TV shows use first_air_date
  const d = item.release_date || item.first_air_date || ''
  return d ? d.slice(0, 4) : '—'
}

function getTitle(item) {
  // Movies use title, TV shows use name
  return item.title || item.name || 'Unknown'
}

function getType(item) {
  // TMDB tells us media_type in multi-search; for movie/tv-only searches we check the date field
  return item.media_type === 'tv' || item.first_air_date ? 'TV' : 'Film'
}

function MovieCard({ item, inList, onAdd }) {
  return (
    <div
      className={'movie-card ' + (inList ? 'in-list' : '')}
      onClick={() => !inList && onAdd(item)}
      // !inList means: only call onAdd if it's NOT already in the list
    >
      <div className="poster-wrap">
        {item.poster_path ? (
          <img
            src={IMG_BASE + item.poster_path}
            alt={getTitle(item)}
            loading="lazy"
            // loading="lazy" = browser only downloads this image when it's visible on screen
          />
        ) : (
          <div className="poster-placeholder">
            <span>🎬</span>
            <span>{getTitle(item)}</span>
          </div>
        )}

        <div className="type-badge">{getType(item)}</div>

        {/* This overlay appears on hover showing + or ✓ */}
        <div className="add-overlay">
          <span className="add-icon">＋</span>
          <span className="in-icon">✓</span>
        </div>
      </div>

      <div className="card-info">
        <div className="card-title">{getTitle(item)}</div>
        <div className="card-year">{getYear(item)}</div>
        {/* Only show TMDB rating if it exists and is > 0 */}
        {item.vote_average > 0 && (
          <div className="card-rating">
            ★ {(item.vote_average / 2).toFixed(1)}
            {/* TMDB rates out of 10, we divide by 2 to show out of 5 */}
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieCard