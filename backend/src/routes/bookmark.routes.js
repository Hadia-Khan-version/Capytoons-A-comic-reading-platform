import { Router }  from 'express'
import { body }    from 'express-validator'
import * as ctrl   from '../controllers/bookmark.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'

const router = Router()

// All bookmark routes require authentication
router.use(protect)

const bookmarkRules = [
  body('comicId')
    .notEmpty().withMessage('comicId is required')
    .isInt({ min: 1 }).withMessage('comicId must be a positive integer'),
  body('listType')
    .optional()
    .isIn(['reading', 'completed', 'on_hold', 'dropped', 'plan_to_read'])
    .withMessage('Invalid list type'),
]

// GET  /api/bookmarks
router.get('/',                    ctrl.getUserBookmarks)

// POST /api/bookmarks
router.post('/', bookmarkRules, validate, ctrl.addBookmark)

// POST /api/bookmarks/toggle
router.post('/toggle', bookmarkRules, validate, ctrl.toggleBookmark)

// DELETE /api/bookmarks/:comicId
router.delete('/:comicId',         ctrl.removeBookmark)

export default router