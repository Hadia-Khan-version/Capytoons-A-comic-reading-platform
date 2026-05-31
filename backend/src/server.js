import express         from 'express'
import cors            from 'cors'
import helmet          from 'helmet'
import morgan          from 'morgan'
import rateLimit       from 'express-rate-limit'
import { env }         from './config/env.js'
import { testConnection } from './db/pool.js'

// ── Route imports (added as we build each module) ──
import authRoutes      from './routes/auth.routes.js'
import comicRoutes     from './routes/comic.routes.js'
import chapterRoutes   from './routes/chapter.routes.js'
import bookmarkRoutes  from './routes/bookmark.routes.js'
import historyRoutes   from './routes/history.routes.js'
import reviewRoutes    from './routes/review.routes.js'
import searchRoutes    from './routes/search.routes.js'

const app = express()

// ── Security Middleware ───────────────────────────
app.use(helmet())

app.use(cors({
  origin:      env.clientUrl,
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Rate Limiting ─────────────────────────────────
const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max:      env.rateLimit.max,
  message:  { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,

  // Skip rate limiting for localhost during development
  skip: (req) => {
    const ip = req.ip || req.connection.remoteAddress
    return (
      ip === '127.0.0.1'      ||
      ip === '::1'            ||
      ip === '::ffff:127.0.0.1' ||
      env.NODE_ENV === 'development'
    )
  },
})
app.use('/api', limiter)

// ── Body Parsing ──────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Logging ───────────────────────────────────────
if (env.isDev) {
  app.use(morgan('dev'))
}

// ── Health Check ──────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CapyToons API is running',
    env:     env.NODE_ENV,
    time:    new Date().toISOString(),
  })
})

// ── API Routes ────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/comics',    comicRoutes)
app.use('/api/chapters',  chapterRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/history',   historyRoutes)
app.use('/api/reviews',   reviewRoutes)
app.use('/api/search',    searchRoutes)

// Reset weekly views every Monday at midnight
const resetWeeklyViews = async () => {
  try {
    const { execute } = await import('./db/index.js')
    await execute('UPDATE ComicView SET WeeklyViews = 0', [])
    console.log('✅ Weekly views reset')
  } catch (err) {
    console.error('Weekly reset failed:', err.message)
  }
}

// Check every hour if it's Monday midnight
setInterval(() => {
  const now = new Date()
  if (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() < 5) {
    resetWeeklyViews()
  }
}, 1000 * 60 * 60)

// ── 404 Handler ───────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
})

// ── Global Error Handler ──────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message    = err.message    || 'Internal Server Error'

  if (env.isDev) {
    console.error(`❌  [${req.method}] ${req.originalUrl} — ${message}`)
    console.error(err.stack)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isDev && { stack: err.stack }),
  })
})

// ── Start Server ──────────────────────────────────
const start = async () => {
  await testConnection()

  app.listen(env.PORT, () => {
    console.log(`\n🚀  CapyToons API running on http://localhost:${env.PORT}`)
    console.log(`📦  Environment: ${env.NODE_ENV}`)
    console.log(`🗄️   Database:    ${env.db.name} @ ${env.db.host}\n`)
  })
}

start()