import { useState, useEffect }     from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence }    from 'framer-motion'
import {
  Home, Grid, Bookmark, History,
  User, LogOut, Menu, X, Search,
  ChevronDown,
}                                     from 'lucide-react'
import useAuthStore                   from '../../store/authStore'
import SearchBar                      from './SearchBar'

// ── Nav link helper ───────────────────────────────
const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
       transition-colors duration-200
       ${isActive
         ? 'text-accent-purple bg-accent-purple/10'
         : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
       }`
    }
  >
    <Icon size={16} />
    <span className="hidden lg:inline">{label}</span>
  </NavLink>
)

const Navbar = () => {
  const [scrolled,       setScrolled]       = useState(false)
  const [mobileOpen,     setMobileOpen]     = useState(false)
  const [searchOpen,     setSearchOpen]     = useState(false)
  const [profileOpen,    setProfileOpen]    = useState(false)

  const { user, isAuthenticated, logout }   = useAuthStore()
  const navigate                            = useNavigate()
  const isAuth                              = isAuthenticated()

  // Navbar background on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleLogout = async () => {
    await logout()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300
          ${scrolled
            ? 'bg-bg-primary/95 backdrop-blur-md border-b border-border shadow-card'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">

            {/* ── Logo ── */}
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br
                              from-accent-purple to-accent-pink
                              flex items-center justify-center">
                <span className="text-white font-display text-lg leading-none">
                  C
                </span>
              </div>
              <span className="font-display text-xl tracking-wider
                               gradient-text hidden sm:block">
                CAPYTOONS
              </span>
            </Link>

            {/* ── Desktop Search ── */}
            <div className="flex-1 hidden md:flex justify-center px-4">
              <SearchBar />
            </div>

            {/* ── Desktop Nav Links ── */}
            <nav className="hidden md:flex items-center gap-1">
              <NavItem to="/"          icon={Home}     label="Home"      />
              <NavItem to="/browse"    icon={Grid}     label="Browse"    />
              {isAuth && (
                <>
                  <NavItem to="/bookmarks" icon={Bookmark} label="Bookmarks" />
                  <NavItem to="/history"   icon={History}  label="History"   />
                </>
              )}
            </nav>

            {/* ── Auth Area ── */}
            <div className="flex items-center gap-2 ml-auto md:ml-0">

              {/* Mobile search toggle */}
              <button
                onClick={() => setSearchOpen((p) => !p)}
                className="md:hidden btn-ghost p-2"
              >
                <Search size={20} />
              </button>

              {isAuth ? (
                /* Profile dropdown */
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((p) => !p)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1
                               rounded-xl hover:bg-bg-tertiary
                               transition-colors duration-200"
                  >
                    <img
                      src={user?.AvatarURL}
                      alt={user?.Username}
                      className="w-8 h-8 rounded-full object-cover
                                 border-2 border-accent-purple/40"
                    />
                    <span className="text-sm font-medium text-text-primary
                                     hidden sm:block max-w-[100px] truncate">
                      {user?.Username}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-text-muted transition-transform
                                  ${profileOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0,  scale: 1    }}
                        exit={{    opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48
                                   bg-bg-secondary border border-border
                                   rounded-xl shadow-card overflow-hidden z-50"
                      >
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3
                                     hover:bg-bg-tertiary transition-colors"
                        >
                          <User size={15} className="text-text-muted" />
                          <span className="text-sm text-text-primary">
                            Profile
                          </span>
                        </Link>
                        <Link
                          to="/bookmarks"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3
                                     hover:bg-bg-tertiary transition-colors"
                        >
                          <Bookmark size={15} className="text-text-muted" />
                          <span className="text-sm text-text-primary">
                            Bookmarks
                          </span>
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3
                                     hover:bg-bg-tertiary transition-colors"
                        >
                          <History size={15} className="text-text-muted" />
                          <span className="text-sm text-text-primary">
                            History
                          </span>
                        </Link>
                        <div className="border-t border-border" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 w-full
                                     hover:bg-bg-tertiary transition-colors
                                     text-red-400 hover:text-red-300"
                        >
                          <LogOut size={15} />
                          <span className="text-sm">Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Login / Register buttons */
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="btn-ghost text-sm hidden sm:block"
                  >
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((p) => !p)}
                className="md:hidden btn-ghost p-2 ml-1"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* ── Mobile Search Bar ── */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{    height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden pb-3"
              >
                <SearchBar onClose={() => setSearchOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{    height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden
                         border-t border-border bg-bg-secondary"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {[
                  { to: '/',          icon: Home,     label: 'Home'      },
                  { to: '/browse',    icon: Grid,     label: 'Browse'    },
                  ...(isAuth ? [
                    { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
                    { to: '/history',   icon: History,  label: 'History'   },
                    { to: '/profile',   icon: User,     label: 'Profile'   },
                  ] : []),
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3
                               rounded-xl hover:bg-bg-tertiary
                               transition-colors text-text-secondary
                               hover:text-text-primary"
                  >
                    <item.icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}

                {/* Mobile auth buttons */}
                {!isAuth && (
                  <div className="flex gap-3 mt-2 pt-3 border-t border-border">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="btn-secondary flex-1 text-center text-sm"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary flex-1 text-center text-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                {isAuth && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3
                               rounded-xl hover:bg-bg-tertiary
                               transition-colors text-red-400 mt-1
                               border-t border-border"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}

export default Navbar