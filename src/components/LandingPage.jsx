import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div style={{ padding: 48 }}>
      <h1>Landing</h1>
      <Link to="/login">Log in</Link>
    </div>
  )
}
