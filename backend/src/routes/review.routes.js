import { Router }       from 'express'
import { body }         from 'express-validator'
import * as ctrl        from '../controllers/review.controller.js'
import { protect }      from '../middleware/auth.middleware.js'
import { validate }     from '../middleware/validate.middleware.js'

const router = Router()

const reviewRules = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isFloat({ min: 1, max: 10 }).withMessage('Rating must be between 1 and 10'),
  body('reviewText')
    .optional()
    .isLength({ max: 2000 }).withMessage('Review cannot exceed 2000 characters'),
]

// GET  /api/reviews/my/count  (protected) — must be before /:comicId
router.get('/my/count', protect, ctrl.getUserReviewCount)

// GET  /api/reviews/:comicId
router.get('/:comicId',              ctrl.getReviews)

// POST /api/reviews/:comicId
router.post('/:comicId', protect, reviewRules, validate, ctrl.addReview)

// PUT  /api/reviews/:reviewId
router.put('/:reviewId', protect, reviewRules, validate, ctrl.updateReview)

// DELETE /api/reviews/:reviewId
router.delete('/:reviewId', protect, ctrl.deleteReview)

export default router