import { useState }            from 'react'
import { Link }                from 'react-router-dom'
import { motion }              from 'framer-motion'
import { Star, Eye, Bookmark, BookOpen } from 'lucide-react'
import { toggleBookmark }      from '../../services/bookmark.service'
import useAuthStore            from '../../store/authStore'

// ── Status badge color map ────────────────────────
const statusColors = {
  ongoing:   'bg-green-500/20  text-green-400',
  completed: 'bg-blue-500/20   text-blue-400',
  hiatus:    'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20    text-red-400',
}

// ── Type badge color map ──────────────────────────
const typeColors = {
  manga:   'bg-accent-purple/20 text-accent-purple',
  manhwa:  'bg-accent-pink/20   text-accent-pink',
  manhua:  'bg-orange-500/20    text-orange-400',
  comic:   'bg-cyan-500/20      text-cyan-400',
}

const ComicCard = ({
  comic,
  showGenres  = false,
  initialBookmarked = false,
}) => {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [imgError,   setImgError]   = useState(false)
  const isAuth = useAuthStore((s) => s.isAuthenticated())

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuth) return
    try {
      const result = await toggleBookmark(comic.ComicID)
      setBookmarked(result.bookmarked)
    } catch {
      // silently fail
    }
  }

  const formatViews = (n) => {
    if (!n) return '0'
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
    return String(n)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative"
    >
      <Link to={`/comic/${comic.ComicID}`} className="block">
        {/* ── Cover Image ── */}
        <div className="relative aspect-[2/3] rounded-card overflow-hidden
                        bg-bg-tertiary">
          {!imgError ? (
            <img
  src={comic.CoverImageURL}
  alt={comic.Title}
  loading="lazy"
  crossOrigin="anonymous"
  onError={() => setImgError(true)}
  className="w-full h-full object-cover transition-transform
             duration-500 group-hover:scale-105"
/>
          ) : (
            /* Fallback cover */
            <div className="w-full h-full flex items-center justify-center
                            bg-bg-tertiary">
              <BookOpen size={40} className="text-text-muted" />
            </div>
          )}

          {/* ── Hover Overlay ── */}
          <div className="absolute inset-0 bg-gradient-to-t
                          from-black/80 via-black/20 to-transparent
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-300" />

          {/* ── Type Badge (top left) ── */}
          {comic.Type && (
            <span className={`badge absolute top-2 left-2
                              ${typeColors[comic.Type] || typeColors.comic}`}>
              {comic.Type}
            </span>
          )}

          {/* ── Bookmark Button (top right) ── */}
          {isAuth && (
            <button
              onClick={handleBookmark}
              className={`absolute top-2 right-2 w-8 h-8 rounded-lg
                          flex items-center justify-center
                          transition-all duration-200
                          opacity-0 group-hover:opacity-100
                          ${bookmarked
                            ? 'bg-accent-purple text-white'
                            : 'bg-black/60 text-white hover:bg-accent-purple'
                          }`}
            >
              <Bookmark
                size={14}
                className={bookmarked ? 'fill-white' : ''}
              />
            </button>
          )}

          {/* ── Hover Quick Action ── */}
          <div className="absolute bottom-0 left-0 right-0 p-3
                          translate-y-full group-hover:translate-y-0
                          transition-transform duration-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-white text-xs">
                <Star size={11} className="fill-yellow-400 text-yellow-400" />
                {comic.AverageRating?.toFixed(1) || 'N/A'}
              </span>
              {comic.TotalViews !== undefined && (
                <span className="flex items-center gap-1 text-white/70 text-xs">
                  <Eye size={11} />
                  {formatViews(comic.TotalViews)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Card Info ── */}
        <div className="mt-2.5 px-0.5">
          <h3 className="text-text-primary text-sm font-semibold
                         line-clamp-2 leading-snug group-hover:text-accent-purple
                         transition-colors duration-200">
            {comic.Title}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* Rating */}
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <Star size={11} className="fill-yellow-400" />
              {comic.AverageRating?.toFixed(1) || 'N/A'}
            </span>

            {/* Status */}
            {comic.Status && (
              <span className={`badge text-[10px]
                                ${statusColors[comic.Status] || ''}`}>
                {comic.Status}
              </span>
            )}
          </div>

          {/* Genres (optional) */}
          {showGenres && comic.genres?.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {comic.genres.slice(0, 2).map((g) => (
                <span
                  key={g.GenreID}
                  className="text-[10px] px-2 py-0.5 rounded-full
                             bg-bg-tertiary text-text-muted border border-border"
                >
                  {g.GenreName}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default ComicCard