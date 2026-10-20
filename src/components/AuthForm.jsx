import { useState } from 'react'

export default function AuthForm({ apiBase, onAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      onAuth(data)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 360, margin: '15vh auto', padding: 16 }}>
      <div className="logo" style={{ marginBottom: 24 }}>
        <span className="logo-dot" />
        CineList
      </div>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <div className="search-wrap">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="search-wrap">
          <input
            type="password"
            placeholder="Password (6+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="tab-btn active" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>
      <button
        className="tab-btn"
        style={{ marginTop: 12 }}
        onClick={() => {
          setMode(mode === 'login' ? 'signup' : 'login')
          setError('')
        }}
      >
        {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
      </button>
    </div>
  )
}