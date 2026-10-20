# CineList 

A personal movie and show tracker. Search any title, save it to your watchlist, mark it watched, rate it, and see where to stream it.

## Features
- Sign up and log in (JWT authentication)
- Search movies and TV shows, powered by TMDB
- Movie detail popup with overview, cast, director or creator, runtime and genres
- "Where to watch" icons that open the service's search page for the title (Netflix, Prime Video, YouTube, Apple TV), with a TMDB/JustWatch fallback for other services
- Personal watchlist with 1 to 5 star ratings
- Separate Watchlist, Unwatched and Watched pages
- Dashboard with saved, watched and to-watch counts, and clickable section cards

## Tech Stack
- **Frontend:** React, React Router, Framer Motion, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Auth:** JWT
- **Data:** TMDB API (streaming availability from JustWatch via TMDB)

## Live Demo
- **App:** [cinelist-indol.vercel.app](https://cinelist-indol.vercel.app) (hosted on Vercel)
- **API:** https://cinelist-api-e4x2.onrender.com (hosted on Render)

The API runs on Render's free tier, so the first request after a period of inactivity can take about 30 seconds while it wakes up.

## Getting Started

### 1. Clone and install
```bash
git clone https://github.com/aaniya22/cinelist.git
cd cinelist
npm install
cd server
npm install
```

### 2. Environment variables
Create `server/.env` with:

```
TMDB_KEY=your_tmdb_api_key
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_string
```

You can get a free TMDB API key from your account settings at https://www.themoviedb.org.

### 3. Run the server
```bash
cd server
npm run dev
```

### 4. Run the frontend
In a second terminal, from the project root:

```bash
npm run dev
```

Then open http://localhost:5173.

The server runs on http://localhost:5000. The frontend uses that by default. To point it at a different server (for example the deployed API), create a `.env` file in the project root with:

    VITE_API_URL=https://cinelist-api-e4x2.onrender.com

Restart `npm run dev` after changing it.

## Project Structure
```
cinelist/
├── src/            React app (pages, components, styles)
└── server/         Express API (auth, watchlist, TMDB proxy)
```

## Author
Built by [aaniya22](https://github.com/aaniya22).
