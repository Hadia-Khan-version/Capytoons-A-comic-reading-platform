import { useRef }       from 'react'
import { motion }       from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ComicCard        from '../comic/ComicCard'
import SkeletonCard     from '../common/SkeletonCard'

const TrendingRow = ({ comics = [], loading = false }) => {
  const rowRef = useRef(null)

  const scroll = (dir) => {
    if (!rowRef.current) return
    rowRef.current.scrollBy({
      left:     dir === 'left' ? -320 : 320,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative group/row">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-4 top-1/3 z-10 w-9 h-9 rounded-full
                   bg-bg-secondary border border-border shadow-card
                   flex items-center justify-center text-text-secondary
                   hover:text-text-primary hover:border-accent-purple
                   opacity-0 group-hover/row:opacity-100
                   transition-all duration-200 -translate-y-1/2"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute -right-4 top-1/3 z-10 w-9 h-9 rounded-full
                   bg-bg-secondary border border-border shadow-card
                   flex items-center justify-center text-text-secondary
                   hover:text-text-primary hover:border-accent-purple
                   opacity-0 group-hover/row:opacity-100
                   transition-all duration-200 -translate-y-1/2"
      >
        <ChevronRight size={18} />
      </button>

      {/* Scroll container */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[140px] sm:w-[160px]">
                <SkeletonCard />
              </div>
            ))
          : comics.map((comic, i) => (
              <motion.div
                key={comic.ComicID}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0  }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex-shrink-0 w-[140px] sm:w-[160px]"
              >
                <ComicCard comic={comic} />
              </motion.div>
            ))
        }
      </div>
    </div>
  )
}

export default TrendingRow