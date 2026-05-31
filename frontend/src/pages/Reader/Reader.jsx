import { useState, useEffect,
         useCallback, useRef }       from 'react'
import { useParams, useNavigate }    from 'react-router-dom'
import { motion, AnimatePresence }   from 'framer-motion'
import { Loader2, AlertCircle,
         ChevronUp }                 from 'lucide-react'
import ReaderImage                   from '../../components/reader/ReaderImage'
import ReaderControls                from '../../components/reader/ReaderControls'
import ReaderSettings                from '../../components/reader/ReaderSettings'
import useReadingProgress            from '../../hooks/useReadingProgress'
import useKeyboardNav                from '../../hooks/useKeyboardNav'
import { getChapterPages }           from '../../services/chapter.service'

// ── Default settings ──────────────────────────────
const DEFAULT_SETTINGS = {
  fitWidth:        true,
  lightMode:       false,
  showPageNumbers: true,
  pageGap:         true,
}

const Reader = () => {
  const { comicId, chapterId } = useParams()
  const navigate               = useNavigate()

  // ── Data state ────────────────────────────────
  const [data,     setData]     = useState(null)   // { chapter, pages, prev, next }
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  // ── UI state ──────────────────────────────────
  const [controlsVisible, setControlsVisible] = useState(true)
  const [settingsOpen,    setSettingsOpen]    = useState(false)
  const [isBookmarked,    setIsBookmarked]    = useState(false)
  const [currentPage,     setCurrentPage]     = useState(1)
  const [showScrollTop,   setShowScrollTop]   = useState(false)

  // ── Settings (persisted to localStorage) ─────
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('capytoons-reader-settings')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  // ── Refs ──────────────────────────────────────
  const hideTimer    = useRef(null)
  const readerRef    = useRef(null)

  // ── Auto-save reading progress ────────────────
  useReadingProgress(comicId, chapterId)

  // ── Fetch chapter data ────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      window.scrollTo(0, 0)
      try {
        const result = await getChapterPages(comicId, chapterId)
        setData(result)
      } catch (err) {
        if (err.response?.status === 404) navigate('/404')
        else setError('Failed to load chapter. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [comicId, chapterId])

  // ── Controls auto-hide logic ──────────────────
  const resetHideTimer = useCallback(() => {
    clearTimeout(hideTimer.current)
    setControlsVisible(true)
    hideTimer.current = setTimeout(() => {
      if (!settingsOpen) setControlsVisible(false)
    }, 3000)
  }, [settingsOpen])

  useEffect(() => {
    resetHideTimer()
    return () => clearTimeout(hideTimer.current)
  }, [resetHideTimer])

  // Show controls on any mouse/touch activity
  useEffect(() => {
    const show = () => resetHideTimer()
    window.addEventListener('mousemove',  show)
    window.addEventListener('touchstart', show)
    return () => {
      window.removeEventListener('mousemove',  show)
      window.removeEventListener('touchstart', show)
    }
  }, [resetHideTimer])

  // Keep controls visible when settings panel is open
  useEffect(() => {
    if (settingsOpen) {
      clearTimeout(hideTimer.current)
      setControlsVisible(true)
    }
  }, [settingsOpen])

  // ── Track current page via scroll ────────────
  useEffect(() => {
    if (!data?.pages?.length) return

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600)

      // Estimate current page from scroll position
      const scrollRatio = window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight)
      const estimated = Math.max(
        1,
        Math.ceil(scrollRatio * data.pages.length)
      )
      setCurrentPage(Math.min(estimated, data.pages.length))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [data?.pages?.length])

  // ── Settings handler ──────────────────────────
  const handleSettingChange = (key, value) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    try {
      localStorage.setItem('capytoons-reader-settings', JSON.stringify(next))
    } catch { /* ignore */ }
  }

  // ── Navigation ────────────────────────────────
  const goToPrev = useCallback(() => {
    if (data?.prev) navigate(`/read/${comicId}/${data.prev.ChapterID}`)
  }, [data?.prev, comicId, navigate])

  const goToNext = useCallback(() => {
    if (data?.next) navigate(`/read/${comicId}/${data.next.ChapterID}`)
  }, [data?.next, comicId, navigate])

  // ── Keyboard navigation ───────────────────────
  useKeyboardNav({
    onPrev:          goToPrev,
    onNext:          goToNext,
    onToggleControls: () => setControlsVisible((v) => !v),
  })

  // ── Click reader area to toggle controls ──────
  const handleReaderClick = (e) => {
    if (settingsOpen) { setSettingsOpen(false); return }
    setControlsVisible((v) => !v)
  }

  // ── Loading ───────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center
                      justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-accent-purple" />
          <p className="text-text-muted text-sm">Loading chapter...</p>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center
                      justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle size={40} className="text-red-400" />
          <p className="text-text-secondary">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry
            </button>
            <button
              onClick={() => navigate(`/comic/${comicId}`)}
              className="btn-secondary"
            >
              Back to Comic
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { chapter, pages, prev, next } = data

  return (
    <div
      className={`min-h-screen transition-colors duration-300
                  ${settings.lightMode ? 'bg-gray-100' : 'bg-[#0a0a0a]'}`}
      onClick={handleReaderClick}
    >
      {/* ── Floating Controls ── */}
      <ReaderControls
        visible={controlsVisible}
        chapter={chapter}
        prev={prev}
        next={next}
        comicId={comicId}
        isBookmarked={isBookmarked}
        onSettingsOpen={() => setSettingsOpen(true)}
        currentPage={currentPage}
        totalPages={pages.length}
      />

      {/* ── Reader Settings Panel ── */}
      <ReaderSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={handleSettingChange}
      />

      {/* ── Pages ── */}
      <div
        ref={readerRef}
        className={`w-full max-w-3xl mx-auto
                    pt-16 pb-24
                    ${settings.pageGap ? 'flex flex-col gap-1' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {pages.map((page) => (
          <ReaderImage
            key={page.PageID}
            page={page}
            fitWidth={settings.fitWidth}
          />
        ))}

        {/* ── End of chapter ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-4 py-12 px-4 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-px h-12 bg-border" />
          <p className="text-text-muted text-sm font-mono tracking-wider">
            END OF CHAPTER {chapter.ChapterNumber}
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            {prev && (
              <button
                onClick={goToPrev}
                className="btn-secondary flex items-center gap-2"
              >
                ← Chapter {prev.ChapterNumber}
              </button>
            )}
            {next ? (
              <button
                onClick={goToNext}
                className="btn-primary flex items-center gap-2"
              >
                Chapter {next.ChapterNumber} →
              </button>
            ) : (
              <div className="card px-5 py-3 text-text-muted text-sm">
                You're all caught up! 🎉
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Scroll to top button ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1   }}
            exit={{    opacity: 0, scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="fixed bottom-20 right-4 z-40
                       w-10 h-10 rounded-full
                       bg-bg-secondary border border-border
                       flex items-center justify-center
                       text-text-secondary hover:text-text-primary
                       hover:border-accent-purple shadow-card
                       transition-all duration-200"
          >
            <ChevronUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Reader