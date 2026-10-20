import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useApp, API_BASE } from '../context/AppContext'
import '../dashboard.css'
import ScrollSections from './ScrollSections'

const IMG = 'https://image.tmdb.org/t/p/w500'
const TABS = [
  ['popular', 'Popular'],
  ['latest', 'Latest'],
  ['top_rated', 'Top Rated'],
  ['recommended', 'Recommended'],
]

const getTitle = (i) => i.title || i.name || 'Unknown'
const getYear = (i) => (i.release_date || i.first_air_date || '').slice(0, 4) || '—'
const getKind = (i) => (i.media_type === 'tv' ? 'TV Show' : 'Film')

function useGap() {
  const calc = () => (window.innerWidth < 640 ? 70 : 150)
  const [gap, setGap] = useState(calc)
  useEffect(() => {
    const on = () => setGap(calc())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return gap
}

export default function DashboardPage() {
  const { addToWatchlist, watchlistKeys } = useApp()
  const [tab, setTab] = useState('popular')
  const [items, setItems] = useState([])
  const [active, setActive] = useState(0)
  const [status, setStatus] = useState('loading')

  const gap = useGap()

  // hover a card to bring it to the centre (locked briefly so sliding cards don't chain-trigger)
  const lock = useRef(0)
  function hoverTo(i) {
    if (i === active || Date.now() < lock.current) return
    lock.current = Date.now() + 450
    setActive(i)
  }

  // 3D tilt that follows the cursor
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 150, damping: 15 })
  const sy = useSpring(my, { stiffness: 150, damping: 15 })
  const tiltY = useTransform(sx, [-0.5, 0.5], [-18, 18])
  const tiltX = useTransform(sy, [-0.5, 0.5], [16, -16])

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  function onLeave() {
    mx.set(0)
    my.set(0)
  }

  useEffect(() => {
    let alive = true
    setStatus('loading')
    fetch(`${API_BASE}/api/discover?tab=${tab}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((d) => {
        if (!alive) return
        setItems(d.results || [])
        setActive(Math.min(3, Math.max(0, (d.results || []).length - 1)))
        setStatus('ok')
      })
      .catch(() => {
        if (!alive) return
        setItems([])
        setStatus('error')
      })
    return () => {
      alive = false
    }
  }, [tab])



  const center = items[active]
  const inList = center && watchlistKeys.has(`${center.media_type}-${center.id}`)

  return (
    <div className="dash">
      <h1 className="dash-title">Discover unlimited content</h1>



      <div
        className="dash-stage"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {status === 'error' && (
          <p className="mono dash-msg">COULD NOT LOAD. IS THE SERVER RUNNING?</p>
        )}
        {status === 'loading' && <p className="mono dash-msg">LOADING…</p>}

        {items.map((item, i) => {
          const n = items.length
          let off = i - active
          if (off > n / 2) off -= n
          if (off < -n / 2) off += n
          const hidden = Math.abs(off) > 6
          const isCenter = off === 0
          return (
            <motion.div
              key={`${tab}-${item.media_type}-${item.id}`}
              className={'dash-card' + (isCenter ? ' center' : '')}
              style={{
                zIndex: 10 - Math.abs(off),
                pointerEvents: hidden ? 'none' : 'auto',
                transformPerspective: 900,
                rotateX: tiltX,
                rotateY: tiltY,
              }}

              initial={{ opacity: 0, y: 80 }}
              animate={{
                opacity: hidden ? 0 : Math.max(0.35, 1 - Math.max(0, Math.abs(off) - 3) * 0.2),
                x: off * gap,
                y: Math.abs(off) * Math.abs(off) * 10,
                rotate: off * 6,
                scale: isCenter ? 1 : 0.86,
              }}
              transition={{ type: 'spring', stiffness: 160, damping: 20 }}
              onMouseEnter={() => hoverTo(i)}
              onClick={() => setActive(i)}
            >
              <img src={IMG + item.poster_path} alt={getTitle(item)} draggable="false" />
              {isCenter && (
                <>
                  <span className="dash-badge rate mono">
                    ★ {item.vote_average ? item.vote_average.toFixed(1) : '—'}
                  </span>
                  <span className="dash-badge type mono">{getKind(item)}</span>
                  <div className="dash-info">
                    <h3>{getTitle(item)}</h3>
                    <span className="mono">
                      {getYear(item)} · {getKind(item)}
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          )
        })}
      </div>


      <ScrollSections />
    </div>
  )
}
