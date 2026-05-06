# 🎬 CineList — Movie & TV Watchlist Tracker

A clean, modern watchlist app built with React and the TMDB API. Search any movie or TV show, save it to your personal list, mark it as watched, and rate it out of 5 stars.

**[Live Demo](https://cinelist-indol.vercel.app/)** · **[GitHub](https://github.com/aaniya22/cinelist.git)**



## Features

- **Search** — Real-time search across movies and TV shows via the TMDB API, with debouncing to avoid spamming requests on every keystroke
- **Movie Detail Modal** — Click any poster to see the full overview, runtime, genres, and TMDB score
- **Watchlist** — Add titles to your personal list with one click
- **Mark as Watched** — Track what you've seen with a green watched badge
- **Star Rating** — Rate anything from 1 to 5 stars with an interactive hover preview
- **Filter** — Switch between All, Unwatched, and Watched in your list
- **Persistent Storage** — Your watchlist is saved to localStorage and survives page refreshes
- **Dark Mode** — Fully dark UI with a clean, modern design

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI and component architecture |
| Vite | Build tool and dev server |
| TMDB API | Movie and TV show data |
| localStorage | Client-side data persistence |
| CSS Variables | Theming and dark mode |
| Vercel | Deployment |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/aaniya22/cinelist.git
cd cinelist
```

### 2. Install dependencies

```bash
npm install
```

### 3. Get a free TMDB API key

1. Go to [themoviedb.org](https://www.themoviedb.org/) and create a free account
2. Go to **Settings → API** and request a Developer key
3. Copy your **API Key (v3 auth)**

### 4. Create a `.env` file in the root folder

```
VITE_TMDB_KEY=your_api_key_here
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
cinelist/
├── src/
│   ├── components/
│   │   ├── MovieCard.jsx       # Search result poster card
│   │   ├── MovieModal.jsx      # Detail popup with genres, runtime, overview
│   │   ├── WatchlistItem.jsx   # Single row in the watchlist sidebar
│   │   └── StarRating.jsx      # Interactive 5-star rating widget
│   ├── App.jsx                 # Main component — all state lives here
│   ├── App.css                 # All styles with CSS variables for theming
│   └── main.jsx                # Vite entry point
├── .env                        # Your TMDB API key (never commit this)
├── .gitignore
└── index.html
```

---

## Key Concepts Used

**Debounced Search** — `useEffect` + `useRef` + `setTimeout` to wait 400ms after the user stops typing before making an API call. Prevents spamming the TMDB API on every keystroke.

**Lifted State** — All watchlist state lives in `App.jsx` and is passed down to child components as props. This is because both the search grid and the sidebar need to read and modify the same data.

**Immutable State Updates** — React state is never mutated directly. `.map()` is used to update items, `.filter()` to remove them, and spread (`...`) to add new fields while copying existing ones.

**localStorage Persistence** — A `useEffect` that runs every time the watchlist changes saves it to `localStorage`. The initial state uses a lazy initializer to read from `localStorage` on first load.

**Optional Chaining** — `detail?.genres?.map(...)` safely accesses nested properties that might be null or undefined without crashing.

---

## Deployment

This project is deployed on Vercel. To deploy your own copy:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add `VITE_TMDB_KEY` as an environment variable with your TMDB key
4. Click Deploy

Every push to `main` will automatically redeploy.

---

## What I'd Add Next

- **User authentication** — sync the watchlist across devices with a backend
- **Recommendations** — use TMDB's `/similar` endpoint to suggest titles based on what you've watched
- **Sort options** — sort watchlist by rating, date added, or title
- **Share list** — generate a shareable link to your watchlist

---

## License

MIT — free to use and modify.

---

Built by [Aaniya](https://github.com/aaniya22)