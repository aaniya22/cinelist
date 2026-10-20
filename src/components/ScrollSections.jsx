import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const FEATURES = [
  ['01', 'Search', 'Find any film or show in seconds, powered by TMDB.', '/search', 'Open search'],
  ['02', 'Watchlist', 'Save everything you mean to watch in one place.', '/watchlist', 'Open watchlist'],
  ['03', 'Rate', 'Give titles one to five stars and keep your own scores.', '/watched', 'See watched'],
  ['04', 'Track', 'Mark what you have seen and know exactly what is left.', '/unwatched', 'See what is left'],
]

const STATEMENT = 'Everything you need to track what you watch.'.split(' ')

const ease = [0.22, 1, 0.36, 1]
const view = { once: true, margin: '-80px' }

export default function ScrollSections() {
  const { watchlist, watchedCount } = useApp()

  const stats = [
    [watchlist.length, 'Saved'],
    [watchedCount, 'Watched'],
    [watchlist.length - watchedCount, 'To watch'],
  ]

  return (
    <div className="sc">
      <h2 className="sc-statement">
        {STATEMENT.map((w, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={view}
            transition={{ duration: 0.6, delay: i * 0.06, ease }}
          >
            {w}&nbsp;
          </motion.span>
        ))}
      </h2>

      <div className="sc-stats">
        {stats.map(([n, label], i) => (
          <motion.div
            key={label}
            className="sc-stat"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={view}
            transition={{ duration: 0.6, delay: i * 0.12, ease }}
          >
            <b>{n}</b>
            <span className="mono">{label}</span>
          </motion.div>
        ))}
      </div>

      <div className="sc-stack">
        {FEATURES.map(([num, title, text, to, cta], i) => (
          <motion.article
            key={title}
            className="sc-card"
            style={{ '--i': i }}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease }}
          >
            <span className="mono sc-num">{num}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <Link to={to} className="sc-link mono">
              {cta} →
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
