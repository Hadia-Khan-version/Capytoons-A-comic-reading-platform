import { useState, useEffect }   from 'react'
import { Link }                  from 'react-router-dom'
import { motion }                from 'framer-motion'
import { History as HistoryIcon,
         Trash2, BookOpen,
         Clock }                 from 'lucide-react'
import { getHistory,
         clearHistory }          from '../../services/history.service'
import EmptyState                from '../../components/common/EmptyState'

const HistoryCard = ({ item }) => {
  const formatDate = (d) => {
    const date = new Date(d)
    const now  = new Date()
    const diff = now - date
    const mins = Math.floor(diff / 60000)
    const hrs  = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (mins < 60)  return `${mins}m ago`
    if (hrs  < 24)  return `${hrs}h ago`
    if (days < 7)   return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Link to={`/comic/${item.ComicID}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0  }}
        whileHover={{ x: 4 }}
        className="card flex gap-4 p-4 hover:border-accent-purple/30
                   transition-all duration-200 group"
      >
        <img
          src={item.CoverImageURL}
          alt={item.Title}
          className="w-14 h-20 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="text-text-primary font-semibold text-sm
                           line-clamp-1 group-hover:text-accent-purple
                           transition-colors">
              {item.Title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <BookOpen size={12} className="text-accent-purple" />
              <span className="text-xs text-accent-purple">
                Chapter {item.LastChapterNumber}
              </span>
              {item.LastChapterTitle && (
                <span className="text-xs text-text-muted truncate">
                  — {item.LastChapterTitle}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="badge bg-bg-tertiary text-text-muted
                             border border-border capitalize">
              {item.Type}
            </span>
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Clock size={10} />
              {formatDate(item.LastReadAt)}
            </span>
          </div>
        </div>

        {/* Continue reading arrow */}
        <div className="flex items-center flex-shrink-0">
          <Link
            to={`/read/${item.ComicID}/${item.LastChapterID}`}
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-lg bg-accent-purple/20 border
                       border-accent-purple/30 flex items-center justify-center
                       text-accent-purple hover:bg-accent-purple
                       hover:text-white transition-all duration-200"
          >
            <BookOpen size={14} />
          </Link>
        </div>
      </motion.div>
    </Link>
  )
}

const History = () => {
  const [history,  setHistory]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [page,     setPage]     = useState(1)
  const [hasMore,  setHasMore]  = useState(false)
  const [total,    setTotal]    = useState(0)
  const [clearing, setClearing] = useState(false)

  const fetchHistory = async (p = 1, append = false) => {
    setLoading(true)
    try {
      const result = await getHistory({ page: p, limit: 20 })
      setHistory((prev) =>
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

  useEffect(() => { fetchHistory(1) }, [])

  const handleClearAll = async () => {
    if (!window.confirm('Clear all reading history?')) return
    setClearing(true)
    try {
      await clearHistory()
      setHistory([])
      setTotal(0)
    } catch {
      // silently fail
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-pink/20
                          flex items-center justify-center">
            <HistoryIcon size={18} className="text-accent-pink" />
          </div>
          <div>
            <h1 className="text-2xl font-display tracking-wider
                           text-text-primary">
              Reading History
            </h1>
            {total > 0 && (
              <p className="text-text-muted text-sm">
                {total} comic{total !== 1 ? 's' : ''} read
              </p>
            )}
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={clearing}
            className="flex items-center gap-2 text-sm text-text-muted
                       hover:text-red-400 transition-colors"
          >
            <Trash2 size={15} />
            Clear all
          </button>
        )}
      </div>

      {loading && history.length === 0 ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}
                 className="h-28 rounded-xl bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No reading history"
          message="Comics you read will appear here so you can easily pick up where you left off."
          action={
            <Link to="/browse" className="btn-primary">Start Reading</Link>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {history.map((item) => (
              <HistoryCard key={item.ComicID} item={item} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchHistory(page + 1, true)}
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

export default History