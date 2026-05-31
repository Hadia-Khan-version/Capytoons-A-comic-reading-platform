import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense }          from 'react'
import MainLayout                  from './components/common/MainLayout'
import ProtectedRoute              from './routes/ProtectedRoute'
import PageLoader                  from './components/common/PageLoader'

// ── Lazy loaded pages ─────────────────────────────
const Home        = lazy(() => import('./pages/Home/Home'))
const Browse      = lazy(() => import('./pages/Browse/Browse'))
const ComicDetail = lazy(() => import('./pages/Comic/ComicDetail'))
const Reader      = lazy(() => import('./pages/Reader/Reader'))
const Login       = lazy(() => import('./pages/Auth/Login'))
const Register    = lazy(() => import('./pages/Auth/Register'))
const Profile     = lazy(() => import('./pages/Profile/Profile'))
const Bookmarks   = lazy(() => import('./pages/Profile/Bookmarks'))
const History     = lazy(() => import('./pages/Profile/History'))
const NotFound    = lazy(() => import('./pages/NotFound'))

const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Public routes inside main layout ── */}
        <Route element={<MainLayout />}>
          <Route path="/"              element={<Home />} />
          <Route path="/browse"        element={<Browse />} />
          <Route path="/comic/:id"     element={<ComicDetail />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />

          {/* ── Protected routes ── */}
          <Route path="/profile"
            element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            }
          />
          <Route path="/bookmarks"
            element={
              <ProtectedRoute><Bookmarks /></ProtectedRoute>
            }
          />
          <Route path="/history"
            element={
              <ProtectedRoute><History /></ProtectedRoute>
            }
          />
        </Route>

        {/* ── Reader: full screen, no navbar ── */}
        <Route
          path="/read/:comicId/:chapterId"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Reader />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* ── Fallbacks ── */}
        <Route path="/404"  element={<NotFound />} />
        <Route path="*"     element={<Navigate to="/404" replace />} />

      </Routes>
    </Suspense>
  )
}

export default App