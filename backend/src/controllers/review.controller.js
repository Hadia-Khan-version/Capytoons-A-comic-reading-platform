import * as reviewService from '../services/review.service.js'
import { sendSuccess, sendPaginated } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const result = await reviewService.getReviewsByComicId(
    req.params.comicId,
    { page, limit }
  )
  sendPaginated(res, result)
})

export const addReview = asyncHandler(async (req, res) => {
  const { rating, reviewText } = req.body
  const review = await reviewService.addReview(
    req.user.UserID,
    req.params.comicId,
    { rating, reviewText }
  )
  sendSuccess(res, { data: review }, 'Review added', 201)
})

export const updateReview = asyncHandler(async (req, res) => {
  const { rating, reviewText } = req.body
  const review = await reviewService.updateReview(
    req.user.UserID,
    req.params.reviewId,
    { rating, reviewText }
  )
  sendSuccess(res, { data: review }, 'Review updated')
})

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.user.UserID, req.params.reviewId)
  sendSuccess(res, {}, 'Review deleted')
})

export const getUserReviewCount = asyncHandler(async (req, res) => {
  const count = await reviewService.getUserReviewCount(req.user.UserID)
  sendSuccess(res, { data: { total: count } })
})