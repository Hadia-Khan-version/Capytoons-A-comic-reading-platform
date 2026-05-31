import { useState, useEffect, useCallback } from 'react'
import { Link }                             from 'react-router-dom'
import { motion, AnimatePresence }          from 'framer-motion'
import { Play, Bookmark, ChevronLeft,
         ChevronRight, Star }               from 'lucide-react'

const HeroBanner = ({ comics = [] }) => {
  const [current,  setCurrent]  = useState(0)
  const [paused,   setPaused]   = useState(false)

  const total = comics.length

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % total)
  }, [total])

  const prev = () => setCurrent((p) => (p - 1 + total) % total)

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (paused || total === 0) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [paused, next, total])

  if (!comics.length) return null

  const comic = comics[current]

  return (
    <div
      className="relative w-full h-[70vh] min-h-[480px] max-h-[680px]
                 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background image ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={comic.ComicID}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1,  scale: 1    }}
          exit={{    opacity: 0,  scale: 0.98 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
  src={comic.CoverImageURL}
  alt={comic.Title}
  loading="lazy"
  crossOrigin="anonymous"
  onError={() => setImgError(true)}
  className="w-full h-full object-cover transition-transform
             duration-500 group-hover:scale-105"
/>
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r
                          from-bg-primary via-bg-primary/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t
                          from-bg-primary via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── Content ── */}
      <div className="relative h-full max-w-screen-xl mx-auto px-4 sm:px-6
                      flex items-end pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${comic.ComicID}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0   }}
            exit={{    opacity: 0, x: 30  }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-lg"
          >
            {/* Type + rating */}
            <div className="flex items-center gap-3 mb-3">
              {comic.Type && (
                <span className="badge bg-accent-purple/30 text-accent-purple
                                 border border-accent-purple/40 capitalize">
                  {comic.Type}
                </span>
              )}
              <span className="flex items-center gap-1 text-yellow-400 text-sm">
                <Star size={13} className="fill-yellow-400" />
                {comic.AverageRating?.toFixed(1)}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-5xl sm:text-6xl tracking-wide
                           text-white leading-none mb-4 drop-shadow-lg">
              {comic.Title}
            </h1>

            {/* Description */}
            <p className="text-text-secondary text-sm sm:text-base
                          line-clamp-3 leading-relaxed mb-6 max-w-md">
              {comic.Description}
            </p>

            {/* Genres */}
            {comic.genres?.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-6">
                {comic.genres.slice(0, 3).map((g) => (
                  <span
                    key={g.GenreID}
                    className="text-xs px-3 py-1 rounded-full
                               bg-white/10 text-white/70 border
                               border-white/20"
                  >
                    {g.GenreName}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <Link
                to={`/comic/${comic.ComicID}`}
                className="btn-primary flex items-center gap-2"
              >
                <Play size={16} className="fill-white" />
                Read Now
              </Link>
              <Link
                to={`/comic/${comic.ComicID}`}
                className="btn-secondary flex items-center gap-2"
              >
                <Bookmark size={16} />
                Details
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Prev / Next controls ── */}
      <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2
                      flex flex-col gap-2">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70
                     border border-white/20 flex items-center justify-center
                     text-white transition-all duration-200"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70
                     border border-white/20 flex items-center justify-center
                     text-white transition-all duration-200"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2
                      flex gap-2">
        {comics.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full
                        ${i === current
                          ? 'w-6 h-2 bg-accent-purple'
                          : 'w-2  h-2 bg-white/30 hover:bg-white/60'
                        }`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroBanner