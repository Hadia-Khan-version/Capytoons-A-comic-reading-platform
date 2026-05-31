import { useState, useEffect }     from 'react'
import { Link }                    from 'react-router-dom'
import { motion }                  from 'framer-motion'
import { Bookmark, Trash2,
         BookOpen, Star }          from 'lucide-react'
import { getBookmarks,
         removeBookmark }          from '../../services/bookmark.service'
import EmptyState                  from '../../components/common/EmptyState'
import SkeletonCard                from '../../components/common/SkeletonCard'

const BookmarkCard = ({ item, onRemove }) => {
  const [removing, setRemoving] = useState(false)

  const handleRemove = async (e) => {
    e.preventDefault()
    setRemoving(true)
    try {
      await removeBookmark(item.ComicID)
      onRemove(item.ComicID)
    } catch {
      setRemoving(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1    }}
      exit={{    opacity: 0, scale: 0.95 }}
      className="card group relative overflow-hidden"
    >
      <Link to={`/comic/${item.ComicID}`} className="flex gap-4 p-4">
        <img
          src={item.CoverImageURL}
          alt={item.Title}
          className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="text-text-primary font-semibold text-sm
                           line-clamp-2 group-hover:text-accent-purple
                           transition-colors">
              {item.Title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs text-accent-purple capitalize">
                {item.Type}
              </span>
              <span className="text-xs text-text-muted capitalize">
                {item.Status}
              </span>
              {item.AverageRating && (
                <span className="flex items-center gap-1 text-xs
                                 text-yellow-400">
                  <Star size={10} className="fill-yellow-400" />
                  {item.AverageRating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Last read */}
          {item.LastChapterNumber && (
            <div className="flex items-center gap-1.5 mt-2">
              <BookOpen size={12} className="text-text-muted" />
              <span className="text-xs text-text-muted">
                Last read: Ch.{item.LastChapterNumber}
              </span>
            </div>
          )}

          {/* List type badge */}
          <span className="badge bg-bg-tertiary text-text-muted
                           border border-border capitalize mt-2 self-start">
            {item.ListType?.replace('_', ' ')}
          </span>
        </div>
      </Link>

      {/* Remove button */}
      <button
        onClick={handleRemove}
        disabled={removing}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg
                   bg-bg-primary/80 border border-border
                   flex items-center justify-center
                   text-text-muted hover:text-red-400
                   hover:border-red-500/40 transition-all duration-200
                   opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={13} />
      </button>
    </motion.div>
  )
}

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [page,      setPage]      = useState(1)
  const [hasMore,   setHasMore]   = useState(false)
  const [total,     setTotal]     = useState(0)

  const fetchBookmarks = async (p = 1, append = false) => {
    setLoading(true)
    try {
      const result = await getBookmarks({ page: p, limit: 20 })
      setBookmarks((prev) =>
        append ? [...prev, ...result.data] : result.data
      )
      setTotal(result.pagination.total)
      setHasMore(result.pagination.hasMore)
      setPage(p)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookmarks(1) }, [])

  const handleRemove = (comicId) => {
    setBookmarks((prev) => prev.filter((b) => b.ComicID !== comicId))
    setTotal((t) => t - 1)
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent-purple/20
                        flex items-center justify-center">
          <Bookmark size={18} className="text-accent-purple" />
        </div>
        <div>
          <h1 className="text-2xl font-display tracking-wider
                         text-text-primary">
            My Bookmarks
          </h1>
          {total > 0 && (
            <p className="text-text-muted text-sm">
              {total} saved comic{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {loading && bookmarks.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          message="Start reading and bookmark comics to find them here easily."
          action={
            <Link to="/browse" className="btn-primary">Browse Comics</Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((item) => (
              <BookmarkCard
                key={item.ComicID}
                item={item}
                onRemove={handleRemove}
              />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchBookmarks(page + 1, true)}
                disabled={loading}
                className="btn-secondary"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Bookmarks