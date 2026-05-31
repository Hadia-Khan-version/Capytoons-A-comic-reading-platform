import { Router }        from 'express'
import { asyncHandler }  from '../utils/asyncHandler.js'
import { sendSuccess }   from '../utils/response.js'
import { query }         from '../db/index.js'

const router = Router()

// GET /api/search/suggestions?q=one piece
// Returns lightweight title list for autocomplete
router.get('/suggestions', asyncHandler(async (req, res) => {
  const { q = '' } = req.query

  if (q.trim().length < 2) {
    return sendSuccess(res, { data: [] })
  }

  const results = await query(
    `SELECT ComicID, Title, CoverImageURL, Type, Status
     FROM Comic
     WHERE Title LIKE ?
     ORDER BY AverageRating DESC
     LIMIT 8`,
    [`%${q}%`]
  )

  sendSuccess(res, { data: results })
}))

export default router