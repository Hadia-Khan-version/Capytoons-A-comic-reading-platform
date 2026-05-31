import { useState }           from 'react'
import { Link }               from 'react-router-dom'
import { motion }             from 'framer-motion'
import {
  ArrowUpDown, BookOpen,
  CheckCircle2, Clock,
}                             from 'lucide-react'

const ChapterList = ({
  chapters     = [],
  comicId,
  lastChapterId = null,
  loading       = false,
}) => {
  const [order, setOrder] = useState('ASC')
  const [page,  setPage]  = useState(1)
  const PER_PAGE = 50

  const sorted = order === 'ASC'
    ? [...chapters]
    : [...chapters].reverse()

  const totalPages = Math.ceil(sorted.length / PER_PAGE)
  const visible    = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day:   'numeric',
      year:  'numeric',
    })
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-xl bg-bg-tertiary animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!chapters.length) {
    return (
      <p className="text-text-muted text-sm py-8 text-center">
        No chapters available yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Controls ── */}
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-sm">
          {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => {
            setOrder((o) => o === 'ASC' ? 'DESC' : 'ASC')
            setPage(1)
          }}
          className="flex items-center gap-1.5 text-sm text-text-secondary
                     hover:text-text-primary transition-colors"
        >
          <ArrowUpDown size={14} />
          {order === 'ASC' ? 'Oldest first' : 'Newest first'}
        </button>
      </div>

      {/* ── Chapter rows ── */}
      <div className="flex flex-col gap-1">
        {visible.map((ch, i) => {
          const isLastRead = ch.ChapterID === lastChapterId

          return (
            <motion.div
              key={ch.ChapterID}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0   }}
              transition={{ delay: i * 0.02  }}
            >
              <Link
                to={`/read/${comicId}/${ch.ChapterID}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl
                            border transition-all duration-200 group
                            ${isLastRead
                              ? 'bg-accent-purple/10 border-accent-purple/30'
                              : 'bg-bg-tertiary border-transparent hover:bg-bg-secondary hover:border-border'
                            }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0
                                 ${isLastRead
                                   ? 'text-accent-purple'
                                   : 'text-text-muted group-hover:text-text-secondary'
                                 }`}
                >
                  {isLastRead
                    ? <CheckCircle2 size={16} />
                    : <BookOpen     size={15} />
                  }
                </div>

                {/* Chapter info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium
                                      ${isLastRead
                                        ? 'text-accent-purple'
                                        : 'text-text-primary'
                                      }`}>
                      Chapter {ch.ChapterNumber}
                    </span>
                    {isLastRead && (
                      <span className="badge bg-accent-purple/20
                                       text-accent-purple text-[10px]">
                        Last read
                      </span>
                    )}
                  </div>
                  {ch.Title && (
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {ch.Title}
                    </p>
                  )}
                </div>

                {/* Date + page count */}
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  {ch.UploadDate && (
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock size={10} />
                      {formatDate(ch.UploadDate)}
                    </span>
                  )}
                  {ch.PageCount > 0 && (
                    <span className="text-[10px] text-text-muted">
                      {ch.PageCount}p
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-text-muted text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ChapterList