import {
  query,
  queryOne,
  execute,
  insert,
  transaction,
  buildPagination,
} from '../db/index.js'
import { notFound, conflict, forbidden } from '../utils/AppError.js'

export const getReviewsByComicId = async (comicId, { page = 1, limit = 10 }) => {
  const { limitClause, safePage, safeLimit } = buildPagination(page, limit)

  const reviews = await query(
    `SELECT
       r.ReviewID, r.Rating, r.ReviewText, r.ReviewDate,
       u.UserID, u.Username, u.AvatarURL
     FROM Review r
     INNER JOIN User u ON r.UserID = u.UserID
     WHERE r.ComicID = ?
     ORDER BY r.ReviewDate DESC
     ${limitClause}`,
    [comicId]
  )

  const [countRow] = await query(
    `SELECT COUNT(*) AS total FROM Review WHERE ComicID = ?`,
    [comicId]
  )

  return {
    data:  reviews,
    total: countRow.total,
    page:  safePage,
    limit: safeLimit,
  }
}

export const addReview = async (userId, comicId, { rating, reviewText }) => {
  const existing = await queryOne(
    `SELECT ReviewID FROM Review WHERE UserID = ? AND ComicID = ?`,
    [userId, comicId]
  )
  if (existing) throw conflict('You have already reviewed this comic')

  const reviewId = await transaction(async (conn) => {
    const [insertResult] = await conn.execute(
      `INSERT INTO Review (UserID, ComicID, Rating, ReviewText, ReviewDate)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, comicId, rating, reviewText]
    )
    await conn.execute(
      `UPDATE Comic
       SET AverageRating = (
         SELECT ROUND(AVG(Rating), 1) FROM Review WHERE ComicID = ?
       )
       WHERE ComicID = ?`,
      [comicId, comicId]
    )
    return insertResult.insertId
  })

  return queryOne(
    `SELECT
       r.ReviewID, r.Rating, r.ReviewText, r.ReviewDate,
       u.Username, u.AvatarURL
     FROM Review r
     INNER JOIN User u ON r.UserID = u.UserID
     WHERE r.ReviewID = ?`,
    [reviewId]
  )
}

export const updateReview = async (userId, reviewId, { rating, reviewText }) => {
  const review = await queryOne(
    `SELECT * FROM Review WHERE ReviewID = ?`,
    [reviewId]
  )
  if (!review)                  throw notFound('Review not found')
  if (review.UserID !== userId) throw forbidden('You can only edit your own reviews')

  await transaction(async (conn) => {
    await conn.execute(
      `UPDATE Review SET Rating = ?, ReviewText = ? WHERE ReviewID = ?`,
      [rating, reviewText, reviewId]
    )
    await conn.execute(
      `UPDATE Comic
       SET AverageRating = (
         SELECT ROUND(AVG(Rating), 1) FROM Review WHERE ComicID = ?
       )
       WHERE ComicID = ?`,
      [review.ComicID, review.ComicID]
    )
  })

  return queryOne(
    `SELECT
       r.ReviewID, r.Rating, r.ReviewText, r.ReviewDate,
       u.Username, u.AvatarURL
     FROM Review r
     INNER JOIN User u ON r.UserID = u.UserID
     WHERE r.ReviewID = ?`,
    [reviewId]
  )
}

export const deleteReview = async (userId, reviewId) => {
  const review = await queryOne(
    `SELECT * FROM Review WHERE ReviewID = ?`,
    [reviewId]
  )
  if (!review)                  throw notFound('Review not found')
  if (review.UserID !== userId) throw forbidden('You can only delete your own reviews')

  await transaction(async (conn) => {
    await conn.execute(
      `DELETE FROM Review WHERE ReviewID = ?`,
      [reviewId]
    )
    await conn.execute(
      `UPDATE Comic
       SET AverageRating = (
         SELECT IFNULL(ROUND(AVG(Rating), 1), 0)
         FROM Review WHERE ComicID = ?
       )
       WHERE ComicID = ?`,
      [review.ComicID, review.ComicID]
    )
  })

  return true
}

export const getUserReviewCount = async (userId) => {
  const [row] = await query(
    `SELECT COUNT(*) AS total FROM Review WHERE UserID = ?`,
    [userId]
  )
  return row?.total || 0
}