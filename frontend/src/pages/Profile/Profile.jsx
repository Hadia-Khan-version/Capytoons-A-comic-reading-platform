import { useState, useEffect, useRef } from 'react'
import { Link }                         from 'react-router-dom'
import { motion }                       from 'framer-motion'
import {
  Bookmark, History, Star,
  Mail, Calendar, BookOpen,
}                                       from 'lucide-react'
import useAuthStore                     from '../../store/authStore'
import { getBookmarks }                 from '../../services/bookmark.service'
import { getHistory }                   from '../../services/history.service'
import { getReviews }                   from '../../services/review.service'
import { getMyReviewCount } from '../../services/review.service'


const StatCard = ({ icon: Icon, label, value, to, color }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ y: -3 }}
      className="card p-5 flex flex-col gap-3 hover:border-accent-purple/30
                 transition-all duration-200 cursor-pointer"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center
                       justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-display tracking-wider text-text-primary">
          {value}
        </p>
        <p className="text-text-muted text-sm">{label}</p>
      </div>
    </motion.div>
  </Link>
)

const Profile = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    bookmarks: '—',
    history:   '—',
    reviews:   '—',
  })
  const fetchedRef = useRef(false)

  const formatJoinDate = (d) => {
    if (!d) return 'Unknown'
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  useEffect(() => {
    if (fetchedRef.current || !user) return
    fetchedRef.current = true

    const fetchStats = async () => {
      try {
        const [b, h, r] = await Promise.allSettled([
  getBookmarks({ page: 1, limit: 1 }),
  getHistory({ page: 1, limit: 1 }),
  getMyReviewCount(),
])

setStats({
  bookmarks: b.status === 'fulfilled' ? b.value?.pagination?.total ?? 0 : 0,
  history:   h.status === 'fulfilled' ? h.value?.pagination?.total ?? 0 : 0,
  reviews:   r.status === 'fulfilled' ? r.value ?? 0 : 0,
})
      } catch {
        // silently fail — stats stay as dashes
      }
    }

    fetchStats()
  }, [user])

  if (!user) return null

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Profile header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0  }}
        className="card p-6 sm:p-8 mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-6 items-start
                        sm:items-center">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={user.AvatarURL}
              alt={user.Username}
              crossOrigin="anonymous"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${user.Username}&background=8B5CF6&color=fff&size=96`
              }}
              className="w-24 h-24 rounded-2xl object-cover
                         border-2 border-accent-purple/40"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full
                            bg-green-500 border-2 border-bg-secondary" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display tracking-wider
                           text-text-primary">
              {user.Username}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center
                            gap-1.5 sm:gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-text-muted text-sm">
                <Mail size={13} />
                {user.Email}
              </div>
              <div className="flex items-center gap-1.5 text-text-muted text-sm">
                <Calendar size={13} />
                Joined {formatJoinDate(user.JoinDate)}
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <span className="badge bg-accent-purple/20 text-accent-purple
                               border border-accent-purple/30">
                Member
              </span>
              <span className="badge bg-bg-tertiary text-text-muted
                               border border-border">
                Reader
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6"
      >
        <StatCard
          icon={Bookmark}
          label="Bookmarks"
          value={stats.bookmarks}
          to="/bookmarks"
          color="bg-accent-purple/20 text-accent-purple"
        />
        <StatCard
          icon={History}
          label="Read"
          value={stats.history}
          to="/history"
          color="bg-accent-pink/20 text-accent-pink"
        />
        <StatCard
          icon={Star}
          label="Reviews"
          value={stats.reviews}
          to="/profile"
          color="bg-yellow-500/20 text-yellow-400"
        />
      </motion.div>

      {/* ── Quick links ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ delay: 0.2 }}
        className="card p-5"
      >
        <h3 className="text-text-primary font-semibold mb-4">
          Quick Access
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              to:    '/bookmarks',
              icon:  Bookmark,
              label: 'My Bookmarks',
              desc:  'View your saved comics',
              color: 'text-accent-purple',
            },
            {
              to:    '/history',
              icon:  History,
              label: 'Reading History',
              desc:  'Continue where you left off',
              color: 'text-accent-pink',
            },
            {
              to:    '/browse',
              icon:  BookOpen,
              label: 'Discover Comics',
              desc:  'Find your next read',
              color: 'text-blue-400',
            },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-4 p-4 rounded-xl
                         bg-bg-tertiary hover:bg-border
                         border border-transparent
                         hover:border-accent-purple/20
                         transition-all duration-200 group"
            >
              <div className={`w-9 h-9 rounded-lg bg-bg-secondary
                               flex items-center justify-center
                               ${item.color} group-hover:scale-110
                               transition-transform duration-200`}>
                <item.icon size={16} />
              </div>
              <div>
                <p className="text-text-primary text-sm font-medium">
                  {item.label}
                </p>
                <p className="text-text-muted text-xs">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Profile