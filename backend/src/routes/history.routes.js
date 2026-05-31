import { Router }  from 'express'
import { body }    from 'express-validator'
import * as ctrl   from '../controllers/history.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'

const router = Router()

router.use(protect)

const progressRules = [
  body('comicId')
    .notEmpty().withMessage('comicId is required')
    .isInt({ min: 1 }).withMessage('Must be a valid comic ID'),
  body('chapterId')
    .notEmpty().withMessage('chapterId is required')
    .isInt({ min: 1 }).withMessage('Must be a valid chapter ID'),
]

// GET  /api/history
router.get('/',                   ctrl.getHistory)

// POST /api/history
router.post('/', progressRules, validate, ctrl.saveProgress)

// DELETE /api/history/all
router.delete('/all',             ctrl.clearAllHistory)

// DELETE /api/history/:comicId
router.delete('/:comicId',        ctrl.deleteHistoryEntry)

export default router