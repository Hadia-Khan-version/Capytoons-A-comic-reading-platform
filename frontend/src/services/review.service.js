import api from './api'

export const getReviews  = (comicId, params) =>
  api.get(`/reviews/${comicId}`, { params }).then(r => r.data)

export const addReview   = (comicId, data) =>
  api.post(`/reviews/${comicId}`, data).then(r => r.data.data)

export const updateReview = (reviewId, data) =>
  api.put(`/reviews/${reviewId}`, data).then(r => r.data.data)

export const deleteReview = (reviewId) =>
  api.delete(`/reviews/${reviewId}`).then(r => r.data)

export const getMyReviewCount = () =>
  api.get('/reviews/my/count').then(r => r.data.data.total)