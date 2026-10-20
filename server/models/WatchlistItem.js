const mongoose = require('mongoose')

const watchlistItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], required: true },
    title: { type: String, required: true },
    posterPath: String,
    releaseDate: String,
    overview: String,
    voteAverage: Number,
    watched: { type: Boolean, default: false },
    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true }
)

// a movie and a TV show can share an id, so uniqueness uses both
watchlistItemSchema.index({ user: 1, tmdbId: 1, mediaType: 1 }, { unique: true })

module.exports = mongoose.model('WatchlistItem', watchlistItemSchema)