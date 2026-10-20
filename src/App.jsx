import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import './shell.css'
import { AppProvider, useApp, API_BASE } from './context/AppContext'
import Layout from './components/Layout'
import AuthForm from './components/AuthForm'
import LandingPage from './components/LandingPage'
import WatchlistPage from './components/WatchlistPage'
import DashboardPage from './components/DashboardPage'
import SearchPage from './components/SearchPage'

function Placeholder({ num, title }) {
  return (
    <div>
      <div className="mono page-kicker">{num} / {title}</div>
      <h1 className="page-title">{title}</h1>
    </div>
  )
}

function Gate() {
  const { token, handleAuth } = useApp()

  if (!token)
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthForm apiBase={API_BASE} onAuth={handleAuth} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/unwatched" element={<Placeholder num="04" title="Unwatched" />} />
        <Route path="/watched" element={<Placeholder num="05" title="Watched" />} />
        <Route path="*" element={<Placeholder num="404" title="Not found" />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Gate />
      </AppProvider>
    </BrowserRouter>
  )
}
