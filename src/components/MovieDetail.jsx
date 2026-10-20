import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { API_BASE, getType } from '../context/AppContext'
import '../moviedetail.css'

const BACK = 'https://image.tmdb.org/t/p/w1280'
const PROFILE = 'https://image.tmdb.org/t/p/w185'
const LOGO = 'https://image.tmdb.org/t/p/w92'

function fmtRuntime(m) {
  if (!m) return null
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`
}

function fmtDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const SERVICE_SEARCH = [
  ['netflix', 'https://www.netflix.com/search?q='],
  ['prime', 'https://www.primevideo.com/search/?phrase='],
  ['amazon', 'https://www.primevideo.com/search/?phrase='],
  ['youtube', 'https://www.youtube.com/results?search_query='],
  ['apple', 'https://tv.apple.com/search?term='],
]

function serviceLink(name, title, fallback) {
  const n = name.toLowerCase()
  const hit = SERVICE_SEARCH.find(([key]) => n.includes(key))
  return hit && title ? hit[1] + encodeURIComponent(title) : fallback
}

function Providers({ label, list, link, title }) {
  if (!list || list.length === 0) return null
  return (
    <div className="md-prov-row">
      <span className="mono md-prov-label">{label}</span>
      <div className="md-prov-list">
        {list.map((p) => (
          <a key={p.name} href={serviceLink(p.name, title, link)} target="_blank" rel="noreferrer" title={p.name}>
            <img src={LOGO + p.logo} alt={p.name} />
          </a>
        ))}
      </div>
    </div>
  )
}

export default function MovieDetail({ item, inList, onAdd, onClose }) {
  const [data, setData] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    fetch(`${API_BASE}/api/details/${getType(item)}/${item.id}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((d) => alive && setData(d))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [item])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  // show what the search result already knows while the full details load
  const d = data || {
    title: item.title || item.name,
    overview: item.overview,
    backdrop: item.backdrop_path,
    release: item.release_date || item.first_air_date,
    rating: item.vote_average,
    genres: [],
    makers: [],
    cast: [],
    watch: null,
  }

  const isTv = getType(item) === 'tv'
  const runtime = fmtRuntime(d.runtime)
  const watch = d.watch || {}
  const hasProviders =
    (watch.stream || []).length + (watch.rent || []).length + (watch.buy || []).length > 0

  const node = (
    <motion.div
      className="md-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="md-panel"
        style={{ transformPerspective: 1400 }}
        initial={{ rotateY: -90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: 90, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="md-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div
          className="md-hero"
          style={d.backdrop ? { backgroundImage: `url(${BACK + d.backdrop})` } : undefined}
        >
          <div className="md-main">
            {d.tagline && <div className="mono md-tagline">{d.tagline}</div>}
            <h2 className="md-title">{d.title}</h2>

            <div className="md-meta mono">
              <span>★ {d.rating ? d.rating.toFixed(1) : '—'}</span>
              <span>{isTv ? 'TV SHOW' : 'FILM'}</span>
              {runtime && <span>{isTv ? `${runtime} / EP` : runtime}</span>}
              {isTv && d.seasons && (
                <span>
                  {d.seasons} SEASON{d.seasons > 1 ? 'S' : ''}
                </span>
              )}
            </div>

            <p className="md-overview">{d.overview || 'No summary available yet.'}</p>

            <div className="md-actions">
              {d.trailer && (
                <a
                  className="md-btn primary mono"
                  href={`https://www.youtube.com/watch?v=${d.trailer}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  ▶ Watch trailer
                </a>
              )}
              <button className="md-btn mono" disabled={inList} onClick={onAdd}>
                {inList ? '✓ In watchlist' : '+ Add to watchlist'}
              </button>
            </div>
          </div>

          <aside className="md-side">
            <div>
              <span className="mono md-label">Released</span>
              <p>{fmtDate(d.release)}</p>
            </div>
            {d.status && (
              <div>
                <span className="mono md-label">Status</span>
                <p>{d.status}</p>
              </div>
            )}
            {d.makers.length > 0 && (
              <div>
                <span className="mono md-label">{isTv ? 'Creator' : 'Director'}</span>
                <p>{d.makers.join(', ')}</p>
              </div>
            )}
            {d.cast.length > 0 && (
              <div>
                <span className="mono md-label">Stars</span>
                <p>
                  {d.cast
                    .slice(0, 3)
                    .map((c) => c.name)
                    .join(', ')}
                </p>
              </div>
            )}
            {d.genres.length > 0 && (
              <div>
                <span className="mono md-label">Genres</span>
                <p>{d.genres.join(' · ')}</p>
              </div>
            )}
          </aside>
        </div>

        <div className="md-body">
          {failed && (
            <p className="mono md-note">COULD NOT LOAD FULL DETAILS. IS THE SERVER RUNNING?</p>
          )}
          {!data && !failed && <p className="mono md-note">LOADING DETAILS…</p>}

          {data && (
            <section>
              <h4 className="mono md-label">Where to watch ({watch.region})</h4>
              {hasProviders ? (
                <>
                  <Providers label="Stream" list={watch.stream} link={watch.link} title={d.title} />
                  <Providers label="Rent" list={watch.rent} link={watch.link} title={d.title} />
                  <Providers label="Buy" list={watch.buy} link={watch.link} title={d.title} />
                  {watch.link && (
                    <a className="md-more mono" href={watch.link} target="_blank" rel="noreferrer">
                      All options →
                    </a>
                  )}
                  <p className="mono md-credit">AVAILABILITY DATA BY JUSTWATCH</p>
                </>
              ) : (
                <p className="md-none">Not listed on any service in this region right now.</p>
              )}
            </section>
          )}

          {d.cast.length > 0 && (
            <section>
              <h4 className="mono md-label">Cast</h4>
              <div className="md-cast">
                {d.cast.map((c) => (
                  <div className="md-person" key={c.name + c.character}>
                    {c.photo ? (
                      <img src={PROFILE + c.photo} alt={c.name} loading="lazy" />
                    ) : (
                      <div className="md-person-empty" />
                    )}
                    <b>{c.name}</b>
                    <span>{c.character}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </motion.div>
  )

  return createPortal(node, document.querySelector('.shell') || document.body)
}
