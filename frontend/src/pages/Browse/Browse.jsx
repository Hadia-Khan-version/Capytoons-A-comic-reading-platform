import { useState, useEffect,
         useCallback, useRef }     from 'react'
import { motion }                  from 'framer-motion'
import { SlidersHorizontal,
         Search, Loader2 }         from 'lucide-react'
import ComicCard                   from '../../components/comic/ComicCard'
import SkeletonCard                from '../../components/common/SkeletonCard'
import FilterSidebar               from '../../components/browse/FilterSidebar'
import EmptyState                  from '../../components/common/EmptyState'
import useQueryParams              from '../../hooks/useQueryParams'
import useInfiniteScroll           from '../../hooks/useInfiniteScroll'
import useDebounce                 from '../../hooks/useDebounce'
import { searchComics, getAllGenres } from '../../services/comic.service'

const Browse = () => {
  const { getParam, setParam, setParams, clearAll } = useQueryParams()

  // ── Filter state from URL ─────────────────────
  const q        = getParam('q')
  const status   = getParam('status')
  const type     = getParam('type')
  const language = getParam('language')
  const genreId  = getParam('genreId')
  const sortBy   = getParam('sortBy', 'AverageRating')
  const order    = getParam('order',  'DESC')

  // ── Local state ───────────────────────────────
  const [comics,       setComics]       = useState([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [hasMore,      setHasMore]      = useState(true)
  const [loading,      setLoading]      = useState(false)
  const [initialLoad,  setInitialLoad]  = useState(true)
  const [genres,       setGenres]       = useState([])
  const [mobileFilter, setMobileFilter] = useState(false)
  const [searchInput,  setSearchInput]  = useState(q)

  const debouncedSearch = useDebounce(searchInput, 400)
  const LIMIT = 24

  // ── Fetch genres once ─────────────────────────
  useEffect(() => {
    getAllGenres().then(setGenres).catch(() => {})
  }, [])

  // ── Sync debounced search to URL ──────────────
  useEffect(() => {
    if (debouncedSearch !== q) {
      setParam('q', debouncedSearch)
    }
  }, [debouncedSearch])

  // ── Reset and fetch when filters change ───────
  useEffect(() => {
    setComics([])
    setPage(1)
    setHasMore(true)
    setInitialLoad(true)
    fetchComics(1, true)
  }, [q, status, type, language, genreId, sortBy, order])

  const fetchComics = useCallback(async (pageNum = 1, reset = false) => {
    if (loading) return
    setLoading(true)

    try {
      const result = await searchComics({
        q, status, type, language, genreId,
        sortBy, order,
        page:  pageNum,
        limit: LIMIT,
      })

      const newComics = result.data || []

      setComics((prev) => reset ? newComics : [...prev, ...newComics])
      setTotal(result.pagination?.total || 0)
      setHasMore(result.pagination?.hasMore || false)
      setPage(pageNum)
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [q, status, type, language, genreId, sortBy, order])

  // ── Infinite scroll trigger ───────────────────
  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchComics(page + 1)
  }, [loading, hasMore, page, fetchComics])

  const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading)

  // ── Filter change handlers ────────────────────
  const handleFilterChange = (key, value) => setParam(key, value)
  const handleClearAll     = () => {
    setSearchInput('')
    clearAll()
  }

  const activeFilters = { status, type, language, genreId, sortBy }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-display tracking-wider gradient-text mb-1">
          Browse Comics
        </h1>
        <p className="text-text-muted text-sm">
          {total > 0
            ? `${total.toLocaleString()} titles found`
            : 'Search and filter your next read'
          }
        </p>
      </div>

      {/* ── Search + Mobile filter toggle ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-lg">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2
                       text-text-muted pointer-events-none"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title..."
            className="input pl-10 h-11"
          />
        </div>

        {/* Order toggle */}
        <button
          onClick={() =>
            setParam('order', order === 'DESC' ? 'ASC' : 'DESC')
          }
          className="btn-secondary h-11 px-4 text-sm hidden sm:flex
                     items-center gap-2"
        >
          {order === 'DESC' ? '↓ Desc' : '↑ Asc'}
        </button>

        {/* Mobile filter button */}
        <button
          onClick={() => setMobileFilter(true)}
          className="lg:hidden btn-secondary h-11 px-4 flex items-center gap-2"
        >
          <SlidersHorizontal size={16} />
          <span className="text-sm">Filter</span>
          {Object.values(activeFilters).filter(Boolean).length > 0 && (
            <span className="badge bg-accent-purple text-white text-[10px]">
              {Object.values(activeFilters).filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* ── Layout: sidebar + grid ── */}
      <div className="flex gap-6 items-start">

        {/* Filter Sidebar */}
        <FilterSidebar
          genres={genres}
          filters={activeFilters}
          onChange={handleFilterChange}
          onClear={handleClearAll}
          mobileOpen={mobileFilter}
          onMobileClose={() => setMobileFilter(false)}
        />

        {/* Comic Grid */}
        <div className="flex-1 min-w-0">

          {/* Initial skeleton */}
          {initialLoad ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                            xl:grid-cols-5 gap-4">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : comics.length === 0 ? (
            <EmptyState
              title="No comics found"
              message="Try different filters or a different search term."
              action={
                <button onClick={handleClearAll} className="btn-primary">
                  Clear Filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                              xl:grid-cols-5 gap-4">
                {comics.map((comic, i) => (
                  <motion.div
                    key={`${comic.ComicID}-${i}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0  }}
                    transition={{ delay: (i % LIMIT) * 0.03 }}
                  >
                    <ComicCard comic={comic} />
                  </motion.div>
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="mt-8 flex justify-center">
                {loading && (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-sm">Loading more...</span>
                  </div>
                )}
                {!hasMore && comics.length > 0 && (
                  <p className="text-text-muted text-sm py-4">
                    You've reached the end — {total.toLocaleString()} titles total
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Browse