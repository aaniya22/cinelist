// StarRating.jsx
// This component shows 5 clickable stars.
// It receives the current rating (value) and a function to call when rating changes (onChange).
// Props = data passed in from the parent component.

import { useState } from 'react'

function StarRating({ value, onChange }) {
  // hover tracks which star the mouse is currently over (0 = not hovering)
  const [hover, setHover] = useState(0)

  return (
    <div className="stars-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          className={'star ' + ((hover || value) >= n ? 'filled' : '')}
          // If user clicks the same star they already rated, set rating to 0 (deselect)
          onClick={() => onChange(n === value ? 0 : n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          title={n + ' star' + (n > 1 ? 's' : '')}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default StarRating