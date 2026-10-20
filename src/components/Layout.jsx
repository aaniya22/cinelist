import { useState } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'

const LINKS = [
  ['Dashboard', '/dashboard'],
  ['Search', '/search'],
  ['Watchlist', '/watchlist'],
  ['Unwatched', '/unwatched'],
  ['Watched', '/watched'],
]

export default function Layout() {
  const location = useLocation()
  const { logout } = useApp()
  const [menu, setMenu] = useState(false)

  return (
    <div className="shell">
      <div className="shell-grid" aria-hidden="true" />

      <header className="nav">
        <Link to="/dashboard" className="nav-logo" aria-label="Cinelist home">
          <i /><i /><i /><i />
        </Link>

        <nav className="nav-links">
          {LINKS.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-right">
          <Link to="/search" className="nav-icon" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </Link>


          <button
            className="nav-avatar"
            onClick={() => setMenu((m) => !m)}
            aria-label="Account"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </button>

          {menu && (
            <>
              <div className="nav-backdrop" onClick={() => setMenu(false)} />
              <div className="nav-menu">
                <button
                  className="mono"
                  onClick={() => {
                    setMenu(false)
                    logout()
                  }}
                >
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <motion.main
        key={location.pathname}
        className="page"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Outlet />
      </motion.main>
    </div>
  )
}
