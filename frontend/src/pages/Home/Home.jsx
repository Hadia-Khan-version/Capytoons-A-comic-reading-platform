import { useEffect, useState }    from 'react'
import { motion }                 from 'framer-motion'
import HeroBanner                 from '../../components/home/HeroBanner'
import TrendingRow                from '../../components/home/TrendingRow'
import ComicGrid                  from '../../components/comic/ComicGrid'
import SectionHeader              from '../../components/common/SectionHeader'
import GenreTag                   from '../../components/common/GenreTag'
import {
  getTrending,
  getMostViewed,
  getRecent,
  getAllGenres,
}                                 from '../../services/comic.service'

// Fade-up animation for each section
const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const Home = () => {
  const [trending,    setTrending]    = useState([])
  const [mostViewed,  setMostViewed]  = useState([])
  const [recent,      setRecent]      = useState([])
  const [genres,      setGenres]      = useState([])

  const [loadingHero,     setLoadingHero]     = useState(true)
  const [loadingTrending, setLoadingTrending] = useState(true)
  const [loadingViewed,   setLoadingViewed]   = useState(true)
  const [loadingRecent,   setLoadingRecent]   = useState(true)
  const [loadingGenres,   setLoadingGenres]   = useState(true)

  useEffect(() => {
    // Fetch all sections in parallel
    const fetchAll = async () => {
      try {
        const [t, mv, r, g] = await Promise.allSettled([
          getTrending(8),
          getMostViewed(12),
          getRecent(12),
          getAllGenres(),
        ])

        if (t.status  === 'fulfilled') {
          setTrending(t.value)
          setLoadingHero(false)
          setLoadingTrending(false)
        }
        if (mv.status === 'fulfilled') {
          setMostViewed(mv.value)
          setLoadingViewed(false)
        }
        if (r.status  === 'fulfilled') {
          setRecent(r.value)
          setLoadingRecent(false)
        }
        if (g.status  === 'fulfilled') {
          setGenres(g.value)
          setLoadingGenres(false)
        }
      } catch {
        setLoadingHero(false)
        setLoadingTrending(false)
        setLoadingViewed(false)
        setLoadingRecent(false)
        setLoadingGenres(false)
      }
    }

    fetchAll()
  }, [])

  return (
    <div className="min-h-screen">

      {/* ── Hero Banner ── */}
      <HeroBanner comics={trending.slice(0, 5)} />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12
                      flex flex-col gap-14">

        {/* ── Trending This Week ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader
            title="🔥 Trending"
            viewAllLink="/browse?sortBy=WeeklyViews&order=DESC"
          />
          <TrendingRow
            comics={trending}
            loading={loadingTrending}
          />
        </motion.section>

        {/* ── Genres ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader title="📚 Browse by Genre" viewAllLink="/browse" />
          {loadingGenres ? (
            <div className="flex gap-3 flex-wrap">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-24 rounded-full bg-bg-tertiary animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {genres.map((genre) => (
                <GenreTag key={genre.GenreID} genre={genre} />
              ))}
            </div>
          )}
        </motion.section>

        {/* ── Most Viewed ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader
            title="👁 Most Viewed"
            viewAllLink="/browse?sortBy=TotalViews&order=DESC"
          />
          <ComicGrid
            comics={mostViewed}
            loading={loadingViewed}
            skeletonCount={12}
          />
        </motion.section>

        {/* ── Recently Added ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader
            title="✨ Recently Added"
            viewAllLink="/browse?sortBy=ComicID&order=DESC"
          />
          <ComicGrid
            comics={recent}
            loading={loadingRecent}
            skeletonCount={12}
          />
        </motion.section>

      </div>
    </div>
  )
}

export default Home