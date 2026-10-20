import { useState, useEffect } from 'react'
import '../auth.css'

const IMG = 'https://image.tmdb.org/t/p/w342'
const SEEDS = ['dune', 'inception', 'interstellar', 'parasite', 'joker', 'the batman', 'spider-man', 'oppenheimer', 'pulp fiction', 'whiplash', 'la la land', 'blade runner']

export default function AuthForm({ apiBase, onAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState(() => localStorage.getItem('cinelist-email') || '')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [posters, setPosters] = useState([])
  const [remember, setRemember] = useState(() => !!localStorage.getItem('cinelist-email'))
  const [notice, setNotice] = useState('')

  // pull a few posters for the background wall; the page works without them
  useEffect(() => {
    let alive = true
    Promise.all(
      SEEDS.map((q) =>
        fetch(`${apiBase}/api/search?query=${encodeURIComponent(q)}&type=movie`)
          .then((r) => (r.ok ? r.json() : { results: [] }))
          .catch(() => ({ results: [] }))
      )
    ).then((all) => {
      if (!alive) return
      const paths = all.flatMap((d) =>
        (d.results || []).slice(0, 3).map((r) => r.poster_path).filter(Boolean)
      )
      setPosters([...new Set(paths)].slice(0, 28))
    })
    return () => {
      alive = false
    }
  }, [apiBase])

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      if (remember) localStorage.setItem('cinelist-email', email)
      else localStorage.removeItem('cinelist-email')
      onAuth(data)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  function switchMode() {
    setNotice('')
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
  }

  const isLogin = mode === 'login'
  const columns = [0, 1, 2, 3, 4, 5, 6].map((c) => posters.filter((_, i) => i % 7 === c))

  return (
    <div className="auth">
      <section className="auth-art">
        {posters.length >= 9 && (
          <div className="auth-wall" aria-hidden="true">
            {columns.map((col, ci) => (
              <div className="auth-col" key={ci}>
                {[...col, ...col, ...col, ...col].map((p, i) => (
                  <img key={`${p}-${i}`} src={`${IMG}${p}`} alt="" loading="lazy" />
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="auth-copy">
          <span className="mono auth-brand">CINELIST™</span>
          <h2 className="auth-headline">
            Every film
            <br />
            you meant
            <br />
            to watch.
          </h2>
        </div>
      </section>

      <section className="auth-side">
        <div className="auth-card">
          <h1 className="auth-title">{isLogin ? 'Hello again.' : 'Create account.'}</h1>
          <p className="auth-lead">
            {isLogin
              ? 'Log in to see your watchlist.'
              : 'Sign up to start tracking what you watch.'}
          </p>

          <form onSubmit={submit}>
            <label className="auth-field">
              <span className="mono auth-label">Email</span>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              <span className="mono auth-label">
                Password
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? 'HIDE' : 'SHOW'}
                </button>
              </span>
              <input
                className="auth-input"
                type={showPw ? 'text' : 'password'}
                placeholder="6+ characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                minLength={6}
              />
            </label>

            {isLogin && (
              <div className="auth-row">
                <label className="auth-check">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => setNotice('Password reset is not available yet.')}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {notice && <div className="aufth-notice">{notice}</div>}

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-btn primary" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Log in' : 'Sign up'}
            </button>
            <button className="auth-btn ghost" type="button" onClick={switchMode}>
              {isLogin ? 'Create an account' : 'I already have an account'}
            </button>
          </form>

          <p className="mono auth-foot">CINELIST™ · TRACK WHAT YOU WATCH</p>
        </div>
      </section>
    </div>
  )
}
