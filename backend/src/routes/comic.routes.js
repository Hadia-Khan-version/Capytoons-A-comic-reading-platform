import { Router }       from 'express'
import * as ctrl        from '../controllers/comic.controller.js'
import { optionalAuth } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess }  from '../utils/response.js'

const router = Router()

// GET /api/comics/trending
router.get('/trending',        ctrl.getTrending)

// GET /api/comics/most-viewed
router.get('/most-viewed',     ctrl.getMostViewed)

// GET /api/comics/recent
router.get('/recent',          ctrl.getRecent)

// GET /api/comics/genres
router.get('/genres',          ctrl.getAllGenres)

// GET /api/comics/genres/:genreId
router.get('/genres/:genreId', ctrl.getComicsByGenre)

// GET /api/comics/search?q=...&status=...&type=...
router.get('/search',          ctrl.searchComics)

// GET /api/comics          (paginated list)
router.get('/',                ctrl.getAllComics)

// GET /api/comics/:id      (single comic, optional auth for bookmark/history)
router.get('/:id',             optionalAuth, ctrl.getComicById)

export default router