import { useState, useEffect }      from 'react'
import { useParams, useNavigate,
         Link }                      from 'react-router-dom'
import { motion }                    from 'framer-motion'
import {
  BookOpen, Play, Star, Eye,
  Calendar, Globe, User,
  ChevronRight, AlertCircle,
}                                    from 'lucide-react'
import { getComicById }              from '../../services/comic.service'
import { getChapters }               from '../../services/chapter.service'
import BookmarkButton                from '../../components/comic/BookmarkButton'
import ChapterList                   from '../../components/comic/ChapterList'
import ReviewSection                 from '../../components/comic/ReviewSection'
import GenreTag                      from '../../components/common/GenreTag'

// ── Status badge ──────────────────────────────────
const StatusBadge = ({ status }) => {
  const colors = {
    ongoing:   'bg-green-500/20 text-green-400 border-green-500/30',
    completed: 'bg-blue-500/20  text-blue-400  border-blue-500/30',
    hiatus:    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cancelled: 'bg-red-500/20   text-red-400   border-red-500/30',
  }
  return (
    <span className={`badge border capitalize
                      ${colors[status] || 'bg-bg-tertiary text-text-muted'}`}>
      {status}
    </span>
  )
}

// ── Info row ──────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center
                      justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-text-muted" />
      </div>
      <div>
        <p className="text-text-muted text-xs uppercase tracking-wider">
          {label}
        </p>
        <p className="text-text-primary text-sm font-medium mt-0.5">
          {value}
        </p>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────
const DetailSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 sm:h-80 bg-bg-tertiary rounded-2xl mb-8" />
    <div className="flex gap-8">
      <div className="w-48 flex-shrink-0">
        <div className="aspect-[2/3] bg-bg-tertiary rounded-xl" />
      </div>
      <div className="flex-1 space-y-4">
        <div className="h-8 bg-bg-tertiary rounded-lg w-2/3" />
        <div className="h-4 bg-bg-tertiary rounded w-1/3" />
        <div className="h-20 bg-bg-tertiary rounded-lg" />
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-bg-tertiary rounded-xl" />
          <div className="h-10 w-32 bg-bg-tertiary rounded-xl" />
        </div>
      </div>
    </div>
  </div>
)

const ComicDetail = () => {
  const { id }     = useParams()
  const navigate   = useNavigate()

  const [comic,    setComic]    = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [activeTab, setActiveTab] = useState('chapters')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [comicData, chapterData] = await Promise.all([
          getComicById(id),
          getChapters(id, 'ASC'),
        ])
        setComic(comicData)
        setChapters(chapterData)
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('/404')
        } else {
          setError('Failed to load comic. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const formatViews = (n) => {
    if (!n) return '0'
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
    return String(n)
  }

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <DetailSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-20
                      flex flex-col items-center gap-4 text-center">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-text-secondary">{error}</p>
        <button onClick={() => window.location.reload()}
                className="btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  if (!comic) return null

  const firstChapter = chapters[0]
  const continueChapter = comic.lastReadChapter
    ? chapters.find(
        (ch) => ch.ChapterID === comic.lastReadChapter.LastChapterID
      ) || chapters[0]
    : null

  return (
    <div className="min-h-screen">

      {/* ── Blurred hero background ── */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
  src={comic.CoverImageURL}
  alt={comic.Title}
  loading="lazy"
  crossOrigin="anonymous"
  onError={() => setImgError(true)}
  className="w-full h-full object-cover transition-transform
             duration-500 group-hover:scale-105"
/>
        <div className="absolute inset-0 bg-gradient-to-b
                        from-bg-primary/40 via-bg-primary/70 to-bg-primary" />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 -mt-48 relative">

        {/* ── Top section: cover + info ── */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">

          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            className="flex-shrink-0"
          >
            <div className="w-36 sm:w-48 mx-auto sm:mx-0">
              <img
  src={comic.CoverImageURL}
  alt={comic.Title}
  loading="lazy"
  crossOrigin="anonymous"
  onError={() => setImgError(true)}
  className="w-full h-full object-cover transition-transform
             duration-500 group-hover:scale-105"
/>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.1 }}
            className="flex-1 min-w-0 pt-4 sm:pt-20"
          >
            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl tracking-wide
                           text-white leading-tight mb-3">
              {comic.Title}
            </h1>

            {/* Rating + views + status row */}
            <div className="flex items-center gap-4 flex-wrap mb-4">
              <div className="flex items-center gap-1.5">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">
                  {comic.AverageRating?.toFixed(1) || 'N/A'}
                </span>
                <span className="text-text-muted text-sm">/10</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted text-sm">
                <Eye size={14} />
                {formatViews(comic.TotalViews)} views
              </div>
              <StatusBadge status={comic.Status} />
              {comic.Type && (
                <span className="badge bg-accent-purple/20
                                 text-accent-purple capitalize">
                  {comic.Type}
                </span>
              )}
            </div>

            {/* Genres */}
            {comic.genres?.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {comic.genres.map((g) => (
                  <GenreTag key={g.GenreID} genre={g} />
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-text-secondary text-sm leading-relaxed
                           mb-6 max-w-2xl line-clamp-3 sm:line-clamp-none">
              {comic.Description || 'No description available.'}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {continueChapter ? (
                <Link
                  to={`/read/${comic.ComicID}/${continueChapter.ChapterID}`}
                  className="btn-primary flex items-center gap-2"
                >
                  <Play size={15} className="fill-white" />
                  Continue Ch.{continueChapter.ChapterNumber}
                </Link>
              ) : firstChapter ? (
                <Link
                  to={`/read/${comic.ComicID}/${firstChapter.ChapterID}`}
                  className="btn-primary flex items-center gap-2"
                >
                  <BookOpen size={15} />
                  Start Reading
                </Link>
              ) : null}

              <BookmarkButton
                comicId={comic.ComicID}
                initialState={comic.isBookmarked}
              />
            </div>
          </motion.div>
        </div>

        {/* ── Info grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8
                     p-5 card"
        >
          <InfoRow icon={User}     label="Author"  value={comic.AuthorName}          />
          <InfoRow icon={Calendar} label="Year"    value={comic.ReleaseYear}         />
          <InfoRow icon={Globe}    label="Language" value={comic.Language?.toUpperCase()} />
          <InfoRow icon={BookOpen} label="Chapters" value={chapters.length}          />
        </motion.div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mt-8 border-b border-border">
          {['chapters', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize
                          transition-all duration-200 border-b-2 -mb-px
                          ${activeTab === tab
                            ? 'border-accent-purple text-accent-purple'
                            : 'border-transparent text-text-muted hover:text-text-primary'
                          }`}
            >
              {tab}
              {tab === 'chapters' && chapters.length > 0 && (
                <span className="ml-2 text-xs text-text-muted">
                  {chapters.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="mt-6 mb-16">
          {activeTab === 'chapters' && (
            <ChapterList
              chapters={chapters}
              comicId={comic.ComicID}
              lastChapterId={comic.lastReadChapter?.LastChapterID}
            />
          )}
          {activeTab === 'reviews' && (
            <ReviewSection comicId={comic.ComicID} />
          )}
        </div>

      </div>
    </div>
  )
}

export default ComicDetail