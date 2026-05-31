import { useEffect, useRef }     from 'react'
import { Link, useNavigate }     from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  Bookmark, Settings, Home,
  BookOpen,
}                                from 'lucide-react'
import { toggleBookmark }        from '../../services/bookmark.service'
import useAuthStore              from '../../store/authStore'

const ReaderControls = ({
  visible,
  onToggle,
  chapter,
  prev,
  next,
  comicId,
  isBookmarked,
  onSettingsOpen,
  currentPage,
  totalPages,
}) => {
  const navigate = useNavigate()
  const isAuth   = useAuthStore((s) => s.isAuthenticated())

  const handleBookmark = async (e) => {
    e.stopPropagation()
    if (!isAuth) { navigate('/login'); return }
    try {
      await toggleBookmark(comicId)
    } catch { /* silent */ }
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* ── Top bar ── */}
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{    y: -80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-50
                       bg-bg-primary/95 backdrop-blur-md
                       border-b border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-4xl mx-auto px-4 h-14
                            flex items-center gap-3">

              {/* Back to comic */}
              <Link
                to={`/comic/${comicId}`}
                className="w-9 h-9 rounded-lg bg-bg-tertiary border border-border
                           flex items-center justify-center text-text-secondary
                           hover:text-text-primary hover:border-accent-purple
                           transition-all duration-200 flex-shrink-0"
              >
                <ArrowLeft size={17} />
              </Link>

              {/* Chapter title */}
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm font-medium truncate">
                  {chapter?.ComicTitle}
                </p>
                <p className="text-text-muted text-xs">
                  Chapter {chapter?.ChapterNumber}
                  {chapter?.Title ? ` — ${chapter.Title}` : ''}
                </p>
              </div>

              {/* Page progress */}
              {totalPages > 0 && (
                <span className="text-text-muted text-xs font-mono
                                 flex-shrink-0 hidden sm:block">
                  {currentPage}/{totalPages}
                </span>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={handleBookmark}
                  className={`w-9 h-9 rounded-lg border flex items-center
                              justify-center transition-all duration-200
                              ${isBookmarked
                                ? 'bg-accent-purple/20 border-accent-purple text-accent-purple'
                                : 'bg-bg-tertiary border-border text-text-secondary hover:text-accent-purple'
                              }`}
                >
                  <Bookmark
                    size={15}
                    className={isBookmarked ? 'fill-accent-purple' : ''}
                  />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSettingsOpen() }}
                  className="w-9 h-9 rounded-lg bg-bg-tertiary border border-border
                             flex items-center justify-center text-text-secondary
                             hover:text-text-primary hover:border-accent-purple
                             transition-all duration-200"
                >
                  <Settings size={15} />
                </button>
              </div>
            </div>

            {/* Reading progress bar */}
            {totalPages > 0 && (
              <div className="h-0.5 bg-bg-tertiary">
                <motion.div
                  className="h-full bg-gradient-to-r
                             from-accent-purple to-accent-pink"
                  animate={{ width: `${(currentPage / totalPages) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </motion.div>

          {/* ── Bottom navigation bar ── */}
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{    y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-50
                       bg-bg-primary/95 backdrop-blur-md
                       border-t border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-4xl mx-auto px-4 h-14
                            flex items-center justify-between gap-4">

              {/* Prev chapter */}
              <button
                onClick={() => prev && navigate(
                  `/read/${comicId}/${prev.ChapterID}`
                )}
                disabled={!prev}
                className="flex items-center gap-1.5 text-sm font-medium
                           text-text-secondary hover:text-text-primary
                           disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors"
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:block">
                  {prev ? `Ch.${prev.ChapterNumber}` : 'No prev'}
                </span>
              </button>

              {/* Chapter indicator */}
              <div className="flex items-center gap-2">
                <BookOpen size={15} className="text-accent-purple" />
                <span className="text-text-primary text-sm font-medium">
                  Ch.{chapter?.ChapterNumber}
                </span>
              </div>

              {/* Next chapter */}
              <button
                onClick={() => next && navigate(
                  `/read/${comicId}/${next.ChapterID}`
                )}
                disabled={!next}
                className="flex items-center gap-1.5 text-sm font-medium
                           text-text-secondary hover:text-text-primary
                           disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors"
              >
                <span className="hidden sm:block">
                  {next ? `Ch.${next.ChapterNumber}` : 'No next'}
                </span>
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ReaderControls